import type {
  ConfigForm,
  EnvironmentForm,
  ProjectForm,
  ServiceForm,
} from "./form-types";

type UnknownFormValues = object;

function fields(values: UnknownFormValues) {
  return values as Record<string, unknown>;
}

export function toProjectForm(values: UnknownFormValues): ProjectForm {
  const value = fields(values);
  return {
    name: String(value.name ?? ""),
    code: String(value.code ?? ""),
    description: String(value.description ?? ""),
  };
}

export function toServiceForm(values: UnknownFormValues): ServiceForm {
  const value = fields(values);
  return {
    projectId: String(value.projectId ?? ""),
    name: String(value.name ?? ""),
    code: String(value.code ?? ""),
    type: value.type as ServiceForm["type"],
    description: String(value.description ?? ""),
  };
}

export function toEnvironmentForm(values: UnknownFormValues): EnvironmentForm {
  const value = fields(values);
  return {
    name: String(value.name ?? ""),
    code: String(value.code ?? ""),
    description: String(value.description ?? ""),
  };
}

export function toConfigForm(values: UnknownFormValues): ConfigForm {
  const value = fields(values);
  return {
    projectId: String(value.projectId ?? ""),
    serviceId: String(value.serviceId ?? ""),
    environmentId: String(value.environmentId ?? ""),
    key: String(value.key ?? ""),
    value: String(value.value ?? ""),
    description: String(value.description ?? ""),
    isSecret: Boolean(value.isSecret),
    isRequired: Boolean(value.isRequired),
  };
}
