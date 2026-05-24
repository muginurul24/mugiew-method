import path from "node:path";

import { detectProjectRoot } from "./workspace-detector.js";

export const MUGIEW_DIRECTORY_NAME = "_mugiew-method";
export const AGENTS_FILE_NAME = "AGENTS.md";

export const MUGIEW_MANAGED_DIRECTORY_NAMES = [
  "discovery",
  "prd",
  "tasks",
  "journal",
  "state",
  "rules"
] as const;

export type MugiewManagedDirectoryName =
  (typeof MUGIEW_MANAGED_DIRECTORY_NAMES)[number];

export type MugiewDirectoryPaths = Record<MugiewManagedDirectoryName, string>;

export interface MugiewProjectPaths {
  projectRoot: string;
  agentsFile: string;
  mugiewRoot: string;
  discovery: string;
  prd: string;
  tasks: string;
  journal: string;
  state: string;
  rules: string;
}

export interface ResolveProjectPathsOptions {
  startDirectory?: string;
}

export const MUGIEW_RELATIVE_DIRECTORY_PATHS = {
  discovery: path.join(MUGIEW_DIRECTORY_NAME, "discovery"),
  prd: path.join(MUGIEW_DIRECTORY_NAME, "prd"),
  tasks: path.join(MUGIEW_DIRECTORY_NAME, "tasks"),
  journal: path.join(MUGIEW_DIRECTORY_NAME, "journal"),
  state: path.join(MUGIEW_DIRECTORY_NAME, "state"),
  rules: path.join(MUGIEW_DIRECTORY_NAME, "rules")
} as const satisfies Record<MugiewManagedDirectoryName, string>;

export function createProjectPaths(projectRoot: string): MugiewProjectPaths {
  const resolvedRoot = path.resolve(projectRoot);
  const directoryPaths = Object.fromEntries(
    MUGIEW_MANAGED_DIRECTORY_NAMES.map((directoryName) => [
      directoryName,
      path.join(resolvedRoot, MUGIEW_RELATIVE_DIRECTORY_PATHS[directoryName])
    ])
  ) as MugiewDirectoryPaths;

  return {
    projectRoot: resolvedRoot,
    agentsFile: path.join(resolvedRoot, AGENTS_FILE_NAME),
    mugiewRoot: path.join(resolvedRoot, MUGIEW_DIRECTORY_NAME),
    ...directoryPaths
  };
}

export function resolveProjectPaths(
  options: ResolveProjectPathsOptions = {}
): MugiewProjectPaths {
  return createProjectPaths(
    detectProjectRoot({ startDirectory: options.startDirectory })
  );
}
