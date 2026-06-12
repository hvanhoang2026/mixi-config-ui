'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { api } from '../../features/config-center/api';
import type { Config, Environment, HistoryItem, Project, Service } from '../../features/config-center/types';
type ProjectForm = { name: string; code: string; description?: string };
type ServiceForm = { projectId: string; name: string; code: string; type: Service['type']; description?: string };
type EnvironmentForm = { name: string; code: string; description?: string };
type ConfigForm = {
  projectId: string;
  serviceId: string;
  environmentId: string;
  key: string;
  value: string;
  description?: string;
  isSecret: boolean;
  isRequired: boolean;
};

function useCrud<T>(key: string, path: string) {
  return useQuery({ queryKey: [key], queryFn: () => api<T[]>(path) });
}

export default function ConfigCenterPage() {
  const qc = useQueryClient();
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ type: 'project' | 'service' | 'environment' | 'config'; item?: any } | null>(null);
  const [search, setSearch] = useState('');
  const [envText, setEnvText] = useState('DB_HOST=localhost\nDB_PORT=5432\nJWT_SECRET=abc123');
  const [runtimeText, setRuntimeText] = useState('');

  const projects = useCrud<Project>('projects', '/projects');
  const services = useCrud<Service>('services', '/services');
  const environments = useCrud<Environment>('environments', '/environments');
  const configs = useQuery({
    queryKey: ['configs', search],
    queryFn: () => api<Config[]>(`/configs${search ? `?q=${encodeURIComponent(search)}` : ''}`),
  });
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: () => api<any>('/dashboard') });
  const history = useQuery({
    queryKey: ['history', activeConfigId],
    queryFn: () => api<HistoryItem[]>(`/configs/${activeConfigId}/history`),
    enabled: !!activeConfigId && historyOpen,
  });

  const projectOptions = projects.data ?? [];
  const serviceOptions = services.data ?? [];
  const environmentOptions = environments.data ?? [];

  const projectForm = useForm<ProjectForm>({ defaultValues: { name: '', code: '', description: '' } });
  const serviceForm = useForm<ServiceForm>({ defaultValues: { projectId: '', name: '', code: '', type: 'backend', description: '' } });
  const environmentForm = useForm<EnvironmentForm>({ defaultValues: { name: '', code: '', description: '' } });
  const configForm = useForm<ConfigForm>({
    defaultValues: { projectId: '', serviceId: '', environmentId: '', key: '', value: '', description: '', isSecret: false, isRequired: false },
  });

  useEffect(() => {
    if (!editTarget) return;
    if (editTarget.type === 'project' && editTarget.item) projectForm.reset(editTarget.item);
    if (editTarget.type === 'service' && editTarget.item) serviceForm.reset(editTarget.item);
    if (editTarget.type === 'environment' && editTarget.item) environmentForm.reset(editTarget.item);
    if (editTarget.type === 'config' && editTarget.item) configForm.reset(editTarget.item);
  }, [editTarget]);

  const createProject = useMutation({
    mutationFn: (body: ProjectForm) => api('/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
  const updateProject = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ProjectForm }) => api(`/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
  const deleteProject = useMutation({
    mutationFn: (id: string) => api(`/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });

  const createService = useMutation({
    mutationFn: (body: ServiceForm) => api('/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
  const updateService = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ServiceForm }) => api(`/services/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
  const deleteService = useMutation({
    mutationFn: (id: string) => api(`/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });

  const createEnvironment = useMutation({
    mutationFn: (body: EnvironmentForm) => api('/environments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['environments'] }),
  });
  const updateEnvironment = useMutation({
    mutationFn: ({ id, body }: { id: string; body: EnvironmentForm }) => api(`/environments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['environments'] }),
  });
  const deleteEnvironment = useMutation({
    mutationFn: (id: string) => api(`/environments/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['environments'] }),
  });

  const createConfig = useMutation({
    mutationFn: (body: ConfigForm) => api('/configs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['configs'] }),
  });
  const updateConfig = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ConfigForm }) => api(`/configs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['configs'] }),
  });
  const deleteConfig = useMutation({
    mutationFn: (id: string) => api(`/configs/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['configs'] }),
  });

  async function submitForm(type: 'project' | 'service' | 'environment' | 'config', values: any) {
    if (type === 'project') {
      editTarget?.item ? await updateProject.mutateAsync({ id: editTarget.item.id, body: values }) : await createProject.mutateAsync(values);
      projectForm.reset();
    }
    if (type === 'service') {
      editTarget?.item ? await updateService.mutateAsync({ id: editTarget.item.id, body: values }) : await createService.mutateAsync(values);
      serviceForm.reset();
    }
    if (type === 'environment') {
      editTarget?.item ? await updateEnvironment.mutateAsync({ id: editTarget.item.id, body: values }) : await createEnvironment.mutateAsync(values);
      environmentForm.reset();
    }
    if (type === 'config') {
      editTarget?.item ? await updateConfig.mutateAsync({ id: editTarget.item.id, body: values }) : await createConfig.mutateAsync(values);
      configForm.reset();
    }
    setEditTarget(null);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['projects'] }),
      qc.invalidateQueries({ queryKey: ['services'] }),
      qc.invalidateQueries({ queryKey: ['environments'] }),
      qc.invalidateQueries({ queryKey: ['configs'] }),
      qc.invalidateQueries({ queryKey: ['dashboard'] }),
    ]);
  }

  return (
    <main style={{ padding: 24, maxWidth: 1500, margin: '0 auto' }}>
      <Card title="Mixi Config Center" subTitle="CRUD, search, export, history, runtime config">
        <div className="flex gap-2 flex-wrap align-items-center">
          <Button label="Reload all" icon="pi pi-refresh" onClick={async () => { await qc.invalidateQueries(); }} />
          <Button label="Import ENV" icon="pi pi-upload" severity="secondary" onClick={() => setImportOpen(true)} />
          <Button label="Export ENV" icon="pi pi-download" outlined onClick={async () => {
            const text = await api<string>(`/configs/export-env${serviceOptions[0]?.id ? `?serviceId=${serviceOptions[0].id}` : ''}`);
            setRuntimeText(text);
          }} />
          <Button label="Reload Cache" icon="pi pi-sync" outlined onClick={async () => { await api('/configs/reload-cache', { method: 'POST' }); await qc.invalidateQueries({ queryKey: ['dashboard'] }); }} />
          <InputText value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search configs" />
        </div>
        <div className="grid mt-3">
          <div className="col-12 md:col-3"><Card title="Projects">{dashboard.data?.totalProjects ?? 0}</Card></div>
          <div className="col-12 md:col-3"><Card title="Services">{dashboard.data?.totalServices ?? 0}</Card></div>
          <div className="col-12 md:col-3"><Card title="Environments">{dashboard.data?.totalEnvironments ?? 0}</Card></div>
          <div className="col-12 md:col-3"><Card title="Configs">{dashboard.data?.totalConfigs ?? 0}</Card></div>
        </div>
      </Card>

      <TabView className="mt-3">
        <TabPanel header="Projects">
          <CrudHeader onAdd={() => { projectForm.reset({ name: '', code: '', description: '' }); setEditTarget({ type: 'project' }); }} />
          <DataTable value={projects.data ?? []} loading={projects.isLoading} responsiveLayout="scroll">
            <Column field="name" header="Name" />
            <Column field="code" header="Code" />
            <Column field="description" header="Description" />
            <Column header="Actions" body={(row: Project) => actionButtons('project', row)} />
          </DataTable>
        </TabPanel>
        <TabPanel header="Services">
          <CrudHeader onAdd={() => { serviceForm.reset({ projectId: projectOptions[0]?.id ?? '', name: '', code: '', type: 'backend', description: '' }); setEditTarget({ type: 'service' }); }} />
          <DataTable value={services.data ?? []} loading={services.isLoading} responsiveLayout="scroll">
            <Column field="name" header="Name" />
            <Column field="code" header="Code" />
            <Column field="type" header="Type" />
            <Column field="projectId" header="Project" body={(row: Service) => projectOptions.find((p) => p.id === row.projectId)?.name ?? row.projectId} />
            <Column header="Actions" body={(row: Service) => actionButtons('service', row)} />
          </DataTable>
        </TabPanel>
        <TabPanel header="Environments">
          <CrudHeader onAdd={() => { environmentForm.reset({ name: '', code: '', description: '' }); setEditTarget({ type: 'environment' }); }} />
          <DataTable value={environments.data ?? []} loading={environments.isLoading} responsiveLayout="scroll">
            <Column field="name" header="Name" />
            <Column field="code" header="Code" />
            <Column field="description" header="Description" />
            <Column header="Actions" body={(row: Environment) => actionButtons('environment', row)} />
          </DataTable>
        </TabPanel>
        <TabPanel header="Configs">
          <CrudHeader onAdd={() => {
            configForm.reset({ projectId: projectOptions[0]?.id ?? '', serviceId: serviceOptions[0]?.id ?? '', environmentId: environmentOptions[0]?.id ?? '', key: '', value: '', description: '', isSecret: false, isRequired: false });
            setEditTarget({ type: 'config' });
          }} />
          <DataTable value={configs.data ?? []} loading={configs.isLoading} responsiveLayout="scroll">
            <Column field="key" header="Key" />
            <Column field="value" header="Value" />
            <Column field="description" header="Description" />
            <Column field="isSecret" header="Secret" body={(row: Config) => (row.isSecret ? 'Yes' : 'No')} />
            <Column field="isRequired" header="Required" body={(row: Config) => (row.isRequired ? 'Yes' : 'No')} />
            <Column header="Actions" body={(row: Config) => actionButtons('config', row)} />
          </DataTable>
        </TabPanel>
        <TabPanel header="Runtime & History">
          <div className="grid">
            <div className="col-12 md:col-6">
              <Card title="Runtime Preview">
                <Button label="Load runtime" onClick={async () => {
                  const service = serviceOptions[0];
                  const environment = environmentOptions[0];
                  if (!service || !environment) return;
                  setRuntimeText(await api<string>(`/runtime-config/${service.code}/${environment.code}`));
                }} />
                <pre style={{ whiteSpace: 'pre-wrap' }}>{runtimeText}</pre>
              </Card>
            </div>
            <div className="col-12 md:col-6">
              <Card title="History">
                <Button label="Load history" onClick={() => {
                  const first = configs.data?.[0];
                  if (first) {
                    setActiveConfigId(first.id);
                    setHistoryOpen(true);
                  }
                }} />
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(history.data ?? [], null, 2)}</pre>
              </Card>
            </div>
          </div>
        </TabPanel>
      </TabView>

      <EntityDialog
        visible={!!editTarget}
        title={editTarget?.type ?? ''}
        onHide={() => setEditTarget(null)}
        onSubmit={async (values: Record<string, unknown>) => {
          if (!editTarget) return;
          await submitForm(editTarget.type, values);
        }}
        projectForm={projectForm}
        serviceForm={serviceForm}
        environmentForm={environmentForm}
        configForm={configForm}
        projectOptions={projectOptions}
        serviceOptions={serviceOptions}
        environmentOptions={environmentOptions}
        activeType={editTarget?.type}
      />

      <Dialog visible={importOpen} onHide={() => setImportOpen(false)} header="Import ENV" style={{ width: 'min(760px, 95vw)' }}>
        <InputTextarea value={envText} onChange={(e) => setEnvText(e.target.value)} rows={16} className="w-full" />
        <div className="mt-3 flex justify-content-end gap-2">
          <Button label="Close" severity="secondary" onClick={() => setImportOpen(false)} />
          <Button label="Import" onClick={async () => { await api('/configs/import-env', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: envText }) }); setImportOpen(false); await qc.invalidateQueries({ queryKey: ['configs'] }); }} />
        </div>
      </Dialog>
    </main>
  );

  function actionButtons(type: 'project' | 'service' | 'environment' | 'config', row: any) {
    return (
      <div className="flex gap-2">
        <Button size="small" icon="pi pi-pencil" text onClick={() => setEditTarget({ type, item: row })} />
        {type === 'config' && (
          <Button
            size="small"
            icon="pi pi-history"
            text
            onClick={() => {
              setActiveConfigId(row.id);
              setHistoryOpen(true);
            }}
          />
        )}
        <Button
          size="small"
          icon="pi pi-trash"
          text
          severity="danger"
          onClick={async () => {
            const map = { project: deleteProject, service: deleteService, environment: deleteEnvironment, config: deleteConfig } as const;
            await map[type].mutateAsync(row.id);
            await Promise.all([
              qc.invalidateQueries({ queryKey: ['projects'] }),
              qc.invalidateQueries({ queryKey: ['services'] }),
              qc.invalidateQueries({ queryKey: ['environments'] }),
              qc.invalidateQueries({ queryKey: ['configs'] }),
              qc.invalidateQueries({ queryKey: ['dashboard'] }),
            ]);
          }}
        />
      </div>
    );
  }
}

function CrudHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mb-3 flex justify-content-end">
      <Button label="Add new" icon="pi pi-plus" onClick={onAdd} />
    </div>
  );
}

function EntityDialog({
  visible,
  title,
  onHide,
  onSubmit,
  projectForm,
  serviceForm,
  environmentForm,
  configForm,
  projectOptions,
  serviceOptions,
  environmentOptions,
  activeType,
}: any) {
  return (
    <Dialog visible={visible} onHide={onHide} header={`${title.charAt(0).toUpperCase()}${title.slice(1)} Form`} style={{ width: 'min(720px, 96vw)' }}>
      {activeType === 'project' && <FormFields form={projectForm} onSubmit={onSubmit} onCancel={onHide} fields={['name', 'code', 'description']} />}
      {activeType === 'service' && <FormFields form={serviceForm} onSubmit={onSubmit} onCancel={onHide} fields={['projectId', 'name', 'code', 'type', 'description']} projectOptions={projectOptions} />}
      {activeType === 'environment' && <FormFields form={environmentForm} onSubmit={onSubmit} onCancel={onHide} fields={['name', 'code', 'description']} />}
      {activeType === 'config' && <FormFields form={configForm} onSubmit={onSubmit} onCancel={onHide} fields={['projectId', 'serviceId', 'environmentId', 'key', 'value', 'description', 'isSecret', 'isRequired']} projectOptions={projectOptions} serviceOptions={serviceOptions} environmentOptions={environmentOptions} />}
    </Dialog>
  );
}

function FormFields({ form, onSubmit, onCancel, fields, projectOptions = [], serviceOptions = [], environmentOptions = [] }: any) {
  const { register, handleSubmit, setValue, watch } = form;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid">
      {fields.includes('projectId') && (
        <div className="col-12">
          <Dropdown optionLabel="name" optionValue="id" options={projectOptions} value={watch('projectId')} onChange={(e) => setValue('projectId', e.value)} placeholder="Project" className="w-full" />
        </div>
      )}
      {fields.includes('serviceId') && (
        <div className="col-12">
          <Dropdown optionLabel="name" optionValue="id" options={serviceOptions} value={watch('serviceId')} onChange={(e) => setValue('serviceId', e.value)} placeholder="Service" className="w-full" />
        </div>
      )}
      {fields.includes('environmentId') && (
        <div className="col-12">
          <Dropdown optionLabel="name" optionValue="id" options={environmentOptions} value={watch('environmentId')} onChange={(e) => setValue('environmentId', e.value)} placeholder="Environment" className="w-full" />
        </div>
      )}
      {fields.includes('type') && (
        <div className="col-12">
          <Dropdown optionLabel="label" optionValue="value" options={[{ label: 'Backend', value: 'backend' }, { label: 'Frontend', value: 'frontend' }, { label: 'Mobile', value: 'mobile' }, { label: 'Worker', value: 'worker' }]} value={watch('type')} onChange={(e) => setValue('type', e.value)} className="w-full" />
        </div>
      )}
      {fields.includes('name') && <Field label="Name" input={<InputText {...register('name')} className="w-full" />} />}
      {fields.includes('code') && <Field label="Code" input={<InputText {...register('code')} className="w-full" />} />}
      {fields.includes('key') && <Field label="Key" input={<InputText {...register('key')} className="w-full" />} />}
      {fields.includes('value') && <Field label="Value" input={<InputText {...register('value')} className="w-full" />} />}
      {fields.includes('description') && <Field label="Description" input={<InputTextarea {...register('description')} rows={4} className="w-full" />} />}
      {fields.includes('isSecret') && <CheckField label="Secret" checked={watch('isSecret')} onChange={(value: boolean) => setValue('isSecret', value)} />}
      {fields.includes('isRequired') && <CheckField label="Required" checked={watch('isRequired')} onChange={(value: boolean) => setValue('isRequired', value)} />}
      <div className="col-12 flex justify-content-end gap-2 mt-3">
        <Button type="button" label="Cancel" severity="secondary" onClick={onCancel} />
        <Button type="submit" label="Save" />
      </div>
    </form>
  );
}

function Field({ label, input }: { label: string; input: ReactNode }) {
  return (
    <div className="col-12">
      <div className="mb-1">{label}</div>
      {input}
    </div>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="col-12 flex align-items-center gap-2">
      <Checkbox checked={checked} onChange={(e) => onChange(!!e.checked)} />
      <span>{label}</span>
    </div>
  );
}
