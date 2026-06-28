import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormField } from 'w-iris-react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import type { ConfigForm, EntityType, EnvironmentForm, ProjectForm, ServiceForm } from '../../form-types';
import type { Environment, Project, Service } from '../../types';

type FormValues = ProjectForm | ServiceForm | EnvironmentForm | ConfigForm;
type Form = UseFormReturn<Record<string, any>>;

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
  const { register, handleSubmit, setValue, watch } = form;

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values as FormValues))} className="grid">
      {activeFields.includes('projectId') && <SelectField options={projectOptions} value={watch('projectId')} onChange={(value) => setValue('projectId', value)} placeholder="Project" />}
      {activeFields.includes('serviceId') && <SelectField options={serviceOptions} value={watch('serviceId')} onChange={(value) => setValue('serviceId', value)} placeholder="Service" />}
      {activeFields.includes('environmentId') && <SelectField options={environmentOptions} value={watch('environmentId')} onChange={(value) => setValue('environmentId', value)} placeholder="Environment" />}
      {activeFields.includes('type') && (
        <SelectField
          options={[{ name: 'Backend', id: 'backend' }, { name: 'Frontend', id: 'frontend' }, { name: 'Mobile', id: 'mobile' }, { name: 'Worker', id: 'worker' }]}
          value={watch('type')}
          onChange={(value) => setValue('type', value)}
          placeholder="Type"
        />
      )}
      {activeFields.includes('name') && <Field label="Name" input={<InputText {...register('name')} className="w-full" />} />}
      {activeFields.includes('code') && <Field label="Code" input={<InputText {...register('code')} className="w-full" />} />}
      {activeFields.includes('key') && <Field label="Key" input={<InputText {...register('key')} className="w-full" />} />}
      {activeFields.includes('value') && <Field label="Value" input={<InputText {...register('value')} className="w-full" />} />}
      {activeFields.includes('description') && <Field label="Description" input={<InputTextarea {...register('description')} rows={4} className="w-full" />} />}
      {activeFields.includes('isSecret') && <CheckField label="Secret" checked={watch('isSecret')} onChange={(value) => setValue('isSecret', value)} />}
      {activeFields.includes('isRequired') && <CheckField label="Required" checked={watch('isRequired')} onChange={(value) => setValue('isRequired', value)} />}
      <div className="col-12 flex justify-content-end gap-2 mt-3">
        <Button type="button" label="Cancel" severity="secondary" onClick={onCancel} />
        <Button type="submit" label="Save" />
      </div>
    </form>
  );
}

function SelectField({ options, value, onChange, placeholder }: { options: Array<{ id: string; name: string }>; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="col-12">
      <Dropdown optionLabel="name" optionValue="id" options={options} value={value} onChange={(event) => onChange(event.value)} placeholder={placeholder} className="w-full" />
    </div>
  );
}

function Field({ label, input }: { label: string; input: ReactNode }) {
  return (
    <div className="col-12">
      <FormField label={label}>{input}</FormField>
    </div>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="col-12 flex align-items-center gap-2">
      <Checkbox checked={checked} onChange={(event) => onChange(!!event.checked)} />
      <span>{label}</span>
    </div>
  );
}
