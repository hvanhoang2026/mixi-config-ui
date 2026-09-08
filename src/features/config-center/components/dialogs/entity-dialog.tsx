"use client";

import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { Button, Checkbox, Form, Input, Modal, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type {
  ConfigForm,
  EntityType,
  EnvironmentForm,
  ProjectForm,
  ServiceForm,
} from "../../form-types";
import type { Environment, Project, Service } from "../../types";

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
  project: ["name", "code", "description"],
  service: ["projectId", "name", "code", "type", "description"],
  environment: ["name", "code", "description"],
  config: [
    "serviceId",
    "environmentId",
    "key",
    "value",
    "description",
    "isSecret",
    "isRequired",
  ],
};

export function EntityDialog({
  visible,
  activeType,
  onHide,
  onSubmit,
  forms,
  ...options
}: Props) {
  const title = activeType ?? "";

  if (!visible) return null;

  return (
    <Modal
      open={visible}
      onCancel={onHide}
      footer={null}
      data-testid="entity-dialog"
      title={`${title.charAt(0).toUpperCase()}${title.slice(1)} Form`}
      width={720}
      centered
      destroyOnHidden
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
    </Modal>
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
  const { handleSubmit, setValue, watch, formState } = form;
  const saving = formState.isSubmitting;

  return (
    <form
      data-testid="auto-entity-dialog-1-form"
      onSubmit={handleSubmit((values) => onSubmit(values as FormValues))}
      className="entity-form"
    >
      {activeFields.includes("projectId") && (
        <SelectField
          testId="entity-project"
          label="Project"
          options={projectOptions}
          value={watch("projectId")}
          onChange={(value) =>
            setValue("projectId", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder="Select project"
        />
      )}
      {activeFields.includes("serviceId") && (
        <SelectField
          testId="entity-service"
          label="Service"
          options={serviceOptions}
          value={watch("serviceId")}
          onChange={(value) =>
            setValue("serviceId", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder="Select service"
        />
      )}
      {activeFields.includes("environmentId") && (
        <SelectField
          testId="entity-environment"
          label="Environment"
          options={environmentOptions}
          value={watch("environmentId")}
          onChange={(value) =>
            setValue("environmentId", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder="Select environment"
        />
      )}
      {activeFields.includes("type") && (
        <SelectField
          label="Type"
          options={[
            { name: "Backend", id: "backend" },
            { name: "Frontend", id: "frontend" },
            { name: "Mobile", id: "mobile" },
            { name: "Worker", id: "worker" },
          ]}
          value={watch("type")}
          onChange={(value) =>
            setValue("type", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          testId="entity-type"
          placeholder="Select type"
        />
      )}
      {activeFields.includes("name") && (
        <Field
          label="Name"
          input={
            <Input
              data-testid="entity-name"
              value={watch("name") ?? ""}
              onChange={(e) =>
                setValue("name", e.target.value, { shouldDirty: true })
              }
              className="ui-full-width"
            />
          }
        />
      )}
      {activeFields.includes("code") && (
        <Field
          label="Code"
          input={
            <Input
              data-testid="entity-code"
              value={watch("code") ?? ""}
              onChange={(e) =>
                setValue("code", e.target.value, { shouldDirty: true })
              }
              className="ui-full-width"
            />
          }
        />
      )}
      {activeFields.includes("key") && (
        <Field
          label="Key"
          input={
            <Input
              data-testid="entity-key"
              value={watch("key") ?? ""}
              onChange={(e) =>
                setValue("key", e.target.value, { shouldDirty: true })
              }
              className="ui-full-width"
            />
          }
        />
      )}
      {activeFields.includes("value") && (
        <Field
          label="Value"
          input={
            <Input
              data-testid="entity-value"
              value={watch("value") ?? ""}
              onChange={(e) =>
                setValue("value", e.target.value, { shouldDirty: true })
              }
              className="ui-full-width"
            />
          }
        />
      )}
      {activeFields.includes("description") && (
        <Field
          label="Description"
          input={
            <Input.TextArea
              data-testid="entity-description"
              value={watch("description") ?? ""}
              onChange={(e) =>
                setValue("description", e.target.value, { shouldDirty: true })
              }
              rows={4}
              className="ui-full-width"
            />
          }
        />
      )}
      {activeFields.includes("isSecret") && (
        <CheckField
          label="Secret"
          checked={watch("isSecret")}
          onChange={(value) => setValue("isSecret", value)}
        />
      )}
      {activeFields.includes("isRequired") && (
        <CheckField
          label="Required"
          checked={watch("isRequired")}
          onChange={(value) => setValue("isRequired", value)}
        />
      )}
      <div
        data-testid="auto-entity-dialog-2-div"
        className="entity-form__actions"
      >
        <Button
          type="default"
          htmlType="button"
          data-testid="entity-cancel-button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          data-testid="entity-save-button"
          loading={saving}
          icon={saving ? undefined : <SaveOutlined />}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}

function SelectField({
  testId,
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  testId: string;
  label: string;
  options: Array<{ id: string; name: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const hasOptions = options.length > 0;
  return (
    <div data-testid="auto-entity-dialog-3-div" className="entity-form__field">
      <Form.Item label={label}>
        <Select
          data-testid={testId}
          value={value || undefined}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          options={options.map((o) => ({ label: o.name, value: o.id }))}
          placeholder={placeholder}
          showSearch
          allowClear
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          optionFilterProp="label"
          popupMatchSelectWidth
          getPopupContainer={() => document.body}
          classNames={{ popup: { root: "entity-select-dropdown" } }}
          notFoundContent={
            hasOptions ? "Không tìm thấy" : "Chưa có dữ liệu - hãy tạo mới"
          }
          className="ui-full-width"
          style={{ width: "100%" }}
          listHeight={256}
        />
      </Form.Item>
    </div>
  );
}

function Field({ label, input }: { label: string; input: ReactNode }) {
  return (
    <div data-testid="auto-entity-dialog-4-div" className="entity-form__field">
      <Form.Item label={label}>{input}</Form.Item>
    </div>
  );
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div data-testid="auto-entity-dialog-5-div" className="entity-form__check">
      <Checkbox
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span data-testid="auto-entity-dialog-6-span">{label}</span>
    </div>
  );
}
