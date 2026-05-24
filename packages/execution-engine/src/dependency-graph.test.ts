import { describe, expect, it } from "vitest";

import { ValidationError } from "@mugiew-method/core";

import { createDependencyGraph, selectNextUnblockedTask } from "./dependency-graph.js";
import { generateTasksFromConcerns } from "./task-generator.js";

describe("dependency graph", () => {
  it("records each Task and dependency status", () => {
    const tasks = createTasks();
    const graph = createDependencyGraph({
      tasks,
      completedTaskIds: ["TASK-001"],
      journalEntries: {
        "TASK-001": ["journal/001-done.md"]
      },
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(graph.tasks).toHaveLength(3);
    expect(graph.tasks[1]?.dependencies).toEqual([
      {
        id: "TASK-001",
        status: "completed"
      }
    ]);
    expect(graph.tasks[2]?.dependencies).toEqual([
      {
        id: "TASK-002",
        status: "pending"
      }
    ]);
  });

  it("does not select blocked Tasks", () => {
    const graph = createDependencyGraph({
      tasks: createTasks(),
      completedTaskIds: ["TASK-001"],
      journalEntries: {
        "TASK-001": ["journal/001-done.md"]
      },
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(selectNextUnblockedTask(graph)?.id).toBe("TASK-002");
  });

  it("keeps completed Tasks traceable to PRD IDs and Journal entries", () => {
    const graph = createDependencyGraph({
      tasks: createTasks(),
      completedTaskIds: ["TASK-001"],
      journalEntries: {
        "TASK-001": ["journal/001-done.md"]
      },
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(graph.tasks[0]).toMatchObject({
      id: "TASK-001",
      status: "completed",
      sourcePrdIds: ["FR-021"],
      journalEntries: ["journal/001-done.md"]
    });
  });

  it("rejects completed Tasks without Journal trace", () => {
    expect(() =>
      createDependencyGraph({
        tasks: createTasks(),
        completedTaskIds: ["TASK-001"],
        updatedAt: new Date("2026-05-24T00:00:00.000Z")
      })
    ).toThrow(ValidationError);
  });

  it("marks dependencies outside the graph as missing and blocks the task", () => {
    const [task] = generateTasksFromConcerns({
      concerns: [
        {
          ...createConcern("orphan-task"),
          dependencies: ["TASK-999"]
        }
      ]
    });

    const graph = createDependencyGraph({
      tasks: task ? [task] : [],
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(graph.tasks[0]).toMatchObject({
      id: "TASK-001",
      status: "blocked",
      dependencies: [
        {
          id: "TASK-999",
          status: "missing"
        }
      ]
    });
    expect(selectNextUnblockedTask(graph)).toBeUndefined();
  });
});

function createTasks() {
  return generateTasksFromConcerns({
    concerns: [
      createConcern("project-state"),
      {
        ...createConcern("task-selector"),
        dependencies: ["TASK-001"]
      },
      {
        ...createConcern("runtime-entry"),
        dependencies: ["TASK-002"]
      }
    ]
  });
}

function createConcern(concern: string) {
  return {
    title: `Implement ${concern}`,
    concern,
    sourcePrdIds: ["FR-021"],
    acceptanceCriteria: [`${concern} works.`],
    validationCommands: ["pnpm test"],
    expectedFilesOrAreas: [`packages/example/src/${concern}.ts`],
    rollbackNotes: `Remove ${concern} implementation.`
  };
}
