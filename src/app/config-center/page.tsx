"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminUserMenu,
  MixiAccountPages,
  MixiAdminShell,
  createMixiAccountMenuItems,
  type MixiAccountPagesProps,
  type MixiAdminMenuItem,
} from "@w-iris/react";
import { AuthGuard } from "../../features/auth/auth-guard";
import { useAuth } from "../../features/auth/AuthProvider";
import {
  authApi,
  normalizeAccountSettings,
  type AccountSettings,
} from "../../features/auth/authApi";
import { API_BASE, api } from "../../features/config-center/api";
import { publicEnv } from "../../shared/config/public-env";
import { AntdButton as Button } from "@w-iris/react";
import {
  AppstoreOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  DownloadOutlined,
  HistoryOutlined,
  ProjectOutlined,
  ReloadOutlined,
  SettingOutlined,
  SlidersOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { DashboardHeader } from "../../features/config-center/components/dashboard/dashboard-header";
import { EntityDialog } from "../../features/config-center/components/dialogs/entity-dialog";
import { ImportEnvDialog } from "../../features/config-center/components/dialogs/import-env-dialog";
import { EntityTabs } from "../../features/config-center/components/entities/entity-tabs";
import type {
  ConfigSection,
  ConfigForm,
  EditTarget,
  EntityItem,
  EntityType,
  EnvironmentForm,
  ProjectForm,
  ServiceForm,
} from "../../features/config-center/form-types";
import {
  toConfigForm,
  toEnvironmentForm,
  toProjectForm,
  toServiceForm,
} from "../../features/config-center/form-payloads";
import { useCrud } from "../../features/config-center/hooks/use-crud";
import type {
  Config,
  Environment,
  HistoryItem,
  Project,
  Service,
} from "../../features/config-center/types";

const emptyProject: ProjectForm = { name: "", code: "", description: "" };
const emptyEnvironment: EnvironmentForm = {
  name: "",
  code: "",
  description: "",
};
const BULK_UPSERT_TIMEOUT_MS = 120_000;

function submenuLabel(label: string, icon: ReactNode) {
  return (
    <span className="mixi-config-submenu-label">
      <span className="mixi-config-submenu-label__icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </span>
  ) as unknown as string;
}

export default function ConfigCenterPage() {
  const router = useRouter();
  const {
    initialized,
    isAuthenticated,
    accessToken,
    user,
    logout,
    updateUser,
  } = useAuth();
  const queryClient = useQueryClient();
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ConfigSection>("dashboard");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [search, setSearch] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState("");
  const [envText, setEnvText] = useState(
    "DB_HOST=localhost\nDB_PORT=5432\nJWT_SECRET=abc123",
  );
  const [runtimeText, setRuntimeText] = useState("");
  const [activeAccountPage, setActiveAccountPage] = useState<
    MixiAccountPagesProps["page"] | null
  >(null);

  useEffect(() => {
    const account = new URLSearchParams(window.location.search).get("account");
    if (
      account === "profile" ||
      account === "settings" ||
      account === "security"
    ) {
      setActiveAccountPage(account);
    }
  }, []);

  const projects = useCrud<Project>("projects", "/projects");
  const services = useCrud<Service>("services", "/services");
  const environments = useCrud<Environment>("environments", "/environments");
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<Record<string, number>>("/dashboard"),
    enabled: initialized && isAuthenticated,
  });
  const history = useQuery({
    queryKey: ["history", activeConfigId],
    queryFn: () => api<HistoryItem[]>(`/configs/${activeConfigId}/history`),
    enabled: initialized && isAuthenticated && !!activeConfigId && historyOpen,
  });
  const mfaStatus = useQuery({
    queryKey: ["auth", "mfa-status", user?.id],
    queryFn: () => authApi.getMfaStatus(accessToken!),
    enabled:
      initialized &&
      isAuthenticated &&
      !!accessToken &&
      activeAccountPage === "security",
  });
  const accountSettingsKey = ["auth", "account-settings", user?.id] as const;
  const accountSettings = useQuery({
    queryKey: accountSettingsKey,
    queryFn: async () =>
      normalizeAccountSettings(
        (await authApi.getMyProfile(accessToken!)).profile,
      ),
    enabled:
      initialized &&
      isAuthenticated &&
      !!accessToken &&
      activeAccountPage === "settings",
  });

  const projectOptions = useMemo(() => projects.data ?? [], [projects.data]);
  const serviceOptions = useMemo(() => services.data ?? [], [services.data]);
  const environmentOptions = useMemo(
    () => environments.data ?? [],
    [environments.data],
  );
  const selectedService =
    serviceOptions.find((service) => service.id === selectedServiceId) ??
    serviceOptions[0];
  const selectedEnvironment =
    environmentOptions.find(
      (environment) => environment.id === selectedEnvironmentId,
    ) ?? environmentOptions[0];
  const selectedProject = projectOptions.find(
    (project) => project.id === selectedService?.projectId,
  );
  const configs = useQuery({
    queryKey: ["configs", selectedService?.id, selectedEnvironment?.id, search],
    queryFn: () => {
      const query = new URLSearchParams();
      if (selectedEnvironment?.id)
        query.set("environmentId", selectedEnvironment.id);
      return api<Config[]>(
        `/configs/service/${selectedService?.id}${query.toString() ? `?${query.toString()}` : ""}`,
      );
    },
    enabled: initialized && isAuthenticated && !!selectedService?.id,
    select: (items) => {
      const normalizedSearch = search.trim().toLowerCase();
      if (!normalizedSearch) return items;
      return items.filter((item) =>
        [item.key, item.value, item.description ?? ""].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        ),
      );
    },
  });
  const configItems = useMemo(() => configs.data ?? [], [configs.data]);

  const projectForm = useForm<ProjectForm>({ defaultValues: emptyProject });
  const serviceForm = useForm<ServiceForm>({
    defaultValues: {
      projectId: "",
      name: "",
      code: "",
      type: "backend",
      description: "",
    },
  });
  const environmentForm = useForm<EnvironmentForm>({
    defaultValues: emptyEnvironment,
  });
  const configForm = useForm<ConfigForm>({
    defaultValues: {
      projectId: "",
      serviceId: "",
      environmentId: "",
      key: "",
      value: "",
      description: "",
      isSecret: false,
      isRequired: false,
    },
  });

  useEffect(() => {
    if (!editTarget?.item) return;
    if (editTarget.type === "project")
      projectForm.reset(toProjectForm(editTarget.item));
    if (editTarget.type === "service")
      serviceForm.reset(toServiceForm(editTarget.item));
    if (editTarget.type === "environment")
      environmentForm.reset(toEnvironmentForm(editTarget.item));
    if (editTarget.type === "config")
      configForm.reset(toConfigForm(editTarget.item));
  }, [editTarget, projectForm, serviceForm, environmentForm, configForm]);

  useEffect(() => {
    if (!selectedServiceId && serviceOptions[0])
      setSelectedServiceId(serviceOptions[0].id);
  }, [selectedServiceId, serviceOptions]);

  useEffect(() => {
    if (!selectedEnvironmentId && environmentOptions[0])
      setSelectedEnvironmentId(environmentOptions[0].id);
  }, [selectedEnvironmentId, environmentOptions]);

  useEffect(() => {
    if (!selectedService && selectedServiceId)
      setSelectedServiceId(serviceOptions[0]?.id ?? "");
  }, [selectedService, selectedServiceId, serviceOptions]);

  useEffect(() => {
    if (!selectedEnvironment && selectedEnvironmentId)
      setSelectedEnvironmentId(environmentOptions[0]?.id ?? "");
  }, [selectedEnvironment, selectedEnvironmentId, environmentOptions]);

  useEffect(() => {
    if (editTarget?.item) return;
    configForm.setValue("projectId", selectedProject?.id ?? "", {
      shouldDirty: false,
    });
    configForm.setValue("serviceId", selectedService?.id ?? "", {
      shouldDirty: false,
    });
    configForm.setValue("environmentId", selectedEnvironment?.id ?? "", {
      shouldDirty: false,
    });
  }, [
    configForm,
    selectedEnvironment,
    selectedProject,
    selectedService,
    editTarget,
  ]);

  useEffect(() => {
    if (activeSection !== "runtime-history") return;

    const firstConfig = configItems[0];
    if (!firstConfig) {
      setActiveConfigId(null);
      return;
    }

    const activeConfigStillVisible = configItems.some(
      (config) => config.id === activeConfigId,
    );
    if (!activeConfigId || !activeConfigStillVisible) {
      loadHistory(firstConfig.id);
    }
  }, [activeConfigId, activeSection, configItems]);

  const mutations = {
    project: useEntityMutations<ProjectForm>("projects", "/projects"),
    service: useEntityMutations<ServiceForm>("services", "/services"),
    environment: useEntityMutations<EnvironmentForm>(
      "environments",
      "/environments",
    ),
    config: useEntityMutations<ConfigForm>("configs", "/configs"),
  };

  async function invalidateAll() {
    await Promise.all(
      ["projects", "services", "environments", "configs", "dashboard"].map(
        (key) => queryClient.invalidateQueries({ queryKey: [key] }),
      ),
    );
  }

  async function submitForm(
    values: ProjectForm | ServiceForm | EnvironmentForm | ConfigForm,
  ) {
    if (!editTarget) return;
    const id = editTarget.item?.id;
    switch (editTarget.type) {
      case "project":
        await saveEntity(mutations.project, toProjectForm(values), id);
        break;
      case "service":
        await saveEntity(mutations.service, toServiceForm(values), id);
        break;
      case "environment":
        await saveEntity(mutations.environment, toEnvironmentForm(values), id);
        break;
      case "config":
        await saveEntity(mutations.config, toConfigForm(values), id);
        break;
    }
    resetForm(editTarget.type);
    setEditTarget(null);
    await invalidateAll();
  }

  function resetForm(type: EntityType) {
    if (type === "project") projectForm.reset(emptyProject);
    if (type === "service")
      serviceForm.reset({
        projectId: selectedProject?.id ?? projectOptions[0]?.id ?? "",
        name: "",
        code: "",
        type: "backend",
        description: "",
      });
    if (type === "environment") environmentForm.reset(emptyEnvironment);
    if (type === "config")
      configForm.reset({
        projectId: selectedProject?.id ?? "",
        serviceId: selectedService?.id ?? "",
        environmentId: selectedEnvironment?.id ?? "",
        key: "",
        value: "",
        description: "",
        isSecret: false,
        isRequired: false,
      });
  }

  function addEntity(type: EntityType) {
    resetForm(type);
    setEditTarget({ type });
  }

  async function deleteEntity(type: EntityType, id: string) {
    await mutations[type].remove.mutateAsync(id);
    await invalidateAll();
  }

  async function saveConfigValue(config: Config, value: string) {
    const updated = await api<Config>(`/configs/${config.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: config.projectId,
        serviceId: config.serviceId,
        environmentId: config.environmentId,
        key: config.key,
        value,
        description: config.description ?? "",
        isSecret: config.isSecret,
        isRequired: config.isRequired,
      }),
    });

    queryClient.setQueriesData<Config[]>(
      { queryKey: ["configs"] },
      (current) =>
        current?.map((item) => (item.id === updated.id ? updated : item)) ??
        current,
    );
  }

  async function bulkSaveConfigs(lines: Array<{ key: string; value: string }>) {
    if (!selectedService || !selectedEnvironment) return;

    await api(
      "/configs/bulk-upsert",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject?.id ?? selectedService.projectId,
          serviceId: selectedService.id,
          environmentId: selectedEnvironment.id,
          entries: lines,
        }),
      },
      BULK_UPSERT_TIMEOUT_MS,
    );

    await invalidateAll();
  }

  function loadHistory(configId: string) {
    setActiveConfigId(configId);
    setHistoryOpen(true);
    setActiveSection("runtime-history");
  }

  async function loadRuntime() {
    const service = selectedService;
    const environment = selectedEnvironment;
    if (!service || !environment) return;

    const runtime = await api<Record<string, string>>(
      `/runtime-config/${service.code}/${environment.code}`,
    );
    setRuntimeText(JSON.stringify(runtime, null, 2));
  }

  const contentMenu = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardOutlined />,
    },
    {
      key: "service",
      label: "Services",
      icon: <CloudServerOutlined />,
    },
    {
      key: "environment",
      label: "Environments",
      icon: <DeploymentUnitOutlined />,
    },
    {
      key: "config",
      label: "Service Configs",
      icon: <SlidersOutlined />,
    },
    {
      key: "runtime-history",
      label: "Runtime & History",
      icon: <HistoryOutlined />,
    },
    { key: "project", label: "Projects", icon: <ProjectOutlined /> },
  ] as const satisfies ReadonlyArray<{
    key: ConfigSection;
    label: string;
    icon: ReactNode;
  }>;

  const canRunScopedActions = !!selectedService && !!selectedEnvironment;
  const accountPaths = useMemo(
    () => ({
      profile: "/profile",
      settings: "/settings",
      security: "/security",
    }),
    [],
  );
  const activePath = activeAccountPage
    ? accountPaths[activeAccountPage]
    : `/config-center/${activeSection}`;
  const shellUser = {
    name:
      user?.fullName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.email,
    email: user?.email,
    role: user?.roles?.[0] ?? "SUPERADMIN",
    avatarUrl: user?.avatarUrl ?? undefined,
    tenantName: user?.tenantName ?? "Config Center workspace",
    fullName:
      user?.fullName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.email,
    phone: user?.phone,
    bio: user?.bio,
    birthday: user?.birthday,
    address: user?.address,
    city: user?.city,
    country: user?.country,
    jobTitle: user?.jobTitle ?? user?.roles?.[0] ?? "SUPERADMIN",
    department: user?.department ?? "Configuration",
    website: user?.website,
  };
  const shellMenu: MixiAdminMenuItem[] = [
    {
      label: "Workspace",
      icon: "config",
      items: [
        {
          label: submenuLabel("Config Center", <SettingOutlined />),
          href: "/config-center",
        },
        {
          label: submenuLabel("Mixi Admin", <AppstoreOutlined />),
          url: "http://localhost:3000/main",
          target: "_blank",
        },
      ],
    },
    {
      label: "Content",
      icon: "ecm",
      items: contentMenu.map((item) => ({
        label: submenuLabel(item.label, item.icon),
        href: `/config-center/${item.key}`,
      })),
    },
  ];

  const contentActions = (
    <>
      <Button
        data-testid="refresh-workspace-button"
        label="Refresh workspace"
        icon={<ReloadOutlined />}
        onClick={() => invalidateAll()}
        className="dashboard-header__action dashboard-header__action--ghost"
      />
      <Button
        data-testid="import-service-env-button"
        label="Import service ENV"
        icon={<UploadOutlined />}
        severity="secondary"
        onClick={() => setImportOpen(true)}
        disabled={!canRunScopedActions}
        className="dashboard-header__action dashboard-header__action--primary"
      />
      <Button
        data-testid="export-service-env-button"
        label="Export service ENV"
        icon={<DownloadOutlined />}
        variant="outlined"
        onClick={async () => {
          const query = new URLSearchParams({
            projectId: selectedProject?.id ?? "",
            serviceId: selectedService?.id ?? "",
            environmentId: selectedEnvironment?.id ?? "",
          }).toString();
          setRuntimeText(
            await api<string>(`/configs/export-env${query ? `?${query}` : ""}`),
          );
        }}
        disabled={!canRunScopedActions}
        className="dashboard-header__action dashboard-header__action--ghost"
      />
      <Button
        data-testid="reload-cache-button"
        label="Reload Cache"
        icon={<SyncOutlined />}
        variant="outlined"
        onClick={async () => {
          await api("/configs/reload-cache", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: selectedProject?.id ?? "",
              serviceId: selectedService?.id ?? "",
              environmentId: selectedEnvironment?.id ?? "",
            }),
          });
          await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        }}
        disabled={!canRunScopedActions}
        className="dashboard-header__action dashboard-header__action--ghost"
      />
    </>
  );

  return (
    <AuthGuard>
      <MixiAdminShell
        brand="MIXI CONFIG"
        logo={
          <Image src="/mixi-logo.svg" alt="" width={32} height={32} priority />
        }
        brandHref="/config-center"
        homeHref="/config-center"
        pageTitle="Config Center"
        menu={shellMenu}
        activePath={activePath}
        onNavigate={(href) => {
          const account = new URL(
            href,
            window.location.origin,
          ).searchParams.get("account");
          if (
            account === "profile" ||
            account === "settings" ||
            account === "security"
          ) {
            window.history.pushState(null, "", href);
            setActiveAccountPage(account);
            return;
          }

          setActiveAccountPage(null);
          const nextSection = href.replace(
            "/config-center/",
            "",
          ) as ConfigSection;
          if (contentMenu.some((item) => item.key === nextSection)) {
            window.history.pushState(null, "", href);
            setActiveSection(nextSection);
            return;
          }
          router.push(href);
        }}
        user={
          <AdminUserMenu
            user={shellUser}
            items={createMixiAccountMenuItems((href) => {
              if (
                href === accountPaths.profile ||
                href === accountPaths.settings ||
                href === accountPaths.security
              ) {
                router.push(href);
                return;
              }
              const account = new URL(
                href,
                window.location.origin,
              ).searchParams.get("account");
              if (
                account === "profile" ||
                account === "settings" ||
                account === "security"
              ) {
                window.history.pushState(null, "", href);
                setActiveAccountPage(account);
              }
            }, accountPaths)}
            onLogout={async () => {
              await logout();
              router.replace("/login");
            }}
          />
        }
      >
        {activeAccountPage ? (
          <MixiAccountPages
            page={activeAccountPage}
            user={shellUser}
            settings={{
              locale: user?.locale ?? undefined,
              timeZone: user?.timeZone ?? undefined,
              theme: user?.theme ?? undefined,
              colorScheme: user?.colorScheme ?? undefined,
              notifications: user?.notifications ?? undefined,
              ...accountSettings.data,
            }}
            activeTheme={
              accountSettings.data?.theme ?? user?.theme ?? undefined
            }
            mfaEnabled={mfaStatus.data?.enabled ?? false}
            authApiBaseUrl={publicEnv.authApiBaseUrl}
            ecmApiBaseUrl={publicEnv.ecmApiBaseUrl}
            api={{
              updateMySettings: async (token, nextSettings) => {
                const response = await authApi.updateMySettings(
                  token,
                  nextSettings,
                );
                const savedSettings = response.profile ?? nextSettings;
                queryClient.setQueryData(accountSettingsKey, savedSettings);
                updateUser(savedSettings);
                return { profile: savedSettings };
              },
            }}
            onMfaEnabledChange={(enabled) => {
              queryClient.setQueryData(["auth", "mfa-status", user?.id], {
                enabled,
              });
            }}
            onUserUpdated={({ role, ...updates }) =>
              updateUser({
                ...updates,
                email: updates.email ?? user?.email,
                roles: role ? [role] : user?.roles,
              })
            }
            onSettingsUpdated={(updates) => {
              queryClient.setQueryData<AccountSettings>(
                accountSettingsKey,
                (current = {}) => ({
                  ...current,
                  ...updates,
                }),
              );
              updateUser(updates);
            }}
          />
        ) : activeSection === "dashboard" ? (
          <DashboardHeader
            dashboard={dashboard.data}
            loading={
              initialized &&
              isAuthenticated &&
              (dashboard.isLoading ||
                projects.isLoading ||
                services.isLoading ||
                environments.isLoading)
            }
            projectName={selectedProject?.name}
            services={serviceOptions}
            environments={environmentOptions}
            selectedServiceId={selectedService?.id ?? ""}
            selectedEnvironmentId={selectedEnvironment?.id ?? ""}
            search={search}
            actions={contentActions}
            onServiceChange={setSelectedServiceId}
            onEnvironmentChange={setSelectedEnvironmentId}
            onSearchChange={setSearch}
          />
        ) : (
          <EntityTabs
            projects={projectOptions}
            services={serviceOptions}
            environments={environmentOptions}
            configs={configItems}
            apiBaseUrl={API_BASE}
            selectedServiceId={selectedService?.id ?? ""}
            selectedEnvironmentId={selectedEnvironment?.id ?? ""}
            activeSection={activeSection}
            loading={{
              project:
                initialized && isAuthenticated ? projects.isLoading : false,
              service:
                initialized && isAuthenticated ? services.isLoading : false,
              environment:
                initialized && isAuthenticated
                  ? environments.isLoading
                  : false,
              config:
                initialized && isAuthenticated ? configs.isLoading : false,
            }}
            runtimeText={runtimeText}
            history={history.data ?? []}
            runtimeLoading={
              initialized &&
              isAuthenticated &&
              (services.isLoading ||
                environments.isLoading ||
                configs.isLoading ||
                history.isLoading)
            }
            onAdd={addEntity}
            onEdit={(type: EntityType, item: EntityItem) => {
              if (type === "service") {
                const service = item as Service;
                setSelectedServiceId(service.id);
              }
              if (type === "config") {
                const config = item as Config;
                setSelectedServiceId(config.serviceId);
                setSelectedEnvironmentId(config.environmentId);
              }
              setEditTarget({ type, item });
            }}
            onDelete={deleteEntity}
            onSelectService={setSelectedServiceId}
            onSelectEnvironment={setSelectedEnvironmentId}
            onSaveConfigValue={saveConfigValue}
            onBulkSaveConfigs={bulkSaveConfigs}
            onHistory={loadHistory}
            onLoadRuntime={loadRuntime}
          />
        )}

        <EntityDialog
          visible={!!editTarget}
          activeType={editTarget?.type}
          onHide={() => setEditTarget(null)}
          onSubmit={submitForm}
          forms={{
            project: projectForm,
            service: serviceForm,
            environment: environmentForm,
            config: configForm,
          }}
          projectOptions={projectOptions}
          serviceOptions={serviceOptions}
          environmentOptions={environmentOptions}
        />

        <ImportEnvDialog
          visible={importOpen}
          value={envText}
          projectName={selectedProject?.name}
          serviceName={selectedService?.name}
          environmentName={selectedEnvironment?.name}
          onChange={setEnvText}
          onHide={() => setImportOpen(false)}
          onImport={async () => {
            await api("/configs/import-env", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: envText,
                projectId: selectedProject?.id ?? "",
                serviceId: selectedService?.id ?? "",
                environmentId: selectedEnvironment?.id ?? "",
              }),
            });
            setImportOpen(false);
            await queryClient.invalidateQueries({ queryKey: ["configs"] });
          }}
        />
      </MixiAdminShell>
    </AuthGuard>
  );
}

async function saveEntity<T>(
  mutations: ReturnType<typeof useEntityMutations<T>>,
  body: T,
  id?: string,
) {
  if (id) {
    await mutations.update.mutateAsync({ id, body });
  } else {
    await mutations.create.mutateAsync(body);
  }
}

function useEntityMutations<T>(queryKey: string, path: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  const request = (url: string, method: string, body?: T) =>
    api(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

  return {
    create: useMutation({
      mutationFn: (body: T) => request(path, "POST", body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: T }) =>
        request(`${path}/${id}`, "PUT", body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => request(`${path}/${id}`, "DELETE"),
      onSuccess: invalidate,
    }),
  };
}
