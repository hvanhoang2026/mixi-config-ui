import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
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
  const actions = (type: EntityType, row: EntityItem) => (
    <ActionButtons
      type={type}
      row={row}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onHistory={props.onHistory}
    />
  );

  return (
    <TabView className="mt-3">
      <TabPanel header="Projects">
        <CrudHeader onAdd={() => props.onAdd('project')} />
        <DataTable value={props.projects} loading={props.loading.project} responsiveLayout="scroll">
          <Column field="name" header="Name" />
          <Column field="code" header="Code" />
          <Column field="description" header="Description" />
          <Column header="Actions" body={(row: Project) => actions('project', row)} />
        </DataTable>
      </TabPanel>
      <TabPanel header="Services">
        <CrudHeader onAdd={() => props.onAdd('service')} />
        <DataTable value={props.services} loading={props.loading.service} responsiveLayout="scroll">
          <Column field="name" header="Name" />
          <Column field="code" header="Code" />
          <Column field="type" header="Type" />
          <Column
            field="projectId"
            header="Project"
            body={(row: Service) => props.projects.find((project) => project.id === row.projectId)?.name ?? row.projectId}
          />
          <Column header="Actions" body={(row: Service) => actions('service', row)} />
        </DataTable>
      </TabPanel>
      <TabPanel header="Environments">
        <CrudHeader onAdd={() => props.onAdd('environment')} />
        <DataTable value={props.environments} loading={props.loading.environment} responsiveLayout="scroll">
          <Column field="name" header="Name" />
          <Column field="code" header="Code" />
          <Column field="description" header="Description" />
          <Column header="Actions" body={(row: Environment) => actions('environment', row)} />
        </DataTable>
      </TabPanel>
      <TabPanel header="Configs">
        <CrudHeader onAdd={() => props.onAdd('config')} />
        <DataTable value={props.configs} loading={props.loading.config} responsiveLayout="scroll">
          <Column field="key" header="Key" />
          <Column field="value" header="Value" />
          <Column field="description" header="Description" />
          <Column field="isSecret" header="Secret" body={(row: Config) => (row.isSecret ? 'Yes' : 'No')} />
          <Column field="isRequired" header="Required" body={(row: Config) => (row.isRequired ? 'Yes' : 'No')} />
          <Column header="Actions" body={(row: Config) => actions('config', row)} />
        </DataTable>
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
