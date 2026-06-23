import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

type Dashboard = {
  totalProjects?: number;
  totalServices?: number;
  totalEnvironments?: number;
  totalConfigs?: number;
};

type Option = {
  id: string;
  name: string;
};

type Props = {
  dashboard?: Dashboard;
  projectName?: string;
  services: Option[];
  environments: Option[];
  selectedServiceId: string;
  selectedEnvironmentId: string;
  search: string;
  actions?: React.ReactNode;
  onServiceChange: (value: string) => void;
  onEnvironmentChange: (value: string) => void;
  onSearchChange: (value: string) => void;
};

export function DashboardHeader({
  dashboard,
  projectName,
  services,
  environments,
  selectedServiceId,
  selectedEnvironmentId,
  search,
  actions,
  onServiceChange,
  onEnvironmentChange,
  onSearchChange,
}: Props) {
  const stats = [
    ['Services', dashboard?.totalServices],
    ['Environments', dashboard?.totalEnvironments],
    ['Configs', dashboard?.totalConfigs],
  ] as const;

  return (
    <section className="dashboard-header">
      <div className="dashboard-header__top">
        <div className="dashboard-header__copy">
          <span className="dashboard-header__eyebrow">Service Configuration Workspace</span>
          <h1>Mixi Config Center</h1>
          <p>Manage config by service scope. Import, export, runtime preview, and cache actions now run against the selected service and environment.</p>
          {projectName ? <div className="dashboard-header__scope-note">Project metadata: {projectName}</div> : null}
        </div>

        <div className="dashboard-header__tools">
          <div className="dashboard-header__scope-grid">
            <div className="dashboard-header__scope-field">
              <span>Service</span>
              <Dropdown
                optionLabel="name"
                optionValue="id"
                options={services}
                value={selectedServiceId}
                onChange={(event) => onServiceChange(event.value)}
                placeholder="Select service"
                className="w-full"
              />
            </div>
            <div className="dashboard-header__scope-field">
              <span>Environment</span>
              <Dropdown
                optionLabel="name"
                optionValue="id"
                options={environments}
                value={selectedEnvironmentId}
                onChange={(event) => onEnvironmentChange(event.value)}
                placeholder="Select environment"
                className="w-full"
              />
            </div>
          </div>
          <div className="dashboard-header__search">
            <i className="pi pi-search" />
            <InputText
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search service config keys"
            />
          </div>
          {actions ? <div className="dashboard-header__actions">{actions}</div> : null}
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
