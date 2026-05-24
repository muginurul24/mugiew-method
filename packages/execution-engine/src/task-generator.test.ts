import { describe, expect, it } from "vitest";

import { ValidationError } from "@mugiew-method/core";

import { generateTasksFromConcerns } from "./task-generator.js";

describe("generateTasksFromConcerns", () => {
  it("generates one Task per implementation concern", () => {
    const tasks = generateTasksFromConcerns({
      concerns: [createConcern("auth-api"), createConcern("auth-ui")]
    });

    expect(tasks.map((task) => task.concern)).toEqual(["auth-api", "auth-ui"]);
  });

  it("requires each generated Task to reference at least one PRD ID", () => {
    expect(() =>
      generateTasksFromConcerns({
        concerns: [
          {
            ...createConcern("auth-api"),
            sourcePrdIds: []
          }
        ]
      })
    ).toThrow(ValidationError);
  });

  it("includes acceptance criteria and validation expectations", () => {
    const [task] = generateTasksFromConcerns({
      concerns: [createConcern("auth-api")]
    });

    expect(task?.acceptanceCriteria).toEqual(["Auth API validates requests."]);
    expect(task?.validationCommands).toEqual(["pnpm test"]);
  });

  it("generates stable zero-padded Task IDs", () => {
    const tasks = generateTasksFromConcerns({
      idPrefix: "TASK",
      concerns: [createConcern("one"), createConcern("two")]
    });

    expect(tasks.map((task) => task.id)).toEqual(["TASK-001", "TASK-002"]);
  });
});

function createConcern(concern: string) {
  return {
    title: `Implement ${concern}`,
    concern,
    sourcePrdIds: ["FR-001"],
    acceptanceCriteria: ["Auth API validates requests."],
    validationCommands: ["pnpm test"],
    expectedFilesOrAreas: [`packages/example/src/${concern}.ts`],
    rollbackNotes: `Remove ${concern} implementation.`
  };
}
