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
    <section className="dashboard-header" data-testid="dashboard-header">
      <div data-testid="auto-dashboard-header-1-div" className="dashboard-header__top">
        <div data-testid="auto-dashboard-header-2-div" className="dashboard-header__copy">
          <span data-testid="auto-dashboard-header-3-span" className="dashboard-header__eyebrow">Service Configuration Workspace</span>
          <h1 data-testid="auto-dashboard-header-4-h1">Mixi Config Center</h1>
          <p data-testid="auto-dashboard-header-5-p">Manage config by service scope. Import, export, runtime preview, and cache actions now run against the selected service and environment.</p>
          {loading ? (
            <div data-testid="auto-dashboard-header-6-div" className="dashboard-header__scope-note">
              <Skeleton width="16rem" height="1rem" />
            </div>
          ) : projectName ? (
            <div data-testid="auto-dashboard-header-7-div" className="dashboard-header__scope-note">Project metadata: {projectName}</div>
          ) : null}
        </div>

        <div data-testid="auto-dashboard-header-8-div" className="dashboard-header__tools">
          <div data-testid="auto-dashboard-header-9-div" className="dashboard-header__scope-grid">
            <div data-testid="auto-dashboard-header-10-div" className="dashboard-header__scope-field">
              <span data-testid="auto-dashboard-header-11-span">Service</span>
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
                  data-testid="service-selector"
                  className="w-full"
                />
              )}
            </div>
            <div data-testid="auto-dashboard-header-12-div" className="dashboard-header__scope-field">
              <span data-testid="auto-dashboard-header-13-span">Environment</span>
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
                  data-testid="environment-selector"
                  className="w-full"
                />
              )}
            </div>
          </div>
          <div data-testid="auto-dashboard-header-14-div" className="dashboard-header__search">
            <i data-testid="auto-dashboard-header-15-i" className="pi pi-search" />
            {loading ? (
              <Skeleton width="100%" height="1.1rem" />
            ) : (
              <InputText
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                data-testid="config-search-input"
                placeholder="Search service config keys"
              />
            )}
          </div>
          {loading ? (
            <div data-testid="auto-dashboard-header-16-div" className="dashboard-header__actions dashboard-header__actions--skeleton">
              <Skeleton width="10rem" height="2.75rem" borderRadius="10px" />
              <Skeleton width="10rem" height="2.75rem" borderRadius="10px" />
              <Skeleton width="10rem" height="2.75rem" borderRadius="10px" />
            </div>
          ) : actions ? (
            <div data-testid="auto-dashboard-header-17-div" className="dashboard-header__actions">{actions}</div>
          ) : null}
        </div>
      </div>

      <div data-testid="auto-dashboard-header-18-div" className="dashboard-header__stats">
        {stats.map(([title, value, icon]) =>
          loading ? (
            <div data-testid="auto-dashboard-header-19-div" key={title} className="stat-card stat-card--skeleton">
              <Skeleton width="6rem" height="0.95rem" />
              <Skeleton width="4.5rem" height="2rem" />
            </div>
          ) : (
            <StatCard key={title} label={title} value={value ?? 0} icon={<i data-testid="auto-dashboard-header-20-i" className={icon} aria-hidden="true" />} />
          ),
        )}
      </div>
    </section>
  );
}
