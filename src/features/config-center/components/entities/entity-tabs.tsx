import { useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, type DataTableProps } from 'primereact/datatable';
import { TabPanel, TabView } from 'primereact/tabview';
import type { Config, Environment, Project, Service } from '../../types';
import type { EntityItem, EntityType } from '../../form-types';
import { ActionButtons } from '../shared/action-buttons';
import { CrudHeader } from '../shared/crud-header';
import { RuntimeHistoryPanel } from '../runtime-history/runtime-history-panel';

type Props = {
  projects: Project[];
  services: Service[];
  environments: Environment[];
  configs: Config[];
  loading: Record<EntityType, boolean>;
  runtimeText: string;
  history: unknown[];
  onAdd: (type: EntityType) => void;
  onEdit: (type: EntityType, item: EntityItem) => void;
  onDelete: (type: EntityType, id: string) => Promise<void>;
  onHistory: (configId: string) => void;
  onLoadRuntime: () => Promise<void>;
};

export function EntityTabs(props: Props) {
  const [visibleConfigValues, setVisibleConfigValues] = useState<Set<string>>(new Set());

  const actions = (type: EntityType, row: EntityItem) => (
    <ActionButtons
      type={type}
      row={row}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onHistory={props.onHistory}
    />
  );

  const toggleConfigValue = (configId: string) => {
    setVisibleConfigValues((current) => {
      const next = new Set(current);
      if (next.has(configId)) {
        next.delete(configId);
      } else {
        next.add(configId);
      }
      return next;
    });
  };

  const configValue = (row: Config) => {
    const visible = visibleConfigValues.has(row.id);
    return (
      <div className="flex align-items-center gap-2">
        <span
          style={{
            display: 'inline-block',
            maxWidth: 360,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
          }}
          title={visible ? row.value : undefined}
        >
          {visible ? row.value : '••••••••••••'}
        </span>
        <Button
          type="button"
          icon={visible ? 'pi pi-eye-slash' : 'pi pi-eye'}
          text
          rounded
          size="small"
          aria-label={visible ? `Hide value for ${row.key}` : `Show value for ${row.key}`}
          onClick={() => toggleConfigValue(row.id)}
        />
      </div>
    );
  };

  return (
    <TabView className="mt-3">
      <TabPanel header="Projects">
        <CrudHeader onAdd={() => props.onAdd('project')} />
        <EntityDataTable value={props.projects} loading={props.loading.project}>
          <Column field="name" header="Name" filter sortable />
          <Column field="code" header="Code" filter sortable />
          <Column field="description" header="Description" filter />
          <Column header="Actions" body={(row: Project) => actions('project', row)} />
        </EntityDataTable>
      </TabPanel>
      <TabPanel header="Services">
        <CrudHeader onAdd={() => props.onAdd('service')} />
        <EntityDataTable value={props.services} loading={props.loading.service}>
          <Column field="name" header="Name" filter sortable />
          <Column field="code" header="Code" filter sortable />
          <Column field="type" header="Type" filter sortable />
          <Column
            field="projectId"
            header="Project"
            filter
            sortable
            body={(row: Service) => props.projects.find((project) => project.id === row.projectId)?.name ?? row.projectId}
          />
          <Column header="Actions" body={(row: Service) => actions('service', row)} />
        </EntityDataTable>
      </TabPanel>
      <TabPanel header="Environments">
        <CrudHeader onAdd={() => props.onAdd('environment')} />
        <EntityDataTable value={props.environments} loading={props.loading.environment}>
          <Column field="name" header="Name" filter sortable />
          <Column field="code" header="Code" filter sortable />
          <Column field="description" header="Description" filter />
          <Column header="Actions" body={(row: Environment) => actions('environment', row)} />
        </EntityDataTable>
      </TabPanel>
      <TabPanel header="Configs">
        <CrudHeader onAdd={() => props.onAdd('config')} />
        <EntityDataTable value={props.configs} loading={props.loading.config}>
          <Column field="key" header="Key" filter sortable />
          <Column field="value" header="Value" filter body={configValue} />
          <Column field="description" header="Description" filter />
          <Column field="isSecret" header="Secret" filter sortable body={(row: Config) => (row.isSecret ? 'Yes' : 'No')} />
          <Column field="isRequired" header="Required" filter sortable body={(row: Config) => (row.isRequired ? 'Yes' : 'No')} />
          <Column header="Actions" body={(row: Config) => actions('config', row)} />
        </EntityDataTable>
      </TabPanel>
      <TabPanel header="Runtime & History">
        <RuntimeHistoryPanel
          runtimeText={props.runtimeText}
          history={props.history}
          onLoadRuntime={props.onLoadRuntime}
          onLoadHistory={() => props.configs[0] && props.onHistory(props.configs[0].id)}
        />
      </TabPanel>
    </TabView>
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
