import fs from "node:fs/promises";
import path from "node:path";

import {
  MissingInstallationError,
  type DependencyGraph,
  type DependencyGraphNode,
  detectDependencyCycles,
  createProjectPaths,
  parseDependencyGraph,
  safeWriteFile
} from "@mugiew-method/core";

import { selectNextUnblockedTask } from "./dependency-graph.js";

export interface RuntimeTaskSelected {
  selected: true;
  task: DependencyGraphNode;
  rationale: string;
}

export interface RuntimeTaskNotSelected {
  selected: false;
  rationale: string;
}

export type RuntimeTaskSelection =
  | RuntimeTaskSelected
  | RuntimeTaskNotSelected;

export interface SelectRuntimeTaskFromProjectOptions {
  projectRoot: string;
  now?: Date;
}

export interface SelectRuntimeTaskFromProjectResult {
  selection: RuntimeTaskSelection;
  journalPath: string;
}

export function selectRuntimeTask(
  graph: DependencyGraph
): RuntimeTaskSelection {
  const cycles = detectDependencyCycles(graph);

  if (cycles.length > 0) {
    return {
      selected: false,
      rationale: `Dependency graph contains cycles: ${cycles.map(formatCycle).join("; ")}`
    };
  }

  const task = selectNextUnblockedTask(graph);

  if (!task) {
    return {
      selected: false,
      rationale: "No pending task has all dependencies satisfied."
    };
  }

  return {
    selected: true,
    task,
    rationale: `Selected ${task.id} because status is pending and all dependencies are completed.`
  };
}

function formatCycle(cycle: { taskIds: string[] }): string {
  return [...cycle.taskIds, cycle.taskIds[0]].join(" -> ");
}

export async function selectRuntimeTaskFromProject(
  options: SelectRuntimeTaskFromProjectOptions
): Promise<SelectRuntimeTaskFromProjectResult> {
  const paths = createProjectPaths(options.projectRoot);
  const now = options.now ?? new Date();
  const projectStatePath = path.join(paths.state, "project-state.json");
  const dependencyGraphPath = path.join(paths.state, "dependency-graph.json");

  await assertInstalled(paths.projectRoot, projectStatePath);

  const graph = parseDependencyGraph(
    JSON.parse(await fs.readFile(dependencyGraphPath, "utf8"))
  );
  const selection = selectRuntimeTask(graph);
  const journalPath = await writeTaskSelectionJournal({
    projectRoot: paths.projectRoot,
    selection,
    now
  });

  return {
    selection,
    journalPath
  };
}

interface WriteTaskSelectionJournalOptions {
  projectRoot: string;
  selection: RuntimeTaskSelection;
  now: Date;
}

async function writeTaskSelectionJournal(
  options: WriteTaskSelectionJournalOptions
): Promise<string> {
  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(
    paths.journal,
    `${formatJournalTimestamp(options.now)}-task-selection.md`
  );
  const content = [
    "# Runtime Task Selection",
    "",
    `Recorded At: ${options.now.toISOString()}`,
    `Selected: ${options.selection.selected ? "yes" : "no"}`,
    ...(options.selection.selected ? [`Task ID: ${options.selection.task.id}`] : []),
    `Rationale: ${options.selection.rationale}`,
    ""
  ].join("\n");

  await safeWriteFile(filePath, content, {
    overwrite: false
  });

  return filePath;
}

async function assertInstalled(
  projectRoot: string,
  projectStatePath: string
): Promise<void> {
  try {
    await fs.access(projectStatePath);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new MissingInstallationError({ projectRoot });
    }

    throw error;
  }
}

function formatJournalTimestamp(date: Date): string {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
