import type { Config, Environment, Project, Service } from './types';

export type EntityType = 'project' | 'service' | 'environment' | 'config';

export type ProjectForm = Pick<Project, 'name' | 'code' | 'description'>;
export type ServiceForm = Pick<Service, 'projectId' | 'name' | 'code' | 'type' | 'description'>;
export type EnvironmentForm = Pick<Environment, 'name' | 'code' | 'description'>;
export type ConfigForm = Omit<Config, 'id'>;

export type EntityItem = Project | Service | Environment | Config;
export type EditTarget = { type: EntityType; item?: EntityItem };
export type ConfigSection = 'service' | 'environment' | 'config' | 'runtime-history' | 'project';
