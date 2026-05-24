import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runTaskValidation } from "./validation-runner.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("runTaskValidation", () => {
  it("captures command output and exit status", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runTaskValidation({
      projectRoot,
      task: createTask(["node -e \"console.log('ok')\""]),
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      passed: true,
      results: [
        {
          command: "node -e \"console.log('ok')\"",
          exitCode: 0,
          stdout: "ok",
          stderr: "",
          timedOut: false,
          stdoutTruncated: false,
          stderrTruncated: false,
          outputLimitExceeded: false
        }
      ]
    });
  });

  it("stops on first failed command", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runTaskValidation({
      projectRoot,
      task: createTask([
        "node -e \"process.exit(4)\"",
        "node -e \"console.log('should-not-run')\""
      ]),
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      passed: false,
      failedCommand: "node -e \"process.exit(4)\"",
      results: [
        {
          command: "node -e \"process.exit(4)\"",
          exitCode: 4,
          failureReason: "exit-code"
        }
      ]
    });
  });

  it("writes failure Journal entry", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runTaskValidation({
      projectRoot,
      task: createTask(["node -e \"console.error('bad'); process.exit(2)\""]),
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.passed).toBe(false);

    if (!result.passed) {
      await expect(fs.readFile(result.journalPath, "utf8")).resolves.toContain(
        "Validation Failed"
      );
    }
  });

  it("uses task-bound commands only", async () => {
    const projectRoot = await createProjectRoot();
    const markerPath = path.join(projectRoot, "marker.txt");
    await runTaskValidation({
      projectRoot,
      task: createTask([`node -e \"require('fs').writeFileSync('marker.txt', 'task')\"`]),
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    await expect(fs.readFile(markerPath, "utf8")).resolves.toBe("task");
  });

  it("fails and journals timed out commands", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runTaskValidation({
      projectRoot,
      task: createTask(["node -e \"setTimeout(() => {}, 1000)\""]),
      timeoutMs: 50,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      passed: false,
      failedCommand: "node -e \"setTimeout(() => {}, 1000)\"",
      results: [
        {
          timedOut: true,
          failureReason: "timeout"
        }
      ]
    });

    if (!result.passed) {
      await expect(fs.readFile(result.journalPath, "utf8")).resolves.toContain(
        "Failure Reason: timeout"
      );
    }
  });

  it("truncates captured stdout and stderr", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runTaskValidation({
      projectRoot,
      task: createTask([
        "node -e \"console.log('abcdef'); console.error('ghijkl'); process.exit(2)\""
      ]),
      outputLimitBytes: 3,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      passed: false,
      results: [
        {
          stdout: "abc",
          stderr: "ghi",
          stdoutTruncated: true,
          stderrTruncated: true
        }
      ]
    });

    if (!result.passed) {
      const journal = await fs.readFile(result.journalPath, "utf8");
      expect(journal).toContain("Stdout Truncated: yes");
      expect(journal).toContain("Stderr Truncated: yes");
    }
  });

  it("marks bounded output when Execa maxBuffer is reached", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runTaskValidation({
      projectRoot,
      task: createTask(["node -e \"console.log('abcdef')\""]),
      outputLimitBytes: 3,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      passed: true,
      results: [
        {
          stdout: "abc",
          stdoutTruncated: true
        }
      ]
    });
  });

  it("sanitizes task ID in journal filename", async () => {
    const projectRoot = await createProjectRoot();
    const result = await runTaskValidation({
      projectRoot,
      task: {
        ...createTask(["node -e \"process.exit(2)\""]),
        id: "../TASK/001"
      },
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.passed).toBe(false);

    if (!result.passed) {
      expect(path.dirname(result.journalPath)).toBe(
        path.join(projectRoot, "_mugiew-method", "journal")
      );
      expect(path.basename(result.journalPath)).toContain("TASK-001");
    }
  });
});

async function createProjectRoot(): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-validation-")
  );
  tempRoots.push(projectRoot);
  await fs.mkdir(path.join(projectRoot, "_mugiew-method", "journal"), {
    recursive: true
  });

  return projectRoot;
}

function createTask(validationCommands: string[]) {
  return {
    id: "TASK-001",
    title: "Validate task",
    concern: "validation",
    sourcePrdIds: ["FR-022", "FR-023"],
    dependencies: [],
    acceptanceCriteria: ["Validation runs."],
    validationCommands,
    expectedFilesOrAreas: ["packages/example/src/validation.ts"],
    rollbackNotes: "Remove validation changes."
  };
}
