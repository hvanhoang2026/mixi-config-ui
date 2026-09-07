import { Table, Tag, type TableColumnsType } from "antd";
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
  actions?: React.ReactNode;
  selectedServiceId: string;
  selectedEnvironmentId: string;
  onSelectService: (serviceId: string) => void;
  onSelectEnvironment: (environmentId: string) => void;
  onSaveConfigValue: (config: Config, value: string) => Promise<void>;
  onBulkSaveConfigs: (
    lines: Array<{ key: string; value: string }>,
  ) => Promise<void>;
};

export function EntityTabs(props: Props) {
  const actions = (type: EntityType, row: EntityItem) => (
    <ActionButtons
      type={type}
      row={row}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onHistory={props.onHistory}
    />
  );

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

  const section = props.activeSection as "project" | "service" | "environment";
  const rows =
    section === "project"
      ? props.projects
      : section === "service"
        ? props.services
        : props.environments;

  const commonColumns: TableColumnsType<EntityItem> = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) =>
        String((a as { name?: string }).name ?? "").localeCompare(
          String((b as { name?: string }).name ?? ""),
        ),
    },
    {
      title: "Code",
      dataIndex: "code",
      sorter: (a, b) =>
        String((a as { code?: string }).code ?? "").localeCompare(
          String((b as { code?: string }).code ?? ""),
        ),
    },
  ];
  const columns: TableColumnsType<EntityItem> = [
    ...commonColumns,
    ...(section === "service"
      ? [
          {
            title: "Type",
            dataIndex: "type",
            render: (value: string) => <Tag color="cyan">{value}</Tag>,
          },
          {
            title: "Project",
            dataIndex: "projectId",
            render: (projectId: string) =>
              props.projects.find((project) => project.id === projectId)
                ?.name ?? projectId,
          },
        ]
      : [
          {
            title: "Description",
            dataIndex: "description",
            ellipsis: true,
          },
        ]),
    {
      title: "Actions",
      key: "actions",
      width: 132,
      align: "right",
      render: (_, row) => actions(section, row),
    },
  ];

  return (
    <section
      className="content-panel"
      data-testid={`entity-section-${section}`}
    >
      <CrudHeader onAdd={() => props.onAdd(section)} actions={props.actions} />
      {props.loading[section] ? (
        <EntityTableSkeleton />
      ) : (
        <Table<EntityItem>
          dataSource={rows}
          columns={columns}
          rowKey="id"
          size="middle"
          scroll={{ x: 720 }}
          locale={{ emptyText: "No records found" }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20, 50],
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`,
          }}
        />
      )}
    </section>
  );
}

function EntityTableSkeleton() {
  return (
    <div className="entity-table-skeleton" aria-label="Loading records">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="entity-table-skeleton__row">
          <Skeleton width="22%" height="1rem" />
          <Skeleton width="18%" height="1rem" />
          <Skeleton width="26%" height="1rem" />
          <Skeleton width="16%" height="1rem" />
        </div>
      ))}
    </div>
  );
}
