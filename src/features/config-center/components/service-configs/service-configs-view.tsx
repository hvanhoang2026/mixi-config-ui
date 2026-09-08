import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  CloudServerOutlined,
  CodeOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  HistoryOutlined,
  PlusOutlined,
  SaveOutlined,
  SettingOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Button, Input, Modal, Select, Table, Tooltip } from "antd";
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
  const [bulkSaving, setBulkSaving] = useState(false);
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

  const visibleConfigs = localConfigs.filter((config) => {
    const normalizedKeyFilter = keyFilter.trim().toLowerCase();
    const normalizedDescriptionFilter = descriptionFilter.trim().toLowerCase();
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

  if (!detailOpen || !selectedService) {
    return (
      <section
        className="content-panel service-configs"
        data-testid="service-configs-list"
      >
        <div
          data-testid="auto-service-configs-view-1-div"
          className="service-configs__header service-configs__header--list"
        >
          <div data-testid="auto-service-configs-view-2-div">
            <h2 data-testid="auto-service-configs-view-3-h2">
              Service Configs
            </h2>
            <p data-testid="auto-service-configs-view-4-p">
              Select a service to manage environment-specific config values.
            </p>
          </div>
        </div>

        {loading ? (
          <ServiceListSkeleton />
        ) : (
          <Table<Service>
            dataSource={services}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            className="service-configs__table"
            locale={{ emptyText: "No services found" }}
            onRow={(service) => ({
              className: "service-configs__service-row",
              onClick: () => {
                onSelectService(service.id);
                setDetailOpen(true);
              },
            })}
            columns={[
              {
                title: "Service",
                dataIndex: "name",
                sorter: (a, b) => a.name.localeCompare(b.name),
              },
              {
                title: "Code",
                dataIndex: "code",
                sorter: (a, b) => a.code.localeCompare(b.code),
              },
              {
                title: "Project",
                dataIndex: "projectId",
                render: (projectId: string) =>
                  projects.find((project) => project.id === projectId)?.name ??
                  projectId,
              },
              { title: "Type", dataIndex: "type" },
              {
                title: "",
                key: "open",
                width: 64,
                align: "right",
                render: (_, service) => (
                  <Tooltip title="Open configurations">
                    <Button
                      type="text"
                      shape="circle"
                      icon={<ArrowRightOutlined />}
                      data-testid={`open-configs-${service.code}`}
                      aria-label={`Open configs for ${service.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectService(service.id);
                        setDetailOpen(true);
                      }}
                    />
                  </Tooltip>
                ),
              },
            ]}
          />
        )}
      </section>
    );
  }

  return (
    <section
      className="content-panel service-configs"
      data-testid="service-configs-view"
    >
      <div
        data-testid="auto-service-configs-view-5-div"
        className="service-configs__detail-hero"
      >
        <div
          data-testid="auto-service-configs-view-6-div"
          className="service-configs__title-block"
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="service-configs__back"
            onClick={() => setDetailOpen(false)}
          >
            Services
          </Button>
          <div
            data-testid="auto-service-configs-view-7-div"
            className="service-configs__service-mark"
            aria-hidden="true"
          >
            <CloudServerOutlined data-testid="auto-service-configs-view-8-i" />
          </div>
          <div data-testid="auto-service-configs-view-9-div">
            <h2 data-testid="auto-service-configs-view-10-h2">
              {selectedService.name}
            </h2>
            <p data-testid="auto-service-configs-view-11-p">
              {selectedService.description ||
                "Manage scoped configuration values."}
            </p>
          </div>
        </div>
        <div
          data-testid="auto-service-configs-view-12-div"
          className="service-configs__tools"
        >
          <Select
            options={environments.map((environment) => ({
              label: environment.name,
              value: environment.id,
            }))}
            value={selectedEnvironmentId || undefined}
            onChange={onSelectEnvironment}
            placeholder="Environment"
            data-testid="service-configs-environment-selector"
            className="service-configs__environment"
            showSearch
            allowClear
            notFoundContent="Không tìm thấy"
            getPopupContainer={() => document.body}
            popupMatchSelectWidth
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            data-testid="service-configs-add-button"
            className="service-configs__add-button"
            onClick={onAddConfig}
          >
            Add config
          </Button>
        </div>
      </div>

      <div
        data-testid="auto-service-configs-view-13-div"
        className="service-configs__scope-bar"
      >
        <span data-testid="auto-service-configs-view-14-span">
          <ToolOutlined data-testid="auto-service-configs-view-15-i" />
          {selectedProject?.name ?? selectedService.projectId}
        </span>
        <span data-testid="auto-service-configs-view-16-span">
          <CodeOutlined data-testid="auto-service-configs-view-17-i" />
          {selectedService.code}
        </span>
        <span data-testid="auto-service-configs-view-18-span">
          <GlobalOutlined data-testid="auto-service-configs-view-19-i" />
          {selectedEnvironment?.name ?? "No environment selected"}
        </span>
        <span data-testid="auto-service-configs-view-20-span">
          <SettingOutlined data-testid="auto-service-configs-view-21-i" />
          {localConfigs.length} configs
        </span>
      </div>

      <div
        data-testid="auto-service-configs-view-22-div"
        className="service-configs__grid"
      >
        <div
          data-testid="auto-service-configs-view-23-div"
          className="service-configs__config-table"
        >
          {loading ? (
            <ServiceConfigDetailSkeleton />
          ) : (
            <>
              <div className="service-configs__filters">
                <Input.Search
                  data-testid="config-key-filter-input"
                  value={keyFilter}
                  allowClear
                  placeholder="Filter by key"
                  onChange={(event) => setKeyFilter(event.target.value)}
                />
                <Input.Search
                  data-testid="config-description-filter-input"
                  value={descriptionFilter}
                  allowClear
                  placeholder="Filter by description"
                  onChange={(event) => setDescriptionFilter(event.target.value)}
                />
              </div>
              <Table<Config>
                data-testid="service-config-table"
                dataSource={visibleConfigs}
                rowKey="id"
                pagination={false}
                scroll={{ x: 760 }}
                locale={{
                  emptyText: (
                    <ServiceConfigEmptyState onAddConfig={onAddConfig} />
                  ),
                }}
                columns={[
                  {
                    title: "Key",
                    dataIndex: "key",
                    width: 190,
                    sorter: (a, b) => a.key.localeCompare(b.key),
                  },
                  {
                    title: "Value",
                    dataIndex: "value",
                    width: 280,
                    render: (_, row) => (
                      <Input
                        data-testid={`config-value-input-${row.key}`}
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
                        className="service-configs__value-input"
                      />
                    ),
                  },
                  {
                    title: "Description",
                    dataIndex: "description",
                    ellipsis: true,
                  },
                  {
                    title: "Save",
                    key: "save",
                    width: 72,
                    align: "center",
                    render: (_, row) => {
                      const isSaving = savingConfigId === row.id;
                      const isSaved = savedConfigId === row.id;
                      return (
                        <Tooltip title={isSaved ? "Saved" : "Save value"}>
                          <Button
                            type="text"
                            shape="circle"
                            loading={isSaving}
                            disabled={
                              (savingConfigId !== null && !isSaving) ||
                              deletingConfigId !== null
                            }
                            data-testid={`save-config-${row.key}`}
                            aria-label={`Save ${row.key}`}
                            className={isSaved ? "is-success" : undefined}
                            icon={
                              isSaved ? <CheckOutlined /> : <SaveOutlined />
                            }
                            onClick={() => saveConfigValue(row)}
                          />
                        </Tooltip>
                      );
                    },
                  },
                  {
                    title: "Actions",
                    key: "actions",
                    width: 128,
                    align: "right",
                    render: (_, row) => (
                      <div className="config-row-actions">
                        <Tooltip title="Edit config">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            disabled={
                              savingConfigId !== null ||
                              deletingConfigId !== null
                            }
                            onClick={() => onEditConfig(row)}
                          />
                        </Tooltip>
                        <Tooltip title="View history">
                          <Button
                            type="text"
                            size="small"
                            icon={<HistoryOutlined />}
                            disabled={
                              savingConfigId !== null ||
                              deletingConfigId !== null
                            }
                            onClick={() => onHistory(row.id)}
                          />
                        </Tooltip>
                        <Tooltip title="Delete config">
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            danger
                            loading={deletingConfigId === row.id}
                            disabled={
                              savingConfigId !== null ||
                              deletingConfigId !== null
                            }
                            onClick={() =>
                              Modal.confirm({
                                title: "Delete config?",
                                icon: <ExclamationCircleOutlined />,
                                content: `Delete key "${row.key}"? This action cannot be undone.`,
                                okText: "Delete",
                                okType: "danger",
                                cancelText: "Cancel",
                                centered: true,
                                onOk: () => deleteConfig(row.id),
                              })
                            }
                          />
                        </Tooltip>
                      </div>
                    ),
                  },
                ]}
              />
            </>
          )}
        </div>

        <div
          data-testid="auto-service-configs-view-49-div"
          className="service-configs__bulk"
        >
          <div
            data-testid="auto-service-configs-view-50-div"
            className="service-configs__bulk-header"
          >
            <div data-testid="auto-service-configs-view-51-div">
              <h3 data-testid="auto-service-configs-view-52-h3">Bulk edit</h3>
              <p data-testid="auto-service-configs-view-53-p">
                Paste multiple values in env format.
              </p>
            </div>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              data-testid="save-bulk-config-button"
              loading={bulkSaving}
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
          </div>
          {loading ? (
            <div
              data-testid="auto-service-configs-view-54-div"
              className="service-configs__bulk-input service-configs__bulk-input--skeleton"
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton
                  key={index}
                  width={index === 7 ? "65%" : "100%"}
                  height="0.95rem"
                />
              ))}
            </div>
          ) : (
            <Input.TextArea
              data-testid="bulk-config-input"
              value={bulkText}
              onChange={(event) => setBulkText(event.target.value)}
              rows={12}
              placeholder={
                "DATABASE_URL=postgres://...\nJWT_SECRET=change-me\nFEATURE_FLAG=true"
              }
              className="ui-full-width service-configs__bulk-input"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ServiceConfigEmptyState({ onAddConfig }: { onAddConfig: () => void }) {
  return (
    <div
      data-testid="auto-service-configs-view-55-div"
      className="service-configs__empty"
    >
      <div
        data-testid="auto-service-configs-view-56-div"
        className="service-configs__empty-icon"
      >
        <SettingOutlined data-testid="auto-service-configs-view-57-i" />
      </div>
      <strong data-testid="auto-service-configs-view-58-strong">
        No configs in this environment
      </strong>
      <span data-testid="auto-service-configs-view-59-span">
        Create the first config or paste multiple KEY=value lines below.
      </span>
      <Button
        type="primary"
        data-testid="empty-state-add-config-button"
        icon={<PlusOutlined />}
        size="small"
        onClick={onAddConfig}
      >
        Add config
      </Button>
    </div>
  );
}

function ServiceListSkeleton() {
  return (
    <div
      data-testid="auto-service-configs-view-60-div"
      className="service-configs__table service-configs__table--skeleton"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          data-testid="auto-service-configs-view-61-div"
          key={index}
          className="service-configs__table-skeleton-row"
        >
          <Skeleton width="24%" height="1rem" />
          <Skeleton width="18%" height="1rem" />
          <Skeleton width="22%" height="1rem" />
          <Skeleton width="14%" height="1rem" />
          <Skeleton shape="circle" size="2rem" />
        </div>
      ))}
    </div>
  );
}

function ServiceConfigDetailSkeleton() {
  return (
    <div
      data-testid="auto-service-configs-view-62-div"
      className="service-configs__detail-skeleton"
    >
      <div
        data-testid="auto-service-configs-view-63-div"
        className="service-configs__detail-skeleton-row service-configs__detail-skeleton-row--header"
      >
        <Skeleton width="22%" height="1rem" />
        <Skeleton width="30%" height="1rem" />
        <Skeleton width="24%" height="1rem" />
        <Skeleton width="3rem" height="1rem" />
        <Skeleton width="6rem" height="1rem" />
      </div>
      <div
        data-testid="auto-service-configs-view-64-div"
        className="service-configs__detail-skeleton-row service-configs__detail-skeleton-row--filters"
      >
        <Skeleton width="100%" height="2.5rem" />
        <div data-testid="auto-service-configs-view-65-div" />
        <Skeleton width="100%" height="2.5rem" />
        <div data-testid="auto-service-configs-view-66-div" />
        <div data-testid="auto-service-configs-view-67-div" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          data-testid="auto-service-configs-view-68-div"
          key={index}
          className="service-configs__detail-skeleton-row"
        >
          <Skeleton width="80%" height="1rem" />
          <Skeleton width="100%" height="2.5rem" />
          <Skeleton width="90%" height="1rem" />
          <Skeleton shape="circle" size="2rem" />
          <div
            data-testid="auto-service-configs-view-69-div"
            className="service-configs__detail-skeleton-actions"
          >
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
            <Skeleton shape="circle" size="2rem" />
          </div>
        </div>
      ))}
    </div>
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
