import { describe, expect, it } from "vitest";

import { ValidationError } from "../errors/validation-error.js";
import { parseTaskFile } from "./task-file.js";

describe("task file contract", () => {
  it("parses a valid task file", () => {
    expect(parseTaskFile(createTask())).toMatchObject({
      id: "TASK-001",
      concern: "auth-api"
    });
  });

  it("throws ValidationError for missing required fields", () => {
    const invalidTask = createTask() as Record<string, unknown>;
    delete invalidTask.rollbackNotes;

    expect(() => parseTaskFile(invalidTask)).toThrow(ValidationError);
  });

  it("rejects broad multi-concern task fields", () => {
    expect(() =>
      parseTaskFile({
        ...createTask(),
        additionalConcerns: ["auth-ui", "database"]
      })
    ).toThrow(ValidationError);
  });
});

function createTask() {
  return {
    id: "TASK-001",
    title: "Implement auth API contract",
    concern: "auth-api",
    sourcePrdIds: ["FR-001", "AC-001"],
    dependencies: [],
    acceptanceCriteria: ["Auth API accepts valid credentials."],
    validationCommands: ["pnpm test"],
    expectedFilesOrAreas: ["packages/example/src/auth-api.ts"],
    rollbackNotes: "Remove auth API files and related exports."
  };
}
