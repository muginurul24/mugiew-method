import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createDependencyGraph } from "./dependency-graph.js";
import {
  selectRuntimeTask,
  selectRuntimeTaskFromProject
} from "./task-selection.js";
import { generateTasksFromConcerns } from "./task-generator.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("runtime task selection", () => {
  it("selects only pending unblocked tasks", () => {
    const graph = createGraph();

    expect(selectRuntimeTask(graph)).toMatchObject({
      selected: true,
      task: {
        id: "TASK-002"
      }
    });
  });

  it("records chosen Task ID and rationale", () => {
    const graph = createGraph();
    const selection = selectRuntimeTask(graph);

    expect(selection).toMatchObject({
      selected: true,
      rationale:
        "Selected TASK-002 because status is pending and all dependencies are completed."
    });
  });

  it("does not select blocked tasks", () => {
    const graph = createDependencyGraph({
      tasks: createTasks(),
      completedTaskIds: ["TASK-001"],
      journalEntries: {
        "TASK-001": ["journal/001-done.md"]
      },
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(graph.tasks[2]?.status).toBe("blocked");
    expect(selectRuntimeTask(graph)).toMatchObject({
      selected: true,
      task: {
        id: "TASK-002"
      }
    });
  });

  it("stops runtime selection when dependency graph has cycles", () => {
    const graph = createDependencyGraph({
      tasks: createCyclicTasks(),
      updatedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(selectRuntimeTask(graph)).toEqual({
      selected: false,
      rationale:
        "Dependency graph contains cycles: TASK-001 -> TASK-002 -> TASK-001"
    });
  });

  it("writes project-level selection Journal", async () => {
    const projectRoot = await createProjectRoot();
    const result = await selectRuntimeTaskFromProject({
      projectRoot,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.selection).toMatchObject({
      selected: true,
      task: {
        id: "TASK-002"
      }
    });
    await expect(fs.readFile(result.journalPath, "utf8")).resolves.toContain(
      "Task ID: TASK-002"
    );
  });
});

function createGraph() {
  return createDependencyGraph({
    tasks: createTasks(),
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
      createConcern("completed-task"),
      {
        ...createConcern("ready-task"),
        dependencies: ["TASK-001"]
      },
      {
        ...createConcern("blocked-task"),
        dependencies: ["TASK-002"]
      }
    ]
  });
}

function createConcern(concern: string) {
  return {
    title: `Implement ${concern}`,
    concern,
    sourcePrdIds: ["FR-022"],
    acceptanceCriteria: [`${concern} works.`],
    validationCommands: ["pnpm test"],
    expectedFilesOrAreas: [`packages/example/src/${concern}.ts`],
    rollbackNotes: `Remove ${concern} implementation.`
  };
}

function createCyclicTasks() {
  const [first, second] = generateTasksFromConcerns({
    concerns: [
      {
        ...createConcern("cycle-a"),
        dependencies: ["TASK-002"]
      },
      {
        ...createConcern("cycle-b"),
        dependencies: ["TASK-001"]
      }
    ]
  });

  return [first, second].filter((task) => task !== undefined);
}

async function createProjectRoot(): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-select-")
  );
  tempRoots.push(projectRoot);
  const stateDirectory = path.join(projectRoot, "_mugiew-method", "state");
  const journalDirectory = path.join(projectRoot, "_mugiew-method", "journal");

  await fs.mkdir(stateDirectory, { recursive: true });
  await fs.mkdir(journalDirectory, { recursive: true });
  await fs.writeFile(
    path.join(stateDirectory, "project-state.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      updatedAt: "2026-05-24T00:00:00.000Z",
      installStatus: "installed",
      packageVersion: "0.0.0-test"
    })}\n`,
    "utf8"
  );
  await fs.writeFile(
    path.join(stateDirectory, "dependency-graph.json"),
    `${JSON.stringify(createGraph())}\n`,
    "utf8"
  );

  return projectRoot;
}
