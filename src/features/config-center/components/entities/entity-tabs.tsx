"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { Skeleton } from "../../../../components/ui/skeleton";
import type {
  Config,
  Environment,
  HistoryItem,
  Project,
  Service,
} from "../../types";
import type { ConfigSection, EntityItem, EntityType } from "../../form-types";
import { ActionButtons } from "../shared/action-buttons";
import { CrudHeader } from "../shared/crud-header";
import { RuntimeHistoryPanel } from "../runtime-history/runtime-history-panel";
import { ServiceConfigsView } from "../service-configs/service-configs-view";

type Props = {
  projects: Project[];
  services: Service[];
  environments: Environment[];
  configs: Config[];
  apiBaseUrl: string;
  loading: Record<EntityType, boolean>;
  runtimeText: string;
  history: HistoryItem[];
  runtimeLoading?: boolean;
  activeSection: ConfigSection;
  onAdd: (type: EntityType) => void;
  onEdit: (type: EntityType, item: EntityItem) => void;
  onDelete: (type: EntityType, id: string) => Promise<void>;
  onHistory: (configId: string) => void;
  onLoadRuntime: () => Promise<void>;
  actions?: ReactNode;
  selectedServiceId: string;
  selectedEnvironmentId: string;
  onSelectService: (serviceId: string) => void;
  onSelectEnvironment: (environmentId: string) => void;
  onSaveConfigValue: (config: Config, value: string) => Promise<void>;
  onBulkSaveConfigs: (
    lines: Array<{ key: string; value: string }>,
  ) => Promise<void>;
};

type Column = {
  field: string;
  headerName: string;
  sortable?: boolean;
  align?: "left" | "right";
  render?: (value: string, row: EntityItem) => ReactNode;
};

function getCellValue(item: EntityItem, field: string): string {
  return String((item as Record<string, unknown>)[field] ?? "");
}

export function EntityTabs(props: Props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");

  const section = props.activeSection as "project" | "service" | "environment";
  const rows =
    section === "project"
      ? props.projects
      : section === "service"
        ? props.services
        : props.environments;

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const aVal = getCellValue(a, orderBy);
      const bVal = getCellValue(b, orderBy);
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, orderBy, order]);

  if (props.activeSection === "config") {
    return (
      <ServiceConfigsView
        services={props.services}
        projects={props.projects}
        environments={props.environments}
        configs={props.configs}
        selectedServiceId={props.selectedServiceId}
        selectedEnvironmentId={props.selectedEnvironmentId}
        loading={props.loading.service || props.loading.config}
        onSelectService={props.onSelectService}
        onSelectEnvironment={props.onSelectEnvironment}
        onAddConfig={() => props.onAdd("config")}
        onEditConfig={(config) => props.onEdit("config", config)}
        onDeleteConfig={(configId) => props.onDelete("config", configId)}
        onSaveConfigValue={props.onSaveConfigValue}
        onBulkSave={props.onBulkSaveConfigs}
        onHistory={props.onHistory}
      />
    );
  }

  if (props.activeSection === "runtime-history") {
    return (
      <section className="content-panel" id="runtime">
        <RuntimeHistoryPanel
          apiBaseUrl={props.apiBaseUrl}
          selectedService={props.services.find(
            (service) => service.id === props.selectedServiceId,
          )}
          selectedEnvironment={props.environments.find(
            (environment) => environment.id === props.selectedEnvironmentId,
          )}
          configs={props.configs}
          runtimeText={props.runtimeText}
          history={props.history}
          loading={props.runtimeLoading}
          onLoadRuntime={props.onLoadRuntime}
          onLoadHistory={() =>
            props.configs[0] && props.onHistory(props.configs[0].id)
          }
        />
      </section>
    );
  }

  const columns: Column[] = [
    { field: "name", headerName: "Name", sortable: true },
    { field: "code", headerName: "Code", sortable: true },
    ...(section === "service"
      ? [
          {
            field: "type",
            headerName: "Type",
            render: (value: string) => (
              <Chip
                label={value}
                size="small"
                variant="outlined"
                color="primary"
              />
            ),
          } satisfies Column,
          {
            field: "projectId",
            headerName: "Project",
            render: (projectId: string) =>
              props.projects.find((project) => project.id === projectId)
                ?.name ?? projectId,
          } satisfies Column,
        ]
      : [
          {
            field: "description",
            headerName: "Description",
            render: (value: string) => (
              <Box
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 300,
                }}
              >
                {value}
              </Box>
            ),
          } satisfies Column,
        ]),
    {
      field: "actions",
      headerName: "Actions",
      align: "right",
      render: (_value, row) => (
        <ActionButtons
          type={section}
          row={row}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
          onHistory={props.onHistory}
        />
      ),
    },
  ];

  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  if (props.loading[section]) {
    return (
      <section
        className="content-panel"
        data-testid={`entity-section-${section}`}
      >
        <CrudHeader
          onAdd={() => props.onAdd(section)}
          actions={props.actions}
        />
        <EntityTableSkeleton />
      </section>
    );
  }

  return (
    <section
      className="content-panel"
      data-testid={`entity-section-${section}`}
    >
      <CrudHeader onAdd={() => props.onAdd(section)} actions={props.actions} />
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table
            size="medium"
            stickyHeader
            aria-label={`Entity table for ${section}`}
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    sortDirection={orderBy === column.field ? order : false}
                    align={column.align ?? "left"}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={orderBy === column.field}
                        direction={orderBy === column.field ? order : "asc"}
                        onClick={() => handleRequestSort(column.field)}
                      >
                        {column.headerName}
                      </TableSortLabel>
                    ) : (
                      column.headerName
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ "&:last-child td": { borderBottom: "none" } }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      align={column.align ?? "left"}
                    >
                      {column.render
                        ? column.render(getCellValue(row, column.field), row)
                        : getCellValue(row, column.field)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </section>
  );
}

function EntityTableSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: "divider" }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.9fr 1.3fr 0.8fr",
            gap: 2,
            alignItems: "center",
            py: 1.5,
            borderBottom: index < 5 ? "1px solid" : "none",
            borderColor: "divider",
          }}
        >
          <Skeleton width="80%" height="1rem" />
          <Skeleton width="70%" height="1rem" />
          <Skeleton width="90%" height="1rem" />
          <Skeleton width="60%" height="1rem" />
        </Box>
      ))}
    </Paper>
  );
}
