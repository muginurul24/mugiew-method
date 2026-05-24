import { z, ZodError } from "zod";

import { ValidationError } from "../errors/validation-error.js";

export const CURRENT_DEPENDENCY_GRAPH_SCHEMA_VERSION = 1;

export const taskGraphStatusSchema = z.enum(["pending", "blocked", "completed"]);
export const dependencyStatusSchema = z.enum(["completed", "pending", "missing"]);

export const dependencyGraphNodeSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    status: taskGraphStatusSchema,
    sourcePrdIds: z.array(z.string().min(1)).min(1),
    dependencies: z.array(
      z
        .object({
          id: z.string().min(1),
          status: dependencyStatusSchema
        })
        .strict()
    ),
    journalEntries: z.array(z.string().min(1))
  })
  .strict();

export const dependencyGraphSchema = z
  .object({
    schemaVersion: z.literal(CURRENT_DEPENDENCY_GRAPH_SCHEMA_VERSION),
    updatedAt: z.string().datetime(),
    tasks: z.array(dependencyGraphNodeSchema)
  })
  .superRefine((graph, context) => {
    const seenTaskIds = new Set<string>();

    graph.tasks.forEach((task, index) => {
      if (seenTaskIds.has(task.id)) {
        context.addIssue({
          code: "custom",
          path: ["tasks", index, "id"],
          message: "Task IDs in dependency graph must be unique."
        });
      }

      seenTaskIds.add(task.id);

      if (task.status === "completed" && task.journalEntries.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["tasks", index, "journalEntries"],
          message: "Completed tasks must include at least one journal entry."
        });
      }
    });
  })
  .strict();

export type TaskGraphStatus = z.infer<typeof taskGraphStatusSchema>;
export type DependencyStatus = z.infer<typeof dependencyStatusSchema>;
export type DependencyGraphNode = z.infer<typeof dependencyGraphNodeSchema>;
export type DependencyGraph = z.infer<typeof dependencyGraphSchema>;

export interface DependencyCycleFinding {
  taskIds: string[];
}

export function parseDependencyGraph(data: unknown): DependencyGraph {
  try {
    return dependencyGraphSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError({
        message: "Invalid dependency graph.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    throw error;
  }
}

export function detectDependencyCycles(
  graph: DependencyGraph
): DependencyCycleFinding[] {
  const taskIds = new Set(graph.tasks.map((task) => task.id));
  const dependenciesByTaskId = new Map(
    graph.tasks.map((task) => [
      task.id,
      task.dependencies
        .map((dependency) => dependency.id)
        .filter((dependencyId) => taskIds.has(dependencyId))
        .sort()
    ])
  );
  const cycles = new Map<string, DependencyCycleFinding>();

  for (const task of [...graph.tasks].sort((left, right) =>
    left.id.localeCompare(right.id)
  )) {
    visitTask({
      taskId: task.id,
      dependenciesByTaskId,
      stack: [],
      cycles
    });
  }

  return [...cycles.values()].sort((left, right) =>
    left.taskIds.join("->").localeCompare(right.taskIds.join("->"))
  );
}

interface VisitTaskOptions {
  taskId: string;
  dependenciesByTaskId: Map<string, string[]>;
  stack: string[];
  cycles: Map<string, DependencyCycleFinding>;
}

function visitTask(options: VisitTaskOptions): void {
  const existingIndex = options.stack.indexOf(options.taskId);

  if (existingIndex >= 0) {
    const cycleTaskIds = options.stack.slice(existingIndex);
    const normalizedCycle = normalizeCycle(cycleTaskIds);

    options.cycles.set(normalizedCycle.join("->"), {
      taskIds: normalizedCycle
    });
    return;
  }

  const dependencies = options.dependenciesByTaskId.get(options.taskId) ?? [];

  for (const dependencyId of dependencies) {
    visitTask({
      taskId: dependencyId,
      dependenciesByTaskId: options.dependenciesByTaskId,
      stack: [...options.stack, options.taskId],
      cycles: options.cycles
    });
  }
}

function normalizeCycle(taskIds: string[]): string[] {
  const firstSortedTaskId = [...taskIds].sort()[0];
  const startIndex = taskIds.indexOf(firstSortedTaskId ?? taskIds[0] ?? "");

  return [...taskIds.slice(startIndex), ...taskIds.slice(0, startIndex)];
}
