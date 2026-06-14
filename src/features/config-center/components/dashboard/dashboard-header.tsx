import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';

type Dashboard = {
  totalProjects?: number;
  totalServices?: number;
  totalEnvironments?: number;
  totalConfigs?: number;
};

type Props = {
  dashboard?: Dashboard;
  search: string;
  onSearchChange: (value: string) => void;
  onReload: () => Promise<void>;
  onImport: () => void;
  onExport: () => Promise<void>;
  onReloadCache: () => Promise<void>;
};

export function DashboardHeader({
  dashboard,
  search,
  onSearchChange,
  onReload,
  onImport,
  onExport,
  onReloadCache,
}: Props) {
  const stats = [
    ['Projects', dashboard?.totalProjects],
    ['Services', dashboard?.totalServices],
    ['Environments', dashboard?.totalEnvironments],
    ['Configs', dashboard?.totalConfigs],
  ] as const;

  return (
    <Card title="Mixi Config Center" subTitle="CRUD, search, export, history, runtime config">
      <div className="flex gap-2 flex-wrap align-items-center">
        <Button label="Reload all" icon="pi pi-refresh" onClick={onReload} />
        <Button label="Import ENV" icon="pi pi-upload" severity="secondary" onClick={onImport} />
        <Button label="Export ENV" icon="pi pi-download" outlined onClick={onExport} />
        <Button label="Reload Cache" icon="pi pi-sync" outlined onClick={onReloadCache} />
        <InputText value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search configs" />
      </div>
      <div className="grid mt-3">
        {stats.map(([title, value]) => (
          <div className="col-12 md:col-3" key={title}>
            <Card title={title}>{value ?? 0}</Card>
          </div>
        ))}
      </div>
    </Card>
  );
}
