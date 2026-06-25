import { Column, DataTable } from '@w-iris/react';
import type { DataTableProps } from 'primereact/datatable';
import type { Config, Environment, Project, Service } from '../../types';
import type { ConfigSection, EntityItem, EntityType } from '../../form-types';
import { ActionButtons } from '../shared/action-buttons';
import { CrudHeader } from '../shared/crud-header';
import { RuntimeHistoryPanel } from '../runtime-history/runtime-history-panel';
import { ServiceConfigsView } from '../service-configs/service-configs-view';

type Props = {
  projects: Project[];
  services: Service[];
  environments: Environment[];
  configs: Config[];
  loading: Record<EntityType, boolean>;
  runtimeText: string;
  history: unknown[];
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
  onBulkSaveConfigs: (lines: Array<{ key: string; value: string }>) => Promise<void>;
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

  if (props.activeSection === 'project') {
    return (
      <section className="content-panel">
        <CrudHeader onAdd={() => props.onAdd('project')} actions={props.actions} />
        <EntityDataTable value={props.projects} loading={props.loading.project}>
          <Column field="name" header="Name" filter sortable />
          <Column field="code" header="Code" filter sortable />
          <Column field="description" header="Description" filter />
          <Column header="Actions" body={(row: Project) => actions('project', row)} />
        </EntityDataTable>
      </section>
    );
  }

  if (props.activeSection === 'service') {
    return (
      <section className="content-panel">
        <CrudHeader onAdd={() => props.onAdd('service')} actions={props.actions} />
        <EntityDataTable value={props.services} loading={props.loading.service}>
          <Column field="name" header="Name" filter sortable />
          <Column field="code" header="Code" filter sortable />
          <Column field="type" header="Type" filter sortable />
          <Column
            field="projectId"
            header="Project"
            filter
            sortable
            body={(row: Service) =>
              props.projects.find((project) => project.id === row.projectId)?.name ?? row.projectId
            }
          />
          <Column header="Actions" body={(row: Service) => actions('service', row)} />
        </EntityDataTable>
      </section>
    );
  }

  if (props.activeSection === 'environment') {
    return (
      <section className="content-panel">
        <CrudHeader onAdd={() => props.onAdd('environment')} actions={props.actions} />
        <EntityDataTable value={props.environments} loading={props.loading.environment}>
          <Column field="name" header="Name" filter sortable />
          <Column field="code" header="Code" filter sortable />
          <Column field="description" header="Description" filter />
          <Column header="Actions" body={(row: Environment) => actions('environment', row)} />
        </EntityDataTable>
      </section>
    );
  }

  if (props.activeSection === 'config') {
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
        onAddConfig={() => props.onAdd('config')}
        onEditConfig={(config) => props.onEdit('config', config)}
        onDeleteConfig={(configId) => props.onDelete('config', configId)}
        onSaveConfigValue={props.onSaveConfigValue}
        onBulkSave={props.onBulkSaveConfigs}
        onHistory={props.onHistory}
      />
    );
  }

  return (
    <section className="content-panel" id="runtime">
      <RuntimeHistoryPanel
        runtimeText={props.runtimeText}
        history={props.history}
        onLoadRuntime={props.onLoadRuntime}
        onLoadHistory={() => props.configs[0] && props.onHistory(props.configs[0].id)}
      />
    </section>
  );
}

function EntityDataTable<T extends { id: string }>({
  children,
  ...props
}: DataTableProps<T[]> & { children: React.ReactNode }) {
  return (
    <DataTable
      {...props}
      dataKey="id"
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 20, 50]}
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="{first} - {last} of {totalRecords}"
      filterDisplay="row"
      responsiveLayout="scroll"
      emptyMessage="No records found"
    >
      {children}
    </DataTable>
  );
}
