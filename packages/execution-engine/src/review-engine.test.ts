import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runSelfReview } from "./review-engine.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("runSelfReview", () => {
  it("writes review report before done can be recorded", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runSelfReview({
      projectRoot,
      taskId: "TASK-001",
      validationResult: createPassedValidation(),
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.journalPath).toContain("_mugiew-method/journal");
    await expect(fs.readFile(result.journalPath, "utf8")).resolves.toContain(
      "# Self Review"
    );
  });

  it("prevents completion when critical findings exist", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runSelfReview({
      projectRoot,
      taskId: "TASK-001",
      validationResult: {
        passed: false,
        taskId: "TASK-001",
        failedCommand: "pnpm test",
        results: [],
        journalPath: "journal/validation-failed.md"
      },
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.canCompleteTask).toBe(false);
    expect(result.findings[0]).toMatchObject({
      severity: "critical",
      disposition: "blocks-completion"
    });
  });

  it("tracks medium and low findings with disposition", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runSelfReview({
      projectRoot,
      taskId: "TASK-001",
      validationResult: createPassedValidation(),
      checks: [
        {
          category: "maintainability",
          severity: "medium",
          message: "Helper could be split later.",
          evidence: "src/example.ts"
        },
        {
          category: "ai-readability",
          severity: "low",
          message: "Comment would improve future agent context.",
          evidence: "src/example.ts"
        }
      ],
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.canCompleteTask).toBe(true);
    expect(result.findings.map((finding) => finding.disposition)).toEqual([
      "tracked",
      "tracked"
    ]);
  });
});

async function createProjectRoot(): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-self-review-")
  );
  tempRoots.push(projectRoot);
  await fs.mkdir(path.join(projectRoot, "_mugiew-method", "journal"), {
    recursive: true
  });

  return projectRoot;
}

function createPassedValidation() {
  return {
    passed: true as const,
    taskId: "TASK-001",
    results: [
      {
        command: "pnpm test",
        exitCode: 0,
        stdout: "passed",
        stderr: ""
      }
    ]
  };
}
