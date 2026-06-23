import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
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
      <section className="content-panel service-configs">
        <div className="service-configs__header service-configs__header--list">
          <div>
            <h2>Service Configs</h2>
            <p>Select a service to manage environment-specific config values.</p>
          </div>
        </div>

        <DataTable
          value={services}
          dataKey="id"
          loading={loading}
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
                aria-label={`Open configs for ${row.name}`}
                onClick={() => {
                  onSelectService(row.id);
                  setDetailOpen(true);
                }}
              />
            )}
          />
        </DataTable>
      </section>
    );
  }

  return (
    <section className="content-panel service-configs">
      <div className="service-configs__detail-hero">
        <div className="service-configs__title-block">
          <Button
            type="button"
            icon="pi pi-arrow-left"
            text
            label="Services"
            className="service-configs__back"
            onClick={() => setDetailOpen(false)}
          />
          <div className="service-configs__service-mark" aria-hidden="true">
            <i className="pi pi-server" />
          </div>
          <div>
            <h2>{selectedService.name}</h2>
            <p>{selectedService.description || 'Manage scoped configuration values.'}</p>
          </div>
        </div>
        <div className="service-configs__tools">
          <Dropdown
            optionLabel="name"
            optionValue="id"
            options={environments}
            value={selectedEnvironmentId}
            onChange={(event) => onSelectEnvironment(event.value)}
            placeholder="Environment"
            className="service-configs__environment"
          />
          <Button
            type="button"
            icon="pi pi-plus"
            label="Add config"
            className="service-configs__add-button"
            onClick={onAddConfig}
          />
        </div>
      </div>

      <div className="service-configs__scope-bar">
        <span>
          <i className="pi pi-briefcase" />
          {selectedProject?.name ?? selectedService.projectId}
        </span>
        <span>
          <i className="pi pi-code" />
          {selectedService.code}
        </span>
        <span>
          <i className="pi pi-globe" />
          {selectedEnvironment?.name ?? 'No environment selected'}
        </span>
        <span>
          <i className="pi pi-sliders-h" />
          {localConfigs.length} configs
        </span>
      </div>

      <div className="service-configs__grid">
        <div className="service-configs__config-table">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Description</th>
                <th>Save</th>
                <th>Actions</th>
              </tr>
              <tr className="service-configs__filter-row">
                <th>
                  <InputText
                    value={keyFilter}
                    onChange={(event) => setKeyFilter(event.currentTarget.value)}
                    className="w-full"
                  />
                </th>
                <th />
                <th>
                  <InputText
                    value={descriptionFilter}
                    onChange={(event) => setDescriptionFilter(event.currentTarget.value)}
                    className="w-full"
                  />
                </th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleConfigs.length ? (
                visibleConfigs.map((row) => {
                  const isSaving = savingConfigId === row.id;
                  const isSaved = savedConfigId === row.id;
                  const draftValue = draftValues[row.id] ?? row.value ?? '';

                  return (
                    <tr key={row.id}>
                      <td>{row.key}</td>
                      <td>
                        <InputText
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
                      <td>{row.description}</td>
                      <td>
                        <button
                          type="button"
                          disabled={(savingConfigId !== null && !isSaving) || deletingConfigId !== null}
                          aria-label={`Save ${row.key}`}
                          className={`service-configs__icon-button service-configs__row-save${isSaved ? ' is-success' : ''}`}
                          onClick={() => saveConfigValue(row)}
                        >
                          <i
                            className={
                              isSaving
                                ? 'pi pi-spinner service-configs__saving-icon'
                                : isSaved
                                  ? 'pi pi-check'
                                  : 'pi pi-save'
                            }
                          />
                        </button>
                      </td>
                      <td>
                        <div className="flex gap-2">
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
                            loading={deletingConfigId === row.id}
                            disabled={savingConfigId !== null || deletingConfigId !== null}
                            onClick={() => deleteConfig(row.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5}>
                    <ServiceConfigEmptyState onAddConfig={onAddConfig} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="service-configs__bulk">
          <div className="service-configs__bulk-header">
            <div>
              <h3>Bulk edit</h3>
              <p>Paste multiple values in env format.</p>
            </div>
            <Button
              type="button"
              icon="pi pi-save"
              label={bulkSaving ? 'Saving...' : 'Save bulk'}
              loading={bulkSaving}
              disabled={bulkSaving || savingConfigId !== null || deletingConfigId !== null}
              onClick={saveBulkConfigs}
            />
          </div>
          <InputTextarea
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            rows={12}
            placeholder={'DATABASE_URL=postgres://...\nJWT_SECRET=change-me\nFEATURE_FLAG=true'}
            className="w-full service-configs__bulk-input"
          />
        </div>
      </div>
    </section>
  );
}

function ServiceConfigEmptyState({ onAddConfig }: { onAddConfig: () => void }) {
  return (
    <div className="service-configs__empty">
      <div className="service-configs__empty-icon">
        <i className="pi pi-sliders-h" />
      </div>
      <strong>No configs in this environment</strong>
      <span>Create the first config or paste multiple KEY=value lines below.</span>
      <Button type="button" icon="pi pi-plus" label="Add config" size="small" onClick={onAddConfig} />
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
