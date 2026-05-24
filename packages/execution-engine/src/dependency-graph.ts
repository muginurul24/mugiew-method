import {
  CURRENT_DEPENDENCY_GRAPH_SCHEMA_VERSION,
  type DependencyGraph,
  type DependencyCycleFinding,
  type DependencyGraphNode,
  type DependencyStatus,
  type TaskFile,
  detectDependencyCycles,
  parseDependencyGraph
} from "@mugiew-method/core";

export interface CreateDependencyGraphOptions {
  tasks: TaskFile[];
  completedTaskIds?: string[];
  journalEntries?: Record<string, string[]>;
  updatedAt: Date;
}

export function createDependencyGraph(
  options: CreateDependencyGraphOptions
): DependencyGraph {
  const completedTaskIds = new Set(options.completedTaskIds ?? []);
  const taskIds = new Set(options.tasks.map((task) => task.id));

  return parseDependencyGraph({
    schemaVersion: CURRENT_DEPENDENCY_GRAPH_SCHEMA_VERSION,
    updatedAt: options.updatedAt.toISOString(),
    tasks: options.tasks.map((task) =>
      createDependencyGraphNode({
        task,
        taskIds,
        completedTaskIds,
        journalEntries: options.journalEntries ?? {}
      })
    )
  });
}

export function selectNextUnblockedTask(
  graph: DependencyGraph
): DependencyGraphNode | undefined {
  return graph.tasks.find((task) => task.status === "pending");
}

export function findDependencyCycles(
  graph: DependencyGraph
): DependencyCycleFinding[] {
  return detectDependencyCycles(graph);
}

interface CreateDependencyGraphNodeOptions {
  task: TaskFile;
  taskIds: Set<string>;
  completedTaskIds: Set<string>;
  journalEntries: Record<string, string[]>;
}

function createDependencyGraphNode(
  options: CreateDependencyGraphNodeOptions
): DependencyGraphNode {
  const dependencies = options.task.dependencies.map((dependencyId) => ({
    id: dependencyId,
    status: getDependencyStatus({
      dependencyId,
      taskIds: options.taskIds,
      completedTaskIds: options.completedTaskIds
    })
  }));

  const isCompleted = options.completedTaskIds.has(options.task.id);
  const isBlocked = dependencies.some(
    (dependency) => dependency.status !== "completed"
  );

  return {
    id: options.task.id,
    title: options.task.title,
    status: isCompleted ? "completed" : isBlocked ? "blocked" : "pending",
    sourcePrdIds: options.task.sourcePrdIds,
    dependencies,
    journalEntries: options.journalEntries[options.task.id] ?? []
  };
}

interface GetDependencyStatusOptions {
  dependencyId: string;
  taskIds: Set<string>;
  completedTaskIds: Set<string>;
}

function getDependencyStatus(
  options: GetDependencyStatusOptions
): DependencyStatus {
  if (!options.taskIds.has(options.dependencyId)) {
    return "missing";
  }

  if (options.completedTaskIds.has(options.dependencyId)) {
    return "completed";
  }

  return "pending";
}
