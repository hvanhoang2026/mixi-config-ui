import {
  AntdInput as InputText,
  AntdSelect as Dropdown,
} from "@w-iris/react";
import { SearchOutlined } from "@ant-design/icons";
import { Skeleton } from "../../../../components/ui/skeleton";

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
    ["Services", dashboard?.totalServices, "Registered workloads"],
    ["Environments", dashboard?.totalEnvironments, "Deployment scopes"],
    ["Config keys", dashboard?.totalConfigs, "Governed values"],
  ] as const;

  return (
    <section className="dashboard-header" data-testid="dashboard-header">
      <span className="dashboard-header__rail" aria-hidden="true">
        01 / CONTROL
      </span>
      <div
        data-testid="auto-dashboard-header-1-div"
        className="dashboard-header__top"
      >
        <div
          data-testid="auto-dashboard-header-2-div"
          className="dashboard-header__copy"
        >
          <span
            data-testid="auto-dashboard-header-3-span"
            className="dashboard-header__eyebrow"
          >
            Platform configuration ledger
          </span>
          <h1 data-testid="auto-dashboard-header-4-h1">
            Configuration control
          </h1>
          <p data-testid="auto-dashboard-header-5-p">
            Select an operational scope, review governed values, and publish
            changes without losing service context.
          </p>
          {loading ? (
            <div
              data-testid="auto-dashboard-header-6-div"
              className="dashboard-header__scope-note"
            >
              <Skeleton width="16rem" height="1rem" />
            </div>
          ) : projectName ? (
            <div
              data-testid="auto-dashboard-header-7-div"
              className="dashboard-header__scope-note"
            >
              <span>Current project</span>
              <strong>{projectName}</strong>
            </div>
          ) : null}
        </div>

        <div
          data-testid="auto-dashboard-header-8-div"
          className="dashboard-header__tools"
        >
          <div
            data-testid="auto-dashboard-header-9-div"
            className="dashboard-header__scope-grid"
          >
            <div
              data-testid="auto-dashboard-header-10-div"
              className="dashboard-header__scope-field"
            >
              <label
                data-testid="auto-dashboard-header-11-span"
                htmlFor="workspace-service"
              >
                Service
              </label>
              {loading ? (
                <Skeleton height="2.75rem" borderRadius="12px" />
              ) : (
                <Dropdown
                  inputId="workspace-service"
                  optionLabel="name"
                  optionValue="id"
                  options={services}
                  value={selectedServiceId}
                  onChange={(event: { value: unknown }) =>
                    onServiceChange(String(event.value))
                  }
                  placeholder="Select service"
                  data-testid="service-selector"
                  className="ui-full-width"
                />
              )}
            </div>
            <div
              data-testid="auto-dashboard-header-12-div"
              className="dashboard-header__scope-field"
            >
              <label
                data-testid="auto-dashboard-header-13-span"
                htmlFor="workspace-environment"
              >
                Environment
              </label>
              {loading ? (
                <Skeleton height="2.75rem" borderRadius="12px" />
              ) : (
                <Dropdown
                  inputId="workspace-environment"
                  optionLabel="name"
                  optionValue="id"
                  options={environments}
                  value={selectedEnvironmentId}
                  onChange={(event: { value: unknown }) =>
                    onEnvironmentChange(String(event.value))
                  }
                  placeholder="Select environment"
                  data-testid="environment-selector"
                  className="ui-full-width"
                />
              )}
            </div>
          </div>
          <div
            data-testid="auto-dashboard-header-14-div"
            className="dashboard-header__search"
          >
            <SearchOutlined
              data-testid="auto-dashboard-header-15-i"
              aria-hidden="true"
            />
            {loading ? (
              <Skeleton width="100%" height="1.1rem" />
            ) : (
              <InputText
                aria-label="Search configuration keys"
                value={search}
                onChange={(event: { target: { value: string } }) =>
                  onSearchChange(event.target.value)
                }
                data-testid="config-search-input"
                placeholder="Search service config keys"
              />
            )}
          </div>
          {loading ? (
            <div
              data-testid="auto-dashboard-header-16-div"
              className="dashboard-header__actions dashboard-header__actions--skeleton"
            >
              <Skeleton width="10rem" height="2.75rem" borderRadius="10px" />
              <Skeleton width="10rem" height="2.75rem" borderRadius="10px" />
              <Skeleton width="10rem" height="2.75rem" borderRadius="10px" />
            </div>
          ) : actions ? (
            <div
              data-testid="auto-dashboard-header-17-div"
              className="dashboard-header__actions"
            >
              {actions}
            </div>
          ) : null}
        </div>
      </div>

      <div
        data-testid="auto-dashboard-header-18-div"
        className="dashboard-header__stats"
      >
        {stats.map(([title, value, context], index) =>
          loading ? (
            <div
              data-testid="auto-dashboard-header-19-div"
              key={title}
              className="stat-card stat-card--skeleton"
            >
              <Skeleton width="6rem" height="0.95rem" />
              <Skeleton width="4.5rem" height="2rem" />
            </div>
          ) : (
            <article key={title} className="stat-card">
              <span className="stat-card__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="stat-card__label">{title}</span>
              <strong className="stat-card__value">{value ?? 0}</strong>
              <span className="stat-card__context">{context}</span>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
