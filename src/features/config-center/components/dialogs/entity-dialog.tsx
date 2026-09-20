"use client";

import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Grid,
  Box,
} from "@mui/material";
import { Save } from "@mui/icons-material";
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

const serviceTypeOptions: Array<{ name: string; id: string }> = [
  { name: "Backend", id: "backend" },
  { name: "Frontend", id: "frontend" },
  { name: "Mobile", id: "mobile" },
  { name: "Worker", id: "worker" },
];

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
    <Dialog
      open={visible}
      onClose={onHide}
      maxWidth="md"
      fullWidth
      data-testid="entity-dialog"
    >
      <DialogTitle>
        {title.charAt(0).toUpperCase() + title.slice(1)} Form
      </DialogTitle>
      {activeType && (
        <DialogContent dividers>
          <FormFields
            form={forms[activeType] as Form}
            fields={fields[activeType]}
            onSubmit={onSubmit}
            onCancel={onHide}
            {...options}
          />
        </DialogContent>
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
  const { handleSubmit, setValue, watch, formState } = form;
  const saving = formState.isSubmitting;

  return (
    <form
      data-testid="entity-dialog-form"
      onSubmit={handleSubmit((values) => onSubmit(values as FormValues))}
      style={{ display: "flex", flexDirection: "column", gap: 16, padding: 8 }}
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
          options={serviceTypeOptions}
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
        <TextField
          fullWidth
          label="Name"
          value={watch("name") ?? ""}
          onChange={(e) => setValue("name", e.target.value, { shouldDirty: true })}
          data-testid="entity-name"
        />
      )}
      {activeFields.includes("code") && (
        <TextField
          fullWidth
          label="Code"
          value={watch("code") ?? ""}
          onChange={(e) => setValue("code", e.target.value, { shouldDirty: true })}
          data-testid="entity-code"
        />
      )}
      {activeFields.includes("key") && (
        <TextField
          fullWidth
          label="Key"
          value={watch("key") ?? ""}
          onChange={(e) => setValue("key", e.target.value, { shouldDirty: true })}
          data-testid="entity-key"
        />
      )}
      {activeFields.includes("value") && (
        <TextField
          fullWidth
          label="Value"
          value={watch("value") ?? ""}
          onChange={(e) => setValue("value", e.target.value, { shouldDirty: true })}
          data-testid="entity-value"
        />
      )}
      {activeFields.includes("description") && (
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          value={watch("description") ?? ""}
          onChange={(e) => setValue("description", e.target.value, { shouldDirty: true })}
          data-testid="entity-description"
        />
      )}
      {activeFields.includes("isSecret") && (
        <FormControlLabel
          control={
            <Checkbox
              checked={watch("isSecret")}
              onChange={(event) => setValue("isSecret", event.target.checked)}
            />
          }
          label="Secret"
        />
      )}
      {activeFields.includes("isRequired") && (
        <FormControlLabel
          control={
            <Checkbox
              checked={watch("isRequired")}
              onChange={(event) => setValue("isRequired", event.target.checked)}
            />
          }
          label="Required"
        />
      )}
      <DialogActions sx={{ pt: 1, justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={saving}
          data-testid="entity-cancel-button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={saving ? undefined : <Save />}
          disabled={saving}
          data-testid="entity-save-button"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
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
    <TextField
      fullWidth
      select
      label={label}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testId}
      SelectProps={{
        native: true,
      }}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {hasOptions ? (
        options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))
      ) : (
        <option disabled value="">
          {hasOptions ? "No results found" : "No data available - create new"}
        </option>
      )}
    </TextField>
  );
}