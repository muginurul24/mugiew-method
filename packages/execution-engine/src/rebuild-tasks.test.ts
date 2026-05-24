import { describe, expect, it } from "vitest";

import { createDependencyGraph } from "./dependency-graph.js";
import { rebuildTasksSafely } from "./rebuild-tasks.js";
import { generateTasksFromConcerns } from "./task-generator.js";

describe("rebuildTasksSafely", () => {
  it("detects manual task edits", () => {
    const existingTasks = createTasks();
    const regeneratedTasks = [
      {
        ...existingTasks[0]!,
        title: "Regenerated task title"
      },
      existingTasks[1]!
    ];
    const result = rebuildTasksSafely({
      existingTasks,
      regeneratedTasks,
      existingGraph: createExistingGraph(existingTasks),
      regenerationReason: "Specs changed.",
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.manualEdits).toEqual([
      {
        taskId: "TASK-001",
        type: "changed"
      }
    ]);
  });

  it("surfaces conflicts for changed completed Tasks", () => {
    const existingTasks = createTasks();
    const regeneratedTasks = [
      {
        ...existingTasks[0]!,
        title: "Changed completed task"
      },
      existingTasks[1]!
    ];
    const result = rebuildTasksSafely({
      existingTasks,
      regeneratedTasks,
      existingGraph: createExistingGraph(existingTasks),
      regenerationReason: "Specs changed.",
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.conflicts).toEqual([
      {
        taskId: "TASK-001",
        type: "completed-task-changed",
        message: "Completed task differs from regenerated task."
      }
    ]);
  });

  it("preserves completed history and journal trace", () => {
    const existingTasks = createTasks();
    const regeneratedTasks = [
      {
        ...existingTasks[0]!,
        title: "Changed completed task"
      },
      existingTasks[1]!
    ];
    const result = rebuildTasksSafely({
      existingTasks,
      regeneratedTasks,
      existingGraph: createExistingGraph(existingTasks),
      regenerationReason: "Specs changed.",
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.tasks[0]?.title).toBe(existingTasks[0]?.title);
    expect(result.completedTaskIds).toEqual(["TASK-001"]);
    expect(result.dependencyGraph.tasks[0]).toMatchObject({
      id: "TASK-001",
      status: "completed",
      journalEntries: ["journal/001-done.md"]
    });
  });

  it("records regeneration reason", () => {
    const existingTasks = createTasks();
    const result = rebuildTasksSafely({
      existingTasks,
      regeneratedTasks: existingTasks,
      existingGraph: createExistingGraph(existingTasks),
      regenerationReason: "User requested task rebuild after PRD update.",
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.regeneration).toEqual({
      reason: "User requested task rebuild after PRD update.",
      updatedAt: "2026-05-24T00:00:00.000Z"
    });
  });

  it("preserves completed Tasks removed by regeneration", () => {
    const existingTasks = createTasks();
    const result = rebuildTasksSafely({
      existingTasks,
      regeneratedTasks: [existingTasks[1]!],
      existingGraph: createExistingGraph(existingTasks),
      regenerationReason: "Specs changed.",
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.conflicts).toEqual([
      {
        taskId: "TASK-001",
        type: "completed-task-removed",
        message: "Completed task is missing from regenerated tasks."
      }
    ]);
    expect(result.tasks.map((task) => task.id)).toEqual(["TASK-002", "TASK-001"]);
  });
});

function createExistingGraph(tasks: ReturnType<typeof createTasks>) {
  return createDependencyGraph({
    tasks,
    completedTaskIds: ["TASK-001"],
    journalEntries: {
      "TASK-001": ["journal/001-done.md"]
    },
    updatedAt: new Date("2026-05-24T00:00:00.000Z")
  });
}

function createTasks() {
  return generateTasksFromConcerns({
    concerns: [
      createConcern("first-task"),
      {
        ...createConcern("second-task"),
        dependencies: ["TASK-001"]
      }
    ]
  });
}

function createConcern(concern: string) {
  return {
    title: `Implement ${concern}`,
    concern,
    sourcePrdIds: ["FR-008", "FR-020", "FR-021"],
    acceptanceCriteria: [`${concern} works.`],
    validationCommands: ["pnpm test"],
    expectedFilesOrAreas: [`packages/example/src/${concern}.ts`],
    rollbackNotes: `Remove ${concern} implementation.`
  };
}
