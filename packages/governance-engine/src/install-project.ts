import fs from "node:fs/promises";
import path from "node:path";

import {
  CURRENT_PROJECT_STATE_SCHEMA_VERSION,
  SchemaVersionError,
  createInitialProjectState,
  createProjectPaths,
  safeWriteFile
} from "@mugiew-method/core";

export type InstallProjectStatus =
  | "installed"
  | "already-installed"
  | "partial-installation";

export interface InstallProjectOptions {
  projectRoot: string;
  packageVersion: string;
  now?: Date;
}

export interface InstallProjectResult {
  projectRoot: string;
  status: InstallProjectStatus;
  createdPaths: string[];
  detectedPaths: string[];
}

export async function installProject(
  options: InstallProjectOptions
): Promise<InstallProjectResult> {
  const paths = createProjectPaths(options.projectRoot);
  const createdPaths: string[] = [];
  const projectStatePath = path.join(paths.state, "project-state.json");
  const existingInstallation = await detectExistingInstallation({
    agentsFile: paths.agentsFile,
    mugiewRoot: paths.mugiewRoot,
    projectRoot: paths.projectRoot,
    projectStatePath
  });

  if (existingInstallation !== undefined) {
    return existingInstallation;
  }

  for (const directoryPath of [
    paths.mugiewRoot,
    paths.discovery,
    paths.prd,
    paths.tasks,
    paths.journal,
    paths.state,
    paths.rules
  ]) {
    await fs.mkdir(directoryPath, { recursive: true });
    createdPaths.push(directoryPath);
  }

  await safeWriteFile(paths.agentsFile, createAgentsTemplate(), {
    overwrite: false
  });
  createdPaths.push(paths.agentsFile);

  const projectState = createInitialProjectState({
    packageVersion: options.packageVersion,
    updatedAt: options.now ?? new Date()
  });

  await safeWriteFile(
    projectStatePath,
    `${JSON.stringify(projectState, null, 2)}\n`,
    {
      overwrite: false
    }
  );
  createdPaths.push(projectStatePath);

  return {
    projectRoot: paths.projectRoot,
    status: "installed",
    createdPaths,
    detectedPaths: []
  };
}

interface DetectExistingInstallationOptions {
  agentsFile: string;
  mugiewRoot: string;
  projectRoot: string;
  projectStatePath: string;
}

async function detectExistingInstallation(
  options: DetectExistingInstallationOptions
): Promise<InstallProjectResult | undefined> {
  const detectedPaths: string[] = [];

  if (await pathExists(options.mugiewRoot)) {
    detectedPaths.push(options.mugiewRoot);
  }

  if (await pathExists(options.agentsFile)) {
    detectedPaths.push(options.agentsFile);
  }

  if (await pathExists(options.projectStatePath)) {
    detectedPaths.push(options.projectStatePath);
    await validateProjectStateSchemaVersion(options.projectStatePath);
  }

  if (detectedPaths.length === 0) {
    return undefined;
  }

  return {
    projectRoot: options.projectRoot,
    status:
      detectedPaths.includes(options.mugiewRoot) &&
      detectedPaths.includes(options.agentsFile) &&
      detectedPaths.includes(options.projectStatePath)
        ? "already-installed"
        : "partial-installation",
    createdPaths: [],
    detectedPaths
  };
}

async function validateProjectStateSchemaVersion(filePath: string): Promise<void> {
  const projectState = JSON.parse(await fs.readFile(filePath, "utf8")) as {
    schemaVersion?: unknown;
  };

  if (
    projectState.schemaVersion !== CURRENT_PROJECT_STATE_SCHEMA_VERSION
  ) {
    throw new SchemaVersionError({
      filePath,
      foundVersion: projectState.schemaVersion,
      supportedVersion: CURRENT_PROJECT_STATE_SCHEMA_VERSION
    });
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if (isNotFoundError(error)) {
      return false;
    }

    throw error;
  }
}

function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function createAgentsTemplate(): string {
  return [
    "# AGENTS.md",
    "",
    "Mugiew Method AI Constitution.",
    "",
    "## Core Rule",
    "",
    "No implementation before clarity.",
    "",
    "## Project Governance",
    "",
    "- Read `_mugiew-method/prd/` before implementation.",
    "- Read `_mugiew-method/tasks/` before execution.",
    "- Respect `_mugiew-method/rules/` for coding, architecture, UI, and testing.",
    "- Do not overwrite user-owned work without explicit approval.",
    ""
  ].join("\n");
}
