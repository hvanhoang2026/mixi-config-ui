import { useEffect, useMemo, useRef, useState } from 'react';
import { Column, DataTable } from '@w-iris/react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Skeleton } from 'primereact/skeleton';
import type { Config, Environment, Project, Service } from '../../types';

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
  const [bulkText, setBulkText] = useState('');
  const [keyFilter, setKeyFilter] = useState('');
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [savingConfigId, setSavingConfigId] = useState<string | null>(null);
  const [savedConfigId, setSavedConfigId] = useState<string | null>(null);
  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const dirtyConfigIdsRef = useRef<Set<string>>(new Set());
  const successTimerRef = useRef<number | null>(null);

  const selectedService = services.find((service) => service.id === selectedServiceId);
  const selectedEnvironment = environments.find((environment) => environment.id === selectedEnvironmentId);
  const selectedProject = selectedService
    ? projects.find((project) => project.id === selectedService.projectId)
    : undefined;

  const serviceConfigs = useMemo(
    () =>
      configs.filter((config) => {
        if (selectedServiceId && config.serviceId !== selectedServiceId) return false;
        if (selectedEnvironmentId && config.environmentId !== selectedEnvironmentId) return false;
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
          ? current[config.id] ?? config.value
          : config.value;
      }
      return next;
    });
    setBulkText(serviceConfigs.map((config) => `${config.key}=${config.value}`).join('\n'));
  }, [serviceConfigs]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    };
  }, []);

  const saveConfigValue = async (config: Config) => {
    const nextValue = draftValues[config.id] ?? config.value ?? '';
    setSavingConfigId(config.id);
    setSavedConfigId(null);
    try {
      await Promise.all([
        onSaveConfigValue(config, nextValue),
        new Promise((resolve) => window.setTimeout(resolve, 350)),
      ]);
      setLocalConfigs((current) =>
        current.map((item) => (item.id === config.id ? { ...item, value: nextValue } : item)),
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
    if (normalizedKeyFilter && !config.key.toLowerCase().includes(normalizedKeyFilter)) return false;
    if (
      normalizedDescriptionFilter &&
      !(config.description ?? '').toLowerCase().includes(normalizedDescriptionFilter)
    ) {
      return false;
    }
    return true;
  });

  if (!detailOpen || !selectedService) {
    return (
      <section className="content-panel service-configs" data-testid="service-configs-list">
        <div data-testid="auto-service-configs-view-1-div" className="service-configs__header service-configs__header--list">
          <div data-testid="auto-service-configs-view-2-div">
            <h2 data-testid="auto-service-configs-view-3-h2">Service Configs</h2>
            <p data-testid="auto-service-configs-view-4-p">Select a service to manage environment-specific config values.</p>
          </div>
        </div>

        {loading ? (
          <ServiceListSkeleton />
        ) : (
          <DataTable
            value={services}
            dataKey="id"
            loading={loading} loadingIcon="pi pi-hourglass"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20, 50]}
            filterDisplay="row"
            responsiveLayout="scroll"
            emptyMessage="No services found"
            selectionMode="single"
            onRowClick={(event) => {
              const service = event.data as Service;
              onSelectService(service.id);
              setDetailOpen(true);
            }}
            rowClassName={() => 'service-configs__service-row'}
            className="service-configs__table"
          >
            <Column field="name" header="Service" filter sortable />
            <Column field="code" header="Code" filter sortable />
            <Column
              field="projectId"
              header="Project"
              filter
              sortable
              body={(row: Service) =>
                projects.find((project) => project.id === row.projectId)?.name ?? row.projectId
              }
            />
            <Column field="type" header="Type" filter sortable />
            <Column
              header=""
              body={(row: Service) => (
                <Button
                  type="button"
                  icon="pi pi-arrow-right"
                  text
                  rounded
                  data-testid={`open-configs-${row.code}`}
                  aria-label={`Open configs for ${row.name}`}
                  onClick={() => {
                    onSelectService(row.id);
                    setDetailOpen(true);
                  }}
                />
              )}
            />
          </DataTable>
        )}
      </section>
    );
  }

  return (
    <section className="content-panel service-configs" data-testid="service-configs-view">
      <div data-testid="auto-service-configs-view-5-div" className="service-configs__detail-hero">
        <div data-testid="auto-service-configs-view-6-div" className="service-configs__title-block">
          <Button
            type="button"
            icon="pi pi-arrow-left"
            text
            label="Services"
            className="service-configs__back"
            onClick={() => setDetailOpen(false)}
          />
          <div data-testid="auto-service-configs-view-7-div" className="service-configs__service-mark" aria-hidden="true">
            <i data-testid="auto-service-configs-view-8-i" className="pi pi-server" />
          </div>
          <div data-testid="auto-service-configs-view-9-div">
            <h2 data-testid="auto-service-configs-view-10-h2">{selectedService.name}</h2>
            <p data-testid="auto-service-configs-view-11-p">{selectedService.description || 'Manage scoped configuration values.'}</p>
          </div>
        </div>
        <div data-testid="auto-service-configs-view-12-div" className="service-configs__tools">
          <Dropdown
            optionLabel="name"
            optionValue="id"
            options={environments}
            value={selectedEnvironmentId}
            onChange={(event) => onSelectEnvironment(event.value)}
            placeholder="Environment"
            data-testid="service-configs-environment-selector"
            className="service-configs__environment"
          />
          <Button
            type="button"
            icon="pi pi-plus"
            label="Add config"
            data-testid="service-configs-add-button"
            className="service-configs__add-button"
            onClick={onAddConfig}
          />
        </div>
      </div>

      <div data-testid="auto-service-configs-view-13-div" className="service-configs__scope-bar">
        <span data-testid="auto-service-configs-view-14-span">
          <i data-testid="auto-service-configs-view-15-i" className="pi pi-briefcase" />
          {selectedProject?.name ?? selectedService.projectId}
        </span>
        <span data-testid="auto-service-configs-view-16-span">
          <i data-testid="auto-service-configs-view-17-i" className="pi pi-code" />
          {selectedService.code}
        </span>
        <span data-testid="auto-service-configs-view-18-span">
          <i data-testid="auto-service-configs-view-19-i" className="pi pi-globe" />
          {selectedEnvironment?.name ?? 'No environment selected'}
        </span>
        <span data-testid="auto-service-configs-view-20-span">
          <i data-testid="auto-service-configs-view-21-i" className="pi pi-sliders-h" />
          {localConfigs.length} configs
        </span>
      </div>

      <div data-testid="auto-service-configs-view-22-div" className="service-configs__grid">
        <div data-testid="auto-service-configs-view-23-div" className="service-configs__config-table">
          {loading ? (
            <ServiceConfigDetailSkeleton />
          ) : (
            <table data-testid="auto-service-configs-view-24-table">
              <thead data-testid="auto-service-configs-view-25-thead">
                <tr data-testid="auto-service-configs-view-26-tr">
                  <th data-testid="auto-service-configs-view-27-th">Key</th>
                  <th data-testid="auto-service-configs-view-28-th">Value</th>
                  <th data-testid="auto-service-configs-view-29-th">Description</th>
                  <th data-testid="auto-service-configs-view-30-th">Save</th>
                  <th data-testid="auto-service-configs-view-31-th">Actions</th>
                </tr>
                <tr data-testid="auto-service-configs-view-32-tr" className="service-configs__filter-row">
                  <th data-testid="auto-service-configs-view-33-th">
                    <InputText
                      data-testid="config-key-filter-input"
                      value={keyFilter}
                      onChange={(event) => setKeyFilter(event.currentTarget.value)}
                      className="w-full"
                    />
                  </th>
                  <th data-testid="auto-service-configs-view-34-th" />
                  <th data-testid="auto-service-configs-view-35-th">
                    <InputText
                      data-testid="config-description-filter-input"
                      value={descriptionFilter}
                      onChange={(event) => setDescriptionFilter(event.currentTarget.value)}
                      className="w-full"
                    />
                  </th>
                  <th data-testid="auto-service-configs-view-36-th" />
                  <th data-testid="auto-service-configs-view-37-th" />
                </tr>
              </thead>
              <tbody data-testid="auto-service-configs-view-38-tbody">
                {visibleConfigs.length ? (
                  visibleConfigs.map((row) => {
                    const isSaving = savingConfigId === row.id;
                    const isSaved = savedConfigId === row.id;
                    const draftValue = draftValues[row.id] ?? row.value ?? '';

                    return (
                      <tr data-testid="auto-service-configs-view-39-tr" key={row.id}>
                        <td data-testid="auto-service-configs-view-40-td">{row.key}</td>
                        <td data-testid="auto-service-configs-view-41-td">
                          <InputText
                            data-testid={`config-value-input-${row.key}`}
                            value={draftValue}
                            onChange={(event) => {
                              const nextValue = event.currentTarget.value;
                              setDraftValues((current) => ({ ...current, [row.id]: nextValue }));
                              setLocalConfigs((current) =>
                                current.map((item) =>
                                  item.id === row.id ? { ...item, value: nextValue } : item,
                                ),
                              );
                              dirtyConfigIdsRef.current.add(row.id);
                              setSavedConfigId((current) => (current === row.id ? null : current));
                            }}
                            className="w-full service-configs__value-input"
                          />
                        </td>
                        <td data-testid="auto-service-configs-view-42-td">{row.description}</td>
                        <td data-testid="auto-service-configs-view-43-td">
                          <button
                            type="button"
                            disabled={(savingConfigId !== null && !isSaving) || deletingConfigId !== null}
                            data-testid={`save-config-${row.key}`}
                            aria-label={`Save ${row.key}`}
                            className={`service-configs__icon-button service-configs__row-save${isSaved ? ' is-success' : ''}`}
                            onClick={() => saveConfigValue(row)}
                          >
                            <i data-testid="auto-service-configs-view-44-i"
                              className={
                                isSaving
                                  ? 'pi pi-spinner pi-spin service-configs__loading-icon'
                                  : isSaved
                                    ? 'pi pi-check'
                                    : 'pi pi-save'
                              }
                            />
                          </button>
                        </td>
                        <td data-testid="auto-service-configs-view-45-td">
                          <div data-testid="auto-service-configs-view-46-div" className="flex gap-2">
                            <Button
                              type="button"
                              size="small"
                              icon="pi pi-pencil"
                              text
                              disabled={savingConfigId !== null || deletingConfigId !== null}
                              onClick={() => onEditConfig(row)}
                            />
                            <Button
                              type="button"
                              size="small"
                              icon="pi pi-history"
                              text
                              disabled={savingConfigId !== null || deletingConfigId !== null}
                              onClick={() => onHistory(row.id)}
                            />
                            <Button
                              type="button"
                              size="small"
                              icon="pi pi-trash"
                              text
                              severity="danger"
                              loading={deletingConfigId === row.id} loadingIcon="pi pi-spinner pi-spin"
                              disabled={savingConfigId !== null || deletingConfigId !== null}
                              onClick={() => deleteConfig(row.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr data-testid="auto-service-configs-view-47-tr">
                    <td data-testid="auto-service-configs-view-48-td" colSpan={5}>
                      <ServiceConfigEmptyState onAddConfig={onAddConfig} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div data-testid="auto-service-configs-view-49-div" className="service-configs__bulk">
          <div data-testid="auto-service-configs-view-50-div" className="service-configs__bulk-header">
            <div data-testid="auto-service-configs-view-51-div">
              <h3 data-testid="auto-service-configs-view-52-h3">Bulk edit</h3>
              <p data-testid="auto-service-configs-view-53-p">Paste multiple values in env format.</p>
            </div>
            <Button
              type="button"
              icon="pi pi-save"
              data-testid="save-bulk-config-button"
              label={bulkSaving ? 'Saving...' : 'Save bulk'}
              loading={bulkSaving} loadingIcon="pi pi-spinner pi-spin"
              disabled={loading || bulkSaving || savingConfigId !== null || deletingConfigId !== null}
              onClick={saveBulkConfigs}
            />
          </div>
          {loading ? (
            <div data-testid="auto-service-configs-view-54-div" className="service-configs__bulk-input service-configs__bulk-input--skeleton">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} width={index === 7 ? '65%' : '100%'} height="0.95rem" />
              ))}
            </div>
          ) : (
            <InputTextarea
              data-testid="bulk-config-input"
              value={bulkText}
              onChange={(event) => setBulkText(event.target.value)}
              rows={12}
              placeholder={'DATABASE_URL=postgres://...\nJWT_SECRET=change-me\nFEATURE_FLAG=true'}
              className="w-full service-configs__bulk-input"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ServiceConfigEmptyState({ onAddConfig }: { onAddConfig: () => void }) {
  return (
    <div data-testid="auto-service-configs-view-55-div" className="service-configs__empty">
      <div data-testid="auto-service-configs-view-56-div" className="service-configs__empty-icon">
        <i data-testid="auto-service-configs-view-57-i" className="pi pi-sliders-h" />
      </div>
      <strong data-testid="auto-service-configs-view-58-strong">No configs in this environment</strong>
      <span data-testid="auto-service-configs-view-59-span">Create the first config or paste multiple KEY=value lines below.</span>
      <Button type="button" data-testid="empty-state-add-config-button" icon="pi pi-plus" label="Add config" size="small" onClick={onAddConfig} />
    </div>
  );
}

function ServiceListSkeleton() {
  return (
    <div data-testid="auto-service-configs-view-60-div" className="service-configs__table service-configs__table--skeleton">
      {Array.from({ length: 6 }).map((_, index) => (
        <div data-testid="auto-service-configs-view-61-div" key={index} className="service-configs__table-skeleton-row">
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
    <div data-testid="auto-service-configs-view-62-div" className="service-configs__detail-skeleton">
      <div data-testid="auto-service-configs-view-63-div" className="service-configs__detail-skeleton-row service-configs__detail-skeleton-row--header">
        <Skeleton width="22%" height="1rem" />
        <Skeleton width="30%" height="1rem" />
        <Skeleton width="24%" height="1rem" />
        <Skeleton width="3rem" height="1rem" />
        <Skeleton width="6rem" height="1rem" />
      </div>
      <div data-testid="auto-service-configs-view-64-div" className="service-configs__detail-skeleton-row service-configs__detail-skeleton-row--filters">
        <Skeleton width="100%" height="2.5rem" />
        <div data-testid="auto-service-configs-view-65-div" />
        <Skeleton width="100%" height="2.5rem" />
        <div data-testid="auto-service-configs-view-66-div" />
        <div data-testid="auto-service-configs-view-67-div" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div data-testid="auto-service-configs-view-68-div" key={index} className="service-configs__detail-skeleton-row">
          <Skeleton width="80%" height="1rem" />
          <Skeleton width="100%" height="2.5rem" />
          <Skeleton width="90%" height="1rem" />
          <Skeleton shape="circle" size="2rem" />
          <div data-testid="auto-service-configs-view-69-div" className="service-configs__detail-skeleton-actions">
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
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) return { key: line, value: '' };
      return {
        key: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1),
      };
    })
    .filter((item) => item.key);
}
