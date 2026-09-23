"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowBack,
  ArrowForward,
  Check,
  Cloud,
  Code,
  Delete,
  Edit,
  History,
  Lock,
  LockOpen,
  Search,
  Add,
  Save,
  Settings,
  Build,
  Public,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Skeleton } from "../../../../components/ui/skeleton";
import type { Config, Environment, Project, Service } from "../../types";

type Props = {
  services: Service[];
  projects: Project[];
  environments: Environment[];
  configs: Config[];
  selectedServiceId: string;
  selectedEnvironmentId: string;
  loading: boolean;
  onSelectService: (serviceId: string) => void;
  onSelectEnvironment: (environmentId: string) => void;
  onAddConfig: () => void;
  onEditConfig: (config: Config) => void;
  onDeleteConfig: (configId: string) => Promise<void>;
  onSaveConfigValue: (config: Config, value: string) => Promise<void>;
  onBulkSave: (lines: Array<{ key: string; value: string }>) => Promise<void>;
  onHistory: (configId: string) => void;
};

export function ServiceConfigsView({
  services,
  projects,
  environments,
  configs,
  selectedServiceId,
  selectedEnvironmentId,
  loading,
  onSelectService,
  onSelectEnvironment,
  onAddConfig,
  onEditConfig,
  onDeleteConfig,
  onSaveConfigValue,
  onBulkSave,
  onHistory,
}: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [localConfigs, setLocalConfigs] = useState<Config[]>([]);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [bulkText, setBulkText] = useState("");
  const [keyFilter, setKeyFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [savingConfigId, setSavingConfigId] = useState<string | null>(null);
  const [savedConfigId, setSavedConfigId] = useState<string | null>(null);
  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Config | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [servicePage, setServicePage] = useState(0);
  const [serviceRowsPerPage, setServiceRowsPerPage] = useState(10);
  const [serviceOrder, setServiceOrder] = useState<"asc" | "desc">("asc");
  const [serviceOrderBy, setServiceOrderBy] = useState<"name" | "code">("name");
  const [configOrder, setConfigOrder] = useState<"asc" | "desc">("asc");
  const [revealedConfigIds, setRevealedConfigIds] = useState<Set<string>>(
    new Set(),
  );
  const dirtyConfigIdsRef = useRef<Set<string>>(new Set());
  const successTimerRef = useRef<number | null>(null);

  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );
  const selectedEnvironment = environments.find(
    (environment) => environment.id === selectedEnvironmentId,
  );
  const selectedProject = selectedService
    ? projects.find((project) => project.id === selectedService.projectId)
    : undefined;

  const serviceConfigs = useMemo(
    () =>
      configs.filter((config) => {
        if (selectedServiceId && config.serviceId !== selectedServiceId)
          return false;
        if (
          selectedEnvironmentId &&
          config.environmentId !== selectedEnvironmentId
        )
          return false;
        return true;
      }),
    [configs, selectedEnvironmentId, selectedServiceId],
  );

  useEffect(() => {
    const visibleIds = new Set(serviceConfigs.map((config) => config.id));
    dirtyConfigIdsRef.current = new Set(
      [...dirtyConfigIdsRef.current].filter((id) => visibleIds.has(id)),
    );
    setLocalConfigs((current) =>
      serviceConfigs.map((config) => {
        const currentConfig = current.find((item) => item.id === config.id);
        return dirtyConfigIdsRef.current.has(config.id) && currentConfig
          ? { ...config, value: currentConfig.value }
          : config;
      }),
    );
    setDraftValues((current) => {
      const next: Record<string, string> = {};
      for (const config of serviceConfigs) {
        next[config.id] = dirtyConfigIdsRef.current.has(config.id)
          ? (current[config.id] ?? config.value)
          : config.value;
      }
      return next;
    });
    setBulkText(
      serviceConfigs
        .map((config) => `${config.key}=${config.value}`)
        .join("\n"),
    );
  }, [serviceConfigs]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    };
  }, []);

  const saveConfigValue = async (config: Config) => {
    const nextValue = draftValues[config.id] ?? config.value ?? "";
    setSavingConfigId(config.id);
    setSavedConfigId(null);
    try {
      await Promise.all([
        onSaveConfigValue(config, nextValue),
        new Promise((resolve) => window.setTimeout(resolve, 350)),
      ]);
      setLocalConfigs((current) =>
        current.map((item) =>
          item.id === config.id ? { ...item, value: nextValue } : item,
        ),
      );
      setDraftValues((current) => ({ ...current, [config.id]: nextValue }));
      dirtyConfigIdsRef.current.delete(config.id);
      setSavedConfigId(config.id);
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
      successTimerRef.current = window.setTimeout(() => {
        setSavedConfigId((current) => (current === config.id ? null : current));
        successTimerRef.current = null;
      }, 1400);
    } finally {
      setSavingConfigId(null);
    }
  };

  const deleteConfig = async (configId: string) => {
    setDeletingConfigId(configId);
    try {
      await onDeleteConfig(configId);
    } finally {
      setDeletingConfigId(null);
      setDeleteTarget(null);
    }
  };

  const saveBulkConfigs = async () => {
    setBulkSaving(true);
    try {
      await onBulkSave(parseBulkConfig(bulkText));
    } finally {
      setBulkSaving(false);
    }
  };

  const visibleConfigs = useMemo(() => {
    const normalizedKeyFilter = keyFilter.trim().toLowerCase();
    const normalizedDescriptionFilter = descriptionFilter.trim().toLowerCase();
    const filtered = localConfigs.filter((config) => {
      if (
        normalizedKeyFilter &&
        !config.key.toLowerCase().includes(normalizedKeyFilter)
      )
        return false;
      if (
        normalizedDescriptionFilter &&
        !(config.description ?? "")
          .toLowerCase()
          .includes(normalizedDescriptionFilter)
      ) {
        return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) =>
      configOrder === "asc"
        ? a.key.localeCompare(b.key)
        : b.key.localeCompare(a.key),
    );
  }, [localConfigs, keyFilter, descriptionFilter, configOrder]);

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const aVal = serviceOrderBy === "name" ? a.name : a.code;
      const bVal = serviceOrderBy === "name" ? b.name : b.code;
      return serviceOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [services, serviceOrder, serviceOrderBy]);

  const paginatedServices = sortedServices.slice(
    servicePage * serviceRowsPerPage,
    servicePage * serviceRowsPerPage + serviceRowsPerPage,
  );

  const openServiceDetail = (serviceId: string) => {
    onSelectService(serviceId);
    setDetailOpen(true);
  };

  if (!detailOpen || !selectedService) {
    return (
      <section
        className="content-panel service-configs"
        data-testid="service-configs-list"
      >
        <div className="service-configs__header service-configs__header--list">
          <div>
            <Typography variant="h5" component="h2" fontWeight={700}>
              Service Configs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a service to manage environment-specific config values.
            </Typography>
          </div>
        </div>

        {loading ? (
          <ServiceListSkeleton />
        ) : (
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <TableContainer>
              <Table aria-label="Service list">
                <TableHead>
                  <TableRow>
                    {(["name", "code"] as const).map((field) => (
                      <TableCell
                        key={field}
                        sortDirection={
                          serviceOrderBy === field ? serviceOrder : false
                        }
                      >
                        <TableSortLabel
                          active={serviceOrderBy === field}
                          direction={
                            serviceOrderBy === field ? serviceOrder : "asc"
                          }
                          onClick={() => {
                            const isAsc =
                              serviceOrderBy === field &&
                              serviceOrder === "asc";
                            setServiceOrder(isAsc ? "desc" : "asc");
                            setServiceOrderBy(field);
                          }}
                        >
                          {field === "name" ? "Service" : "Code"}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell>Project</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right" width={64} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedServices.map((service) => (
                    <TableRow
                      key={service.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => openServiceDetail(service.id)}
                    >
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.code}</TableCell>
                      <TableCell>
                        {projects.find(
                          (project) => project.id === service.projectId,
                        )?.name ?? service.projectId}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Open configurations">
                          <IconButton
                            size="small"
                            data-testid={`open-configs-${service.code}`}
                            aria-label={`Open configs for ${service.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              openServiceDetail(service.id);
                            }}
                          >
                            <ArrowForward fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedServices.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={{ py: 4, color: "text.secondary" }}
                      >
                        No services found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 50]}
              component="div"
              count={services.length}
              rowsPerPage={serviceRowsPerPage}
              page={servicePage}
              onPageChange={(_event, newPage) => setServicePage(newPage)}
              onRowsPerPageChange={(event) => {
                setServiceRowsPerPage(parseInt(event.target.value, 10));
                setServicePage(0);
              }}
            />
          </Paper>
        )}
      </section>
    );
  }

  return (
    <section
      className="content-panel service-configs"
      data-testid="service-configs-view"
    >
      <div className="service-configs__detail-hero">
        <div className="service-configs__title-block">
          <Button
            variant="text"
            size="small"
            startIcon={<ArrowBack />}
            onClick={() => setDetailOpen(false)}
            sx={{ gridColumn: "1 / -1", justifySelf: "start" }}
          >
            Services
          </Button>
          <Box
            className="service-configs__service-mark"
            aria-hidden="true"
            sx={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              backgroundColor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            <Cloud />
          </Box>
          <div>
            <Typography className="service-configs__eyebrow" component="p">
              Configuration workspace
            </Typography>
            <Typography variant="h5" component="h2" fontWeight={700}>
              {selectedService.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedService.description ||
                "Manage scoped configuration values."}
            </Typography>
          </div>
        </div>
        <div className="service-configs__tools">
          <TextField
            select
            size="small"
            value={selectedEnvironmentId || ""}
            onChange={(e) => onSelectEnvironment(e.target.value)}
            SelectProps={{ native: true }}
            inputProps={{
              "data-testid": "service-configs-environment-selector",
            }}
            sx={{ minWidth: 200 }}
          >
            <option value="">Environment</option>
            {environments.map((environment) => (
              <option key={environment.id} value={environment.id}>
                {environment.name}
              </option>
            ))}
          </TextField>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            data-testid="service-configs-add-button"
            onClick={onAddConfig}
          >
            Add config
          </Button>
        </div>
      </div>

      <div className="service-configs__scope-bar">
        <Chip
          icon={<Build />}
          label={selectedProject?.name ?? selectedService.projectId}
          variant="outlined"
        />
        <Chip icon={<Code />} label={selectedService.code} variant="outlined" />
        <Chip
          icon={<Public />}
          label={selectedEnvironment?.name ?? "No environment selected"}
          variant="outlined"
        />
        <Chip
          icon={<Settings />}
          label={`${localConfigs.length} configs`}
          variant="outlined"
        />
      </div>

      <div className="service-configs__grid">
        <div className="service-configs__config-table">
          {loading ? (
            <ServiceConfigDetailSkeleton />
          ) : (
            <>
              <Box className="service-configs__table-toolbar">
                <Box className="service-configs__table-summary">
                  <Typography variant="subtitle1" fontWeight={700}>
                    Environment values
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {visibleConfigs.length} of {localConfigs.length} values
                    shown
                  </Typography>
                </Box>
                <TextField
                  size="small"
                  value={keyFilter}
                  onChange={(event) => setKeyFilter(event.target.value)}
                  placeholder="Search key"
                  inputProps={{ "data-testid": "config-key-filter-input" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 220, flex: "1 1 220px" }}
                />
                <TextField
                  size="small"
                  value={descriptionFilter}
                  onChange={(event) => setDescriptionFilter(event.target.value)}
                  placeholder="Search description"
                  inputProps={{
                    "data-testid": "config-description-filter-input",
                  }}
                  sx={{ minWidth: 220, flex: "1 1 220px" }}
                />
              </Box>
              <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
                  <Table
                    size="medium"
                    stickyHeader
                    data-testid="service-config-table"
                    aria-label="Service config values"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sortDirection={configOrder} width={250}>
                          <TableSortLabel
                            active
                            direction={configOrder}
                            onClick={() =>
                              setConfigOrder((prev) =>
                                prev === "asc" ? "desc" : "asc",
                              )
                            }
                          >
                            Key
                          </TableSortLabel>
                        </TableCell>
                        <TableCell width={360}>Value</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="center" width={72}>
                          Save
                        </TableCell>
                        <TableCell align="right" width={128}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleConfigs.map((row) => {
                        const isSaving = savingConfigId === row.id;
                        const isSaved = savedConfigId === row.id;
                        const busy =
                          savingConfigId !== null || deletingConfigId !== null;
                        return (
                          <TableRow
                            key={row.id}
                            hover
                            className="service-configs__config-row"
                          >
                            <TableCell>
                              <Typography
                                component="code"
                                className="service-configs__config-key"
                              >
                                {row.key}
                              </Typography>
                              <Chip
                                size="small"
                                icon={
                                  row.isSecret ? (
                                    <Lock fontSize="small" />
                                  ) : undefined
                                }
                                label={row.isSecret ? "Secret" : "Value"}
                                className={
                                  row.isSecret
                                    ? "service-configs__sensitivity service-configs__sensitivity--secret"
                                    : "service-configs__sensitivity"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                type={
                                  row.isSecret && !revealedConfigIds.has(row.id)
                                    ? "password"
                                    : "text"
                                }
                                value={draftValues[row.id] ?? row.value ?? ""}
                                onChange={(event) => {
                                  const nextValue = event.target.value;
                                  setDraftValues((current) => ({
                                    ...current,
                                    [row.id]: nextValue,
                                  }));
                                  setLocalConfigs((current) =>
                                    current.map((item) =>
                                      item.id === row.id
                                        ? { ...item, value: nextValue }
                                        : item,
                                    ),
                                  );
                                  dirtyConfigIdsRef.current.add(row.id);
                                  setSavedConfigId((current) =>
                                    current === row.id ? null : current,
                                  );
                                }}
                                InputProps={{
                                  endAdornment: row.isSecret ? (
                                    <InputAdornment position="end">
                                      <Tooltip
                                        title={
                                          revealedConfigIds.has(row.id)
                                            ? "Hide secret"
                                            : "Reveal secret"
                                        }
                                      >
                                        <IconButton
                                          edge="end"
                                          size="small"
                                          aria-label={`${revealedConfigIds.has(row.id) ? "Hide" : "Reveal"} ${row.key}`}
                                          onClick={() =>
                                            setRevealedConfigIds((current) => {
                                              const next = new Set(current);
                                              if (next.has(row.id))
                                                next.delete(row.id);
                                              else next.add(row.id);
                                              return next;
                                            })
                                          }
                                        >
                                          {revealedConfigIds.has(row.id) ? (
                                            <LockOpen fontSize="small" />
                                          ) : (
                                            <Lock fontSize="small" />
                                          )}
                                        </IconButton>
                                      </Tooltip>
                                    </InputAdornment>
                                  ) : undefined,
                                }}
                                inputProps={{
                                  "data-testid": `config-value-input-${row.key}`,
                                  style: { fontFamily: "monospace" },
                                }}
                              />
                            </TableCell>
                            <TableCell
                              sx={{
                                maxWidth: 280,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.description}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={isSaved ? "Saved" : "Save value"}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color={isSaved ? "success" : "primary"}
                                    disabled={
                                      (savingConfigId !== null && !isSaving) ||
                                      deletingConfigId !== null
                                    }
                                    data-testid={`save-config-${row.key}`}
                                    aria-label={`Save ${row.key}`}
                                    onClick={() => saveConfigValue(row)}
                                  >
                                    {isSaved ? (
                                      <Check fontSize="small" />
                                    ) : (
                                      <Save fontSize="small" />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 0.5,
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Tooltip title="Edit config">
                                  <span>
                                    <IconButton
                                      size="small"
                                      disabled={busy}
                                      aria-label={`Edit ${row.key}`}
                                      onClick={() => onEditConfig(row)}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="View history">
                                  <span>
                                    <IconButton
                                      size="small"
                                      disabled={busy}
                                      aria-label={`History of ${row.key}`}
                                      onClick={() => onHistory(row.id)}
                                    >
                                      <History fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Delete config">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      disabled={busy}
                                      aria-label={`Delete ${row.key}`}
                                      onClick={() => setDeleteTarget(row)}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {visibleConfigs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <ServiceConfigEmptyState
                              onAddConfig={onAddConfig}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </div>

        <div className="service-configs__bulk">
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <div>
              <Typography variant="h6" component="h3" fontWeight={600}>
                Bulk edit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paste multiple values in env format.
              </Typography>
            </div>
            <Button
              variant="contained"
              size="small"
              startIcon={<Save />}
              data-testid="save-bulk-config-button"
              disabled={
                loading ||
                bulkSaving ||
                savingConfigId !== null ||
                deletingConfigId !== null
              }
              onClick={saveBulkConfigs}
            >
              {bulkSaving ? "Saving..." : "Save bulk"}
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: "grid", gap: 1, mt: 2 }}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton
                  key={index}
                  width={index === 7 ? "65%" : "100%"}
                  height="0.95rem"
                />
              ))}
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={12}
              value={bulkText}
              onChange={(event) => setBulkText(event.target.value)}
              placeholder={
                "DATABASE_URL=postgres://...\nJWT_SECRET=change-me\nFEATURE_FLAG=true"
              }
              inputProps={{ "data-testid": "bulk-config-input" }}
              sx={{ mt: 2, "& textarea": { fontFamily: "monospace" } }}
            />
          )}
        </div>
      </div>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete config?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Delete key &quot;{deleteTarget?.key}&quot;? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deletingConfigId !== null}
            onClick={() => deleteTarget && deleteConfig(deleteTarget.id)}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

function ServiceConfigEmptyState({ onAddConfig }: { onAddConfig: () => void }) {
  return (
    <Box
      sx={{
        minHeight: 192,
        display: "grid",
        placeItems: "center",
        gap: 1,
        p: 3,
        color: "text.secondary",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          backgroundColor: "primary.light",
          color: "primary.contrastText",
        }}
      >
        <Settings />
      </Box>
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        No configs in this environment
      </Typography>
      <Typography variant="body2">
        Create the first config or paste multiple KEY=value lines below.
      </Typography>
      <Button
        variant="contained"
        data-testid="empty-state-add-config-button"
        startIcon={<Add />}
        size="small"
        onClick={onAddConfig}
      >
        Add config
      </Button>
    </Box>
  );
}

function ServiceListSkeleton() {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1.2fr 0.8fr 2rem",
            gap: 2,
            alignItems: "center",
            py: 1.5,
            borderBottom: index < 5 ? "1px solid" : "none",
            borderColor: "divider",
          }}
        >
          <Skeleton width="80%" height="1rem" />
          <Skeleton width="70%" height="1rem" />
          <Skeleton width="85%" height="1rem" />
          <Skeleton width="60%" height="1rem" />
          <Skeleton shape="circle" size="2rem" />
        </Box>
      ))}
    </Paper>
  );
}

function ServiceConfigDetailSkeleton() {
  return (
    <Box sx={{ py: 1 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "30% 32% 1fr 6rem 10rem",
          gap: 2,
          alignItems: "center",
          p: 2,
          backgroundColor: "action.hover",
        }}
      >
        <Skeleton width="70%" height="1rem" />
        <Skeleton width="90%" height="1rem" />
        <Skeleton width="80%" height="1rem" />
        <Skeleton width="3rem" height="1rem" />
        <Skeleton width="6rem" height="1rem" />
      </Box>
      {Array.from({ length: 5 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "grid",
            gridTemplateColumns: "30% 32% 1fr 6rem 10rem",
            gap: 2,
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Skeleton width="80%" height="1rem" />
          <Skeleton width="100%" height="2.5rem" />
          <Skeleton width="90%" height="1rem" />
          <Skeleton shape="circle" size="2rem" />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function parseBulkConfig(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return { key: line, value: "" };
      return {
        key: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1),
      };
    })
    .filter((item) => item.key);
}
