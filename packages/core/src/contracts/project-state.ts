export const CURRENT_PROJECT_STATE_SCHEMA_VERSION = 1;

export interface ProjectState {
  schemaVersion: number;
  updatedAt: string;
  installStatus: "installed";
  packageVersion: string;
  runtime?: {
    status: "blocked" | "failed" | "paused" | "complete";
    reason: string;
    nextSuggestedAction: string;
    updatedAt: string;
  };
}

export interface CreateInitialProjectStateOptions {
  packageVersion: string;
  updatedAt: Date;
}

export function createInitialProjectState(
  options: CreateInitialProjectStateOptions
): ProjectState {
  return {
    schemaVersion: CURRENT_PROJECT_STATE_SCHEMA_VERSION,
    updatedAt: options.updatedAt.toISOString(),
    installStatus: "installed",
    packageVersion: options.packageVersion
  };
}
