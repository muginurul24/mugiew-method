import { type DependencyGraph, type TaskFile } from "@mugiew-method/core";

import { createDependencyGraph } from "./dependency-graph.js";

export type ManualTaskEditType = "changed" | "removed";
export type RebuildTaskConflictType =
  | "completed-task-changed"
  | "completed-task-removed";

export interface ManualTaskEdit {
  taskId: string;
  type: ManualTaskEditType;
}

export interface RebuildTaskConflict {
  taskId: string;
  type: RebuildTaskConflictType;
  message: string;
}

export interface RebuildTasksSafelyOptions {
  existingTasks: TaskFile[];
  regeneratedTasks: TaskFile[];
  existingGraph: DependencyGraph;
  regenerationReason: string;
  updatedAt: Date;
}

export interface RebuildTasksSafelyResult {
  tasks: TaskFile[];
  dependencyGraph: DependencyGraph;
  manualEdits: ManualTaskEdit[];
  completedTaskIds: string[];
  conflicts: RebuildTaskConflict[];
  regeneration: {
    reason: string;
    updatedAt: string;
  };
}

export function rebuildTasksSafely(
  options: RebuildTasksSafelyOptions
): RebuildTasksSafelyResult {
  const existingTasksById = toTaskMap(options.existingTasks);
  const regeneratedTasksById = toTaskMap(options.regeneratedTasks);
  const completedTaskIds = getCompletedTaskIds(options.existingGraph);
  const manualEdits = detectManualEdits({
    existingTasks: options.existingTasks,
    regeneratedTasksById
  });
  const conflicts = detectCompletedTaskConflicts({
    completedTaskIds,
    existingTasksById,
    regeneratedTasksById
  });
  const tasks = preserveCompletedTasks({
    regeneratedTasks: options.regeneratedTasks,
    existingTasksById,
    completedTaskIds
  });
  const journalEntries = getJournalEntries(options.existingGraph);

  return {
    tasks,
    dependencyGraph: createDependencyGraph({
      tasks,
      completedTaskIds,
      journalEntries,
      updatedAt: options.updatedAt
    }),
    manualEdits,
    completedTaskIds,
    conflicts,
    regeneration: {
      reason: options.regenerationReason,
      updatedAt: options.updatedAt.toISOString()
    }
  };
}

interface DetectManualEditsOptions {
  existingTasks: TaskFile[];
  regeneratedTasksById: Map<string, TaskFile>;
}

function detectManualEdits(options: DetectManualEditsOptions): ManualTaskEdit[] {
  const edits: ManualTaskEdit[] = [];

  for (const existingTask of options.existingTasks) {
    const regeneratedTask = options.regeneratedTasksById.get(existingTask.id);

    if (!regeneratedTask) {
      edits.push({
        taskId: existingTask.id,
        type: "removed"
      });
      continue;
    }

    if (stableTaskStringify(existingTask) !== stableTaskStringify(regeneratedTask)) {
      edits.push({
        taskId: existingTask.id,
        type: "changed"
      });
    }
  }

  return edits;
}

interface DetectCompletedTaskConflictsOptions {
  completedTaskIds: string[];
  existingTasksById: Map<string, TaskFile>;
  regeneratedTasksById: Map<string, TaskFile>;
}

function detectCompletedTaskConflicts(
  options: DetectCompletedTaskConflictsOptions
): RebuildTaskConflict[] {
  const conflicts: RebuildTaskConflict[] = [];

  for (const taskId of options.completedTaskIds) {
    const existingTask = options.existingTasksById.get(taskId);
    const regeneratedTask = options.regeneratedTasksById.get(taskId);

    if (!regeneratedTask) {
      conflicts.push({
        taskId,
        type: "completed-task-removed",
        message: "Completed task is missing from regenerated tasks."
      });
      continue;
    }

    if (
      existingTask &&
      stableTaskStringify(existingTask) !== stableTaskStringify(regeneratedTask)
    ) {
      conflicts.push({
        taskId,
        type: "completed-task-changed",
        message: "Completed task differs from regenerated task."
      });
    }
  }

  return conflicts;
}

interface PreserveCompletedTasksOptions {
  regeneratedTasks: TaskFile[];
  existingTasksById: Map<string, TaskFile>;
  completedTaskIds: string[];
}

function preserveCompletedTasks(options: PreserveCompletedTasksOptions): TaskFile[] {
  const completedTaskIds = new Set(options.completedTaskIds);
  const seenTaskIds = new Set<string>();
  const tasks = options.regeneratedTasks.map((regeneratedTask) => {
    seenTaskIds.add(regeneratedTask.id);

    if (!completedTaskIds.has(regeneratedTask.id)) {
      return regeneratedTask;
    }

    return options.existingTasksById.get(regeneratedTask.id) ?? regeneratedTask;
  });

  for (const taskId of completedTaskIds) {
    const existingTask = options.existingTasksById.get(taskId);

    if (existingTask && !seenTaskIds.has(taskId)) {
      tasks.push(existingTask);
    }
  }

  return tasks;
}

function getCompletedTaskIds(graph: DependencyGraph): string[] {
  return graph.tasks
    .filter((task) => task.status === "completed")
    .map((task) => task.id);
}

function getJournalEntries(graph: DependencyGraph): Record<string, string[]> {
  return Object.fromEntries(
    graph.tasks
      .filter((task) => task.journalEntries.length > 0)
      .map((task) => [task.id, task.journalEntries])
  );
}

function toTaskMap(tasks: TaskFile[]): Map<string, TaskFile> {
  return new Map(tasks.map((task) => [task.id, task]));
}

function stableTaskStringify(task: TaskFile): string {
  return JSON.stringify({
    acceptanceCriteria: task.acceptanceCriteria,
    concern: task.concern,
    dependencies: task.dependencies,
    expectedFilesOrAreas: task.expectedFilesOrAreas,
    id: task.id,
    rollbackNotes: task.rollbackNotes,
    sourcePrdIds: task.sourcePrdIds,
    title: task.title,
    validationCommands: task.validationCommands
  });
}
