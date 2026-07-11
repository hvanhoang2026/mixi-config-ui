import { StatCard } from '@w-iris/react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';

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
  loading?: boolean;
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
  loading = false,
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
    ['Services', dashboard?.totalServices, 'pi pi-briefcase'],
    ['Environments', dashboard?.totalEnvironments, 'pi pi-globe'],
    ['Configs', dashboard?.totalConfigs, 'pi pi-sliders-h'],
  ] as const;

  return (
    <section className="dashboard-header">
      <div className="dashboard-header__top">
        <div className="dashboard-header__copy">
          <span className="dashboard-header__eyebrow">Service Configuration Workspace</span>
          <h1>Mixi Config Center</h1>
          <p>Manage config by service scope. Import, export, runtime preview, and cache actions now run against the selected service and environment.</p>
          {loading ? (
            <div className="dashboard-header__scope-note">
              <Skeleton width="16rem" height="1rem" />
            </div>
          ) : projectName ? (
            <div className="dashboard-header__scope-note">Project metadata: {projectName}</div>
          ) : null}
        </div>

        <div className="dashboard-header__tools">
          <div className="dashboard-header__scope-grid">
            <div className="dashboard-header__scope-field">
              <span>Service</span>
              {loading ? (
                <Skeleton height="2.75rem" borderRadius="12px" />
              ) : (
                <Dropdown
                  optionLabel="name"
                  optionValue="id"
                  options={services}
                  value={selectedServiceId}
                  onChange={(event) => onServiceChange(event.value)}
                  placeholder="Select service"
                  className="w-full"
                />
              )}
            </div>
            <div className="dashboard-header__scope-field">
              <span>Environment</span>
              {loading ? (
                <Skeleton height="2.75rem" borderRadius="12px" />
              ) : (
                <Dropdown
                  optionLabel="name"
                  optionValue="id"
                  options={environments}
                  value={selectedEnvironmentId}
                  onChange={(event) => onEnvironmentChange(event.value)}
                  placeholder="Select environment"
                  className="w-full"
                />
              )}
            </div>
          </div>
          <div className="dashboard-header__search">
            <i className="pi pi-search" />
            {loading ? (
              <Skeleton width="100%" height="1.1rem" />
            ) : (
              <InputText
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search service config keys"
              />
            )}
          </div>
          {loading ? (
            <div className="dashboard-header__actions dashboard-header__actions--skeleton">
              <Skeleton width="10rem" height="2.75rem" borderRadius="10px" />
              <Skeleton width="10rem" height="2.75rem" borderRadius="10px" />
              <Skeleton width="10rem" height="2.75rem" borderRadius="10px" />
            </div>
          ) : actions ? (
            <div className="dashboard-header__actions">{actions}</div>
          ) : null}
        </div>
      </div>

      <div className="dashboard-header__stats">
        {stats.map(([title, value, icon]) =>
          loading ? (
            <div key={title} className="stat-card stat-card--skeleton">
              <Skeleton width="6rem" height="0.95rem" />
              <Skeleton width="4.5rem" height="2rem" />
            </div>
          ) : (
            <StatCard key={title} label={title} value={value ?? 0} icon={<i className={icon} aria-hidden="true" />} />
          ),
        )}
      </div>
    </section>
  );
}
