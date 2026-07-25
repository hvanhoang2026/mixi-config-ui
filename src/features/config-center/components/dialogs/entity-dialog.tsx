import type { ReactNode } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { FormField } from '@w-iris/react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import type { ConfigForm, EntityType, EnvironmentForm, ProjectForm, ServiceForm } from '../../form-types';
import type { Environment, Project, Service } from '../../types';

type FormValues = ProjectForm | ServiceForm | EnvironmentForm | ConfigForm;
type Form = UseFormReturn<FieldValues>;

type Props = {
  visible: boolean;
  activeType?: EntityType;
  onHide: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
  forms: Record<EntityType, unknown>;
  projectOptions: Project[];
  serviceOptions: Service[];
  environmentOptions: Environment[];
};

const fields: Record<EntityType, string[]> = {
  project: ['name', 'code', 'description'],
  service: ['projectId', 'name', 'code', 'type', 'description'],
  environment: ['name', 'code', 'description'],
  config: ['serviceId', 'environmentId', 'key', 'value', 'description', 'isSecret', 'isRequired'],
};

export function EntityDialog({ visible, activeType, onHide, onSubmit, forms, ...options }: Props) {
  const title = activeType ?? '';

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      data-testid="entity-dialog"
      header={`${title.charAt(0).toUpperCase()}${title.slice(1)} Form`}
      style={{ width: 'min(720px, 96vw)' }}
    >
      {activeType && (
        <FormFields
          form={forms[activeType] as Form}
          fields={fields[activeType]}
          onSubmit={onSubmit}
          onCancel={onHide}
          {...options}
        />
      )}
    </Dialog>
  );
}

function FormFields({
  form,
  onSubmit,
  onCancel,
  fields: activeFields,
  projectOptions,
  serviceOptions,
  environmentOptions,
}: {
  form: Form;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
  fields: string[];
  projectOptions: Project[];
  serviceOptions: Service[];
  environmentOptions: Environment[];
}) {
  const { register, handleSubmit, setValue, watch, formState } = form;
  const saving = formState.isSubmitting;

  return (
    <form data-testid="auto-entity-dialog-1-form" onSubmit={handleSubmit((values) => onSubmit(values as FormValues))} className="grid">
      {activeFields.includes('projectId') && <SelectField testId="entity-project" options={projectOptions} value={watch('projectId')} onChange={(value) => setValue('projectId', value)} placeholder="Project" />}
      {activeFields.includes('serviceId') && <SelectField testId="entity-service" options={serviceOptions} value={watch('serviceId')} onChange={(value) => setValue('serviceId', value)} placeholder="Service" />}
      {activeFields.includes('environmentId') && <SelectField testId="entity-environment" options={environmentOptions} value={watch('environmentId')} onChange={(value) => setValue('environmentId', value)} placeholder="Environment" />}
      {activeFields.includes('type') && (
        <SelectField
          options={[{ name: 'Backend', id: 'backend' }, { name: 'Frontend', id: 'frontend' }, { name: 'Mobile', id: 'mobile' }, { name: 'Worker', id: 'worker' }]}
          value={watch('type')}
          onChange={(value) => setValue('type', value)}
          testId="entity-type"
          placeholder="Type"
        />
      )}
      {activeFields.includes('name') && <Field label="Name" input={<InputText data-testid="entity-name" {...register('name')} className="w-full" />} />}
      {activeFields.includes('code') && <Field label="Code" input={<InputText data-testid="entity-code" {...register('code')} className="w-full" />} />}
      {activeFields.includes('key') && <Field label="Key" input={<InputText data-testid="entity-key" {...register('key')} className="w-full" />} />}
      {activeFields.includes('value') && <Field label="Value" input={<InputText data-testid="entity-value" {...register('value')} className="w-full" />} />}
      {activeFields.includes('description') && <Field label="Description" input={<InputTextarea data-testid="entity-description" {...register('description')} rows={4} className="w-full" />} />}
      {activeFields.includes('isSecret') && <CheckField label="Secret" checked={watch('isSecret')} onChange={(value) => setValue('isSecret', value)} />}
      {activeFields.includes('isRequired') && <CheckField label="Required" checked={watch('isRequired')} onChange={(value) => setValue('isRequired', value)} />}
      <div data-testid="auto-entity-dialog-2-div" className="col-12 flex justify-content-end gap-2 mt-3">
        <Button type="button" data-testid="entity-cancel-button" label="Cancel" severity="secondary" onClick={onCancel} disabled={saving} />
        <Button
          type="submit"
          data-testid="entity-save-button"
          label={saving ? 'Saving...' : 'Save'}
          icon={saving ? undefined : 'pi pi-save'}
          loading={saving}
          loadingIcon="pi pi-spinner pi-spin"
          disabled={saving}
        />
      </div>
    </form>
  );
}

function SelectField({ testId, options, value, onChange, placeholder }: { testId: string; options: Array<{ id: string; name: string }>; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div data-testid="auto-entity-dialog-3-div" className="col-12">
      <Dropdown data-testid={testId} optionLabel="name" optionValue="id" options={options} value={value} onChange={(event) => onChange(event.value)} placeholder={placeholder} className="w-full" />
    </div>
  );
}

function Field({ label, input }: { label: string; input: ReactNode }) {
  return (
    <div data-testid="auto-entity-dialog-4-div" className="col-12">
      <FormField label={label}>{input}</FormField>
    </div>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div data-testid="auto-entity-dialog-5-div" className="col-12 flex align-items-center gap-2">
      <Checkbox checked={checked} onChange={(event) => onChange(!!event.checked)} />
      <span data-testid="auto-entity-dialog-6-span">{label}</span>
    </div>
  );
}
