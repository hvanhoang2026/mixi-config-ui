import { Button } from 'primereact/button';
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
    <section className="dashboard-header">
      <div className="dashboard-header__top">
        <div className="dashboard-header__copy">
          <span className="dashboard-header__eyebrow">Configuration Workspace</span>
          <h1>Mixi Config Center</h1>
          <p>Manage environment variables, exports, cache reloads, and audit history from one operational view.</p>
        </div>

        <div className="dashboard-header__tools">
          <div className="dashboard-header__search">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search configs"
            />
          </div>
        </div>
      </div>

      <div className="dashboard-header__stats">
        {stats.map(([title, value]) => (
          <article className="stat-card" key={title}>
            <span className="stat-card__label">{title}</span>
            <strong className="stat-card__value">{value ?? 0}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
