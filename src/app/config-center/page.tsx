'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthGuard } from '../../features/auth/auth-guard';
import { useAuth } from '../../features/auth/AuthProvider';
import { api } from '../../features/config-center/api';
import { AppShell } from '../../components/shell/app-shell';
import { DashboardHeader } from '../../features/config-center/components/dashboard/dashboard-header';
import { EntityDialog } from '../../features/config-center/components/dialogs/entity-dialog';
import { ImportEnvDialog } from '../../features/config-center/components/dialogs/import-env-dialog';
import { EntityTabs } from '../../features/config-center/components/entities/entity-tabs';
import type {
  ConfigSection,
  ConfigForm,
  EditTarget,
  EntityItem,
  EntityType,
  EnvironmentForm,
  ProjectForm,
  ServiceForm,
} from '../../features/config-center/form-types';
import { useCrud } from '../../features/config-center/hooks/use-crud';
import type { Config, Environment, HistoryItem, Project, Service } from '../../features/config-center/types';

const emptyProject: ProjectForm = { name: '', code: '', description: '' };
const emptyEnvironment: EnvironmentForm = { name: '', code: '', description: '' };

export default function ConfigCenterPage() {
  const { initialized, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ConfigSection>('project');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [search, setSearch] = useState('');
  const [envText, setEnvText] = useState('DB_HOST=localhost\nDB_PORT=5432\nJWT_SECRET=abc123');
  const [runtimeText, setRuntimeText] = useState('');

  const projects = useCrud<Project>('projects', '/projects');
  const services = useCrud<Service>('services', '/services');
  const environments = useCrud<Environment>('environments', '/environments');
  const configs = useQuery({
    queryKey: ['configs', search],
    queryFn: () => api<Config[]>(`/configs${search ? `?q=${encodeURIComponent(search)}` : ''}`),
    enabled: initialized && isAuthenticated,
  });
  const dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<Record<string, number>>('/dashboard'),
    enabled: initialized && isAuthenticated,
  });
  const history = useQuery({
    queryKey: ['history', activeConfigId],
    queryFn: () => api<HistoryItem[]>(`/configs/${activeConfigId}/history`),
    enabled: initialized && isAuthenticated && !!activeConfigId && historyOpen,
  });

  const projectOptions = projects.data ?? [];
  const serviceOptions = services.data ?? [];
  const environmentOptions = environments.data ?? [];
  const configItems = configs.data ?? [];

  const projectForm = useForm<ProjectForm>({ defaultValues: emptyProject });
  const serviceForm = useForm<ServiceForm>({ defaultValues: { projectId: '', name: '', code: '', type: 'backend', description: '' } });
  const environmentForm = useForm<EnvironmentForm>({ defaultValues: emptyEnvironment });
  const configForm = useForm<ConfigForm>({
    defaultValues: { projectId: '', serviceId: '', environmentId: '', key: '', value: '', description: '', isSecret: false, isRequired: false },
  });

  useEffect(() => {
    if (!editTarget?.item) return;
    if (editTarget.type === 'project') projectForm.reset(editTarget.item as Project);
    if (editTarget.type === 'service') serviceForm.reset(editTarget.item as Service);
    if (editTarget.type === 'environment') environmentForm.reset(editTarget.item as Environment);
    if (editTarget.type === 'config') configForm.reset(editTarget.item as Config);
  }, [editTarget, projectForm, serviceForm, environmentForm, configForm]);

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    void invalidateAll();
  }, [initialized, isAuthenticated]);

  const mutations = {
    project: useEntityMutations<ProjectForm>('projects', '/projects'),
    service: useEntityMutations<ServiceForm>('services', '/services'),
    environment: useEntityMutations<EnvironmentForm>('environments', '/environments'),
    config: useEntityMutations<ConfigForm>('configs', '/configs'),
  };

  async function invalidateAll() {
    await Promise.all(['projects', 'services', 'environments', 'configs', 'dashboard'].map(
      (key) => queryClient.invalidateQueries({ queryKey: [key] }),
    ));
  }

  async function submitForm(values: ProjectForm | ServiceForm | EnvironmentForm | ConfigForm) {
    if (!editTarget) return;
    const id = editTarget.item?.id;
    switch (editTarget.type) {
      case 'project':
        await saveEntity(mutations.project, values as ProjectForm, id);
        break;
      case 'service':
        await saveEntity(mutations.service, values as ServiceForm, id);
        break;
      case 'environment':
        await saveEntity(mutations.environment, values as EnvironmentForm, id);
        break;
      case 'config':
        await saveEntity(mutations.config, values as ConfigForm, id);
        break;
    }
    resetForm(editTarget.type);
    setEditTarget(null);
    await invalidateAll();
  }

  function resetForm(type: EntityType) {
    if (type === 'project') projectForm.reset(emptyProject);
    if (type === 'service') serviceForm.reset({ projectId: projectOptions[0]?.id ?? '', name: '', code: '', type: 'backend', description: '' });
    if (type === 'environment') environmentForm.reset(emptyEnvironment);
    if (type === 'config') configForm.reset({
      projectId: projectOptions[0]?.id ?? '',
      serviceId: serviceOptions[0]?.id ?? '',
      environmentId: environmentOptions[0]?.id ?? '',
      key: '',
      value: '',
      description: '',
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

  function loadHistory(configId: string) {
    setActiveConfigId(configId);
    setHistoryOpen(true);
    setActiveSection('runtime-history');
  }

  const contentMenu = [
    { key: 'project', label: 'Projects', icon: 'pi pi-folder' },
    { key: 'service', label: 'Services', icon: 'pi pi-briefcase' },
    { key: 'environment', label: 'Environments', icon: 'pi pi-globe' },
    { key: 'config', label: 'Configs', icon: 'pi pi-sliders-h' },
    { key: 'runtime-history', label: 'Runtime & History', icon: 'pi pi-history' },
  ] as const satisfies ReadonlyArray<{ key: ConfigSection; label: string; icon: string }>;

  return (
    <AppShell
      title="Config Center"
      subtitle="Centralize environment variables, runtime exports, and delivery-safe operational changes across your Mixi services."
      navigation={
        <>
          {contentMenu.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`app-sidebar__link app-sidebar__button${activeSection === item.key ? ' is-active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              <i className={`pi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </>
      }
    >
      <AuthGuard>
        <DashboardHeader
          dashboard={dashboard.data}
          search={search}
          onSearchChange={setSearch}
          onReload={() => queryClient.invalidateQueries()}
          onImport={() => setImportOpen(true)}
          onExport={async () => {
            const query = serviceOptions[0]?.id ? `?serviceId=${serviceOptions[0].id}` : '';
            setRuntimeText(await api<string>(`/configs/export-env${query}`));
          }}
          onReloadCache={async () => {
            await api('/configs/reload-cache', { method: 'POST' });
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }}
        />

        <EntityTabs
          projects={projectOptions}
          services={serviceOptions}
          environments={environmentOptions}
          configs={configItems}
          activeSection={activeSection}
          loading={{
            project: initialized && isAuthenticated ? projects.isLoading : false,
            service: initialized && isAuthenticated ? services.isLoading : false,
            environment: initialized && isAuthenticated ? environments.isLoading : false,
            config: initialized && isAuthenticated ? configs.isLoading : false,
          }}
          runtimeText={runtimeText}
          history={history.data ?? []}
          onAdd={addEntity}
          onEdit={(type: EntityType, item: EntityItem) => setEditTarget({ type, item })}
          onDelete={deleteEntity}
          onHistory={loadHistory}
          onLoadRuntime={async () => {
            const service = serviceOptions[0];
            const environment = environmentOptions[0];
            if (service && environment) {
              setRuntimeText(await api<string>(`/runtime-config/${service.code}/${environment.code}`));
            }
          }}
        />

        <EntityDialog
          visible={!!editTarget}
          activeType={editTarget?.type}
          onHide={() => setEditTarget(null)}
          onSubmit={submitForm}
          forms={{ project: projectForm, service: serviceForm, environment: environmentForm, config: configForm }}
          projectOptions={projectOptions}
          serviceOptions={serviceOptions}
          environmentOptions={environmentOptions}
        />

        <ImportEnvDialog
          visible={importOpen}
          value={envText}
          onChange={setEnvText}
          onHide={() => setImportOpen(false)}
          onImport={async () => {
            await api('/configs/import-env', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: envText }),
            });
            setImportOpen(false);
            await queryClient.invalidateQueries({ queryKey: ['configs'] });
          }}
        />
      </AuthGuard>
    </AppShell>
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
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });
  const request = (url: string, method: string, body?: T) => api(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return {
    create: useMutation({ mutationFn: (body: T) => request(path, 'POST', body), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, body }: { id: string; body: T }) => request(`${path}/${id}`, 'PUT', body), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => request(`${path}/${id}`, 'DELETE'), onSuccess: invalidate }),
  };
}
