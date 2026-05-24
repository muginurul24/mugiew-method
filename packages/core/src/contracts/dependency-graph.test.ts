import { describe, expect, it } from "vitest";

import { ValidationError } from "../errors/validation-error.js";
import {
  detectDependencyCycles,
  parseDependencyGraph
} from "./dependency-graph.js";

describe("dependency graph contract", () => {
  it("parses a valid dependency graph", () => {
    expect(parseDependencyGraph(createDependencyGraph())).toMatchObject({
      schemaVersion: 1,
      tasks: [
        {
          id: "TASK-001",
          status: "completed"
        },
        {
          id: "TASK-002",
          status: "pending"
        }
      ]
    });
  });

  it("throws ValidationError for invalid graph payloads", () => {
    expect(() =>
      parseDependencyGraph({
        ...createDependencyGraph(),
        tasks: [
          {
            id: "TASK-001"
          }
        ]
      })
    ).toThrow(ValidationError);
  });

  it("requires completed tasks to keep PRD and journal trace fields", () => {
    const graph = parseDependencyGraph(createDependencyGraph());
    const completedTask = graph.tasks[0];

    expect(completedTask?.sourcePrdIds).toEqual(["FR-021"]);
    expect(completedTask?.journalEntries).toEqual(["journal/001-done.md"]);
  });

  it("rejects completed tasks without journal entries", () => {
    const graph = createDependencyGraph();

    expect(() =>
      parseDependencyGraph({
        ...graph,
        tasks: [
          {
            ...graph.tasks[0],
            journalEntries: []
          }
        ]
      })
    ).toThrow(ValidationError);
  });

  it("rejects duplicate task IDs", () => {
    const graph = createDependencyGraph();

    expect(() =>
      parseDependencyGraph({
        ...graph,
        tasks: [graph.tasks[0], graph.tasks[0]]
      })
    ).toThrow(ValidationError);
  });

  it("detects direct dependency cycles", () => {
    const graph = parseDependencyGraph({
      schemaVersion: 1,
      updatedAt: "2026-05-24T00:00:00.000Z",
      tasks: [
        createNode({
          id: "TASK-001",
          dependencies: [{ id: "TASK-001", status: "pending" }]
        })
      ]
    });

    expect(detectDependencyCycles(graph)).toEqual([
      {
        taskIds: ["TASK-001"]
      }
    ]);
  });

  it("detects indirect dependency cycles", () => {
    const graph = parseDependencyGraph({
      schemaVersion: 1,
      updatedAt: "2026-05-24T00:00:00.000Z",
      tasks: [
        createNode({
          id: "TASK-001",
          dependencies: [{ id: "TASK-002", status: "pending" }]
        }),
        createNode({
          id: "TASK-002",
          dependencies: [{ id: "TASK-003", status: "pending" }]
        }),
        createNode({
          id: "TASK-003",
          dependencies: [{ id: "TASK-001", status: "pending" }]
        })
      ]
    });

    expect(detectDependencyCycles(graph)).toEqual([
      {
        taskIds: ["TASK-001", "TASK-002", "TASK-003"]
      }
    ]);
  });
});

function createDependencyGraph() {
  return {
    schemaVersion: 1,
    updatedAt: "2026-05-24T00:00:00.000Z",
    tasks: [
      {
        id: "TASK-001",
        title: "Implement first task",
        status: "completed",
        sourcePrdIds: ["FR-021"],
        dependencies: [],
        journalEntries: ["journal/001-done.md"]
      },
      {
        id: "TASK-002",
        title: "Implement second task",
        status: "pending",
        sourcePrdIds: ["FR-021"],
        dependencies: [
          {
            id: "TASK-001",
            status: "completed"
          }
        ],
        journalEntries: []
      }
    ]
  };
}

function createNode(options: {
  id: string;
  dependencies: Array<{ id: string; status: "completed" | "pending" | "missing" }>;
}) {
  return {
    id: options.id,
    title: `Implement ${options.id}`,
    status: "blocked",
    sourcePrdIds: ["FR-021"],
    dependencies: options.dependencies,
    journalEntries: []
  };
}
