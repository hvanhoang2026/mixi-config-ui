export type Entity = {
  id: string;
  name: string;
  code: string;
  description?: string;
};
export type Project = Entity;
export type Service = Entity & {
  projectId: string;
  type: "backend" | "frontend" | "mobile" | "worker";
};
export type Environment = Entity;
export type Config = {
  id: string;
  projectId: string;
  serviceId: string;
  environmentId: string;
  key: string;
  value: string;
  description?: string;
  isSecret: boolean;
  isRequired: boolean;
};
export type HistoryItem = {
  id: string;
  configItemId: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  createdAt: string;
};
