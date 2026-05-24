import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { reviewProject } from "./review-project.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("reviewProject", () => {
  it("reports architecture drift, rule violations, task claims, and validation gaps", async () => {
    const projectRoot = await createProjectRoot();

    const result = await reviewProject({
      projectRoot,
      taskOutputs: [
        {
          path: "src/example.ts",
          content: "silent overwrite"
        }
      ],
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.findings.map((finding) => finding.category)).toEqual([
      "architecture-drift",
      "rule-violation",
      "task-claim",
      "validation-gap"
    ]);
  });

  it("writes review report to Journal", async () => {
    const projectRoot = await createProjectRoot();

    const result = await reviewProject({
      projectRoot,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.journalPath).toContain("_mugiew-method/journal");
    await expect(fs.readFile(result.journalPath, "utf8")).resolves.toContain(
      "# Project Review"
    );
  });

  it("does not modify source files", async () => {
    const projectRoot = await createProjectRoot();
    const sourcePath = path.join(projectRoot, "src", "example.ts");
    await fs.mkdir(path.dirname(sourcePath), { recursive: true });
    await fs.writeFile(sourcePath, "original source\n", "utf8");

    await reviewProject({
      projectRoot,
      taskOutputs: [
        {
          path: "src/example.ts",
          content: "silent overwrite"
        }
      ],
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    await expect(fs.readFile(sourcePath, "utf8")).resolves.toBe(
      "original source\n"
    );
  });

  it("scans explicit file paths for AGENTS.md violations", async () => {
    const projectRoot = await createProjectRoot({ cleanState: true });
    const sourcePath = path.join(projectRoot, "src", "example.ts");
    await fs.mkdir(path.dirname(sourcePath), { recursive: true });
    await fs.writeFile(sourcePath, "silent overwrite\n", "utf8");

    const result = await reviewProject({
      projectRoot,
      scanPaths: ["src/example.ts"],
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.scannedFileCount).toBe(1);
    expect(result.skippedFileCount).toBe(0);
    expect(result.scanStatus).toBe("scanned-with-findings");
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        category: "rule-violation"
      })
    );
  });

  it("distinguishes no scanned files from clean scan", async () => {
    const projectRoot = await createProjectRoot({ cleanState: true });

    const result = await reviewProject({
      projectRoot,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.scannedFileCount).toBe(0);
    expect(result.scanStatus).toBe("not-scanned");
  });

  it("counts skipped paths and writes scan counts to Journal", async () => {
    const projectRoot = await createProjectRoot({ cleanState: true });

    const result = await reviewProject({
      projectRoot,
      scanPaths: ["missing.ts"],
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.skippedFileCount).toBe(1);
    await expect(fs.readFile(result.journalPath, "utf8")).resolves.toContain(
      "Skipped Files: 1"
    );
  });

  it("skips paths outside project root", async () => {
    const projectRoot = await createProjectRoot({ cleanState: true });

    const result = await reviewProject({
      projectRoot,
      scanPaths: ["../outside.ts"],
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.scannedFileCount).toBe(0);
    expect(result.skippedFileCount).toBe(1);
  });

  it("does not skip in-project dot-prefixed paths", async () => {
    const projectRoot = await createProjectRoot({ cleanState: true });
    const sourcePath = path.join(projectRoot, "..foo.ts");
    await fs.writeFile(sourcePath, "silent overwrite\n", "utf8");

    const result = await reviewProject({
      projectRoot,
      scanPaths: ["..foo.ts"],
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.scannedFileCount).toBe(1);
  });

  it("skips symlinks that resolve outside project root", async () => {
    const projectRoot = await createProjectRoot({ cleanState: true });
    const outsideRoot = await fs.mkdtemp(path.join(os.tmpdir(), "outside-"));
    tempRoots.push(outsideRoot);
    const outsidePath = path.join(outsideRoot, "secret.ts");
    const linkPath = path.join(projectRoot, "linked.ts");
    await fs.writeFile(outsidePath, "silent overwrite\n", "utf8");
    await fs.symlink(outsidePath, linkPath);

    const result = await reviewProject({
      projectRoot,
      scanPaths: ["linked.ts"],
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.scannedFileCount).toBe(0);
    expect(result.skippedFileCount).toBe(1);
  });

  it("skips binary files", async () => {
    const projectRoot = await createProjectRoot({ cleanState: true });
    const binaryPath = path.join(projectRoot, "binary.bin");
    await fs.writeFile(binaryPath, Buffer.from([0, 1, 2]));

    const result = await reviewProject({
      projectRoot,
      scanPaths: ["binary.bin"],
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.scannedFileCount).toBe(0);
    expect(result.skippedFileCount).toBe(1);
  });
});

async function createProjectRoot(
  options: { cleanState?: boolean } = {}
): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-review-")
  );
  tempRoots.push(projectRoot);
  const stateDirectory = path.join(projectRoot, "_mugiew-method", "state");
  const journalDirectory = path.join(projectRoot, "_mugiew-method", "journal");
  await fs.mkdir(stateDirectory, { recursive: true });
  await fs.mkdir(journalDirectory, { recursive: true });
  await fs.writeFile(
    path.join(projectRoot, "AGENTS.md"),
    ["# AGENTS.md", "", "## Forbidden Patterns", "", "- silent overwrite", ""].join(
      "\n"
    ),
    "utf8"
  );
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
  if (!options.cleanState) {
    await fs.writeFile(
      path.join(stateDirectory, "architecture-drift.json"),
      `${JSON.stringify({
        findings: [
          {
            id: "DRIFT-001-001",
            status: "unresolved",
            severity: "high",
            observedChange: "Found forbidden pattern: import execa"
          }
        ]
      })}\n`,
      "utf8"
    );
    await fs.writeFile(
      path.join(stateDirectory, "dependency-graph.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        updatedAt: "2026-05-24T00:00:00.000Z",
        tasks: [
          {
            id: "TASK-001",
            title: "Completed task",
            status: "completed",
            sourcePrdIds: ["FR-007"],
            dependencies: [],
            journalEntries: []
          }
        ]
      })}\n`,
      "utf8"
    );
    await fs.writeFile(
      path.join(stateDirectory, "execution-metrics.json"),
      `${JSON.stringify({ latestValidationStatus: "failed" })}\n`,
      "utf8"
    );
  } else {
    await fs.writeFile(
      path.join(stateDirectory, "execution-metrics.json"),
      `${JSON.stringify({ latestValidationStatus: "passed" })}\n`,
      "utf8"
    );
  }

  return projectRoot;
}
