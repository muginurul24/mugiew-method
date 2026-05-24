import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  detectArchitectureDrift,
  writeArchitectureDriftState,
  writeApprovedDriftJournal
} from "./architecture-drift-detector.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("architecture drift detector", () => {
  it("reports expected rule, observed change, severity, and remediation", () => {
    const result = detectArchitectureDrift({
      rules: [createRule()],
      outputs: [
        {
          path: "src/example.ts",
          content: "import execa from 'execa';"
        }
      ]
    });

    expect(result.findings).toEqual([
      {
        id: "DRIFT-001-001",
        ruleId: "AD-001",
        outputPath: "src/example.ts",
        expectedRule: "Runtime commands use approved execution wrapper.",
        observedChange: "Found forbidden pattern: import execa",
        severity: "high",
        remediation: "Route command execution through validation runner.",
        status: "unresolved"
      }
    ]);
    expect(result.hasUnresolvedDrift).toBe(true);
  });

  it("writes approved drift to Journal", async () => {
    const projectRoot = await createProjectRoot();
    const approvedDrift = [
      {
        findingId: "DRIFT-001-001",
        approvedBy: "Mugiew",
        reason: "Temporary migration bridge."
      }
    ];
    const driftResult = detectArchitectureDrift({
      rules: [createRule()],
      outputs: [
        {
          path: "src/example.ts",
          content: "import execa from 'execa';"
        }
      ],
      approvedDrift
    });

    const result = await writeApprovedDriftJournal({
      projectRoot,
      driftResult,
      approvedDrift,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result?.filePath).toContain("_mugiew-method/journal");
    await expect(fs.readFile(result!.filePath, "utf8")).resolves.toContain(
      "Temporary migration bridge."
    );
  });

  it("writes architecture drift state", async () => {
    const projectRoot = await createProjectRoot();
    await fs.mkdir(path.join(projectRoot, "_mugiew-method", "state"), {
      recursive: true
    });
    const driftResult = detectArchitectureDrift({
      rules: [createRule()],
      outputs: [
        {
          path: "src/example.ts",
          content: "import execa from 'execa';"
        }
      ]
    });

    const result = await writeArchitectureDriftState({
      projectRoot,
      driftResult
    });

    expect(result.filePath).toContain("_mugiew-method/state/architecture-drift.json");
    await expect(fs.readFile(result.filePath, "utf8")).resolves.toContain(
      "DRIFT-001-001"
    );
  });
});

function createRule() {
  return {
    id: "AD-001",
    expectedRule: "Runtime commands use approved execution wrapper.",
    forbiddenPattern: "import execa",
    severity: "high" as const,
    remediation: "Route command execution through validation runner."
  };
}

async function createProjectRoot(): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-drift-")
  );
  tempRoots.push(projectRoot);
  await fs.mkdir(path.join(projectRoot, "_mugiew-method", "journal"), {
    recursive: true
  });

  return projectRoot;
}
