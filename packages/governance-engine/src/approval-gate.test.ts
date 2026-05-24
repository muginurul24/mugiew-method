import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  approvePrdProject,
  evaluateApprovalGate,
  writeApprovalRecord
} from "./approval-gate.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("approval gate", () => {
  it("denies approval when blocking ambiguities remain", () => {
    const decision = evaluateApprovalGate({
      confidenceScore: 100,
      blockingAmbiguityCount: 1,
      approvedArtifactVersions: createArtifactVersions(),
      approvedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(decision).toEqual({
      approved: false,
      failedConditions: ["blockingAmbiguityCount > 0 (1)"]
    });
  });

  it("denies approval when confidence threshold is unmet", () => {
    const decision = evaluateApprovalGate({
      confidenceScore: 89,
      blockingAmbiguityCount: 0,
      approvedArtifactVersions: createArtifactVersions(),
      approvedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(decision).toEqual({
      approved: false,
      failedConditions: ["confidenceScore < 90 (89)"]
    });
  });

  it("records approval timestamp and artifact versions on success", () => {
    const decision = evaluateApprovalGate({
      confidenceScore: 95,
      blockingAmbiguityCount: 0,
      approvedArtifactVersions: {
        PRD: "mtime:1:size:1",
        "confidence-report": "mtime:2:size:2",
        "ambiguity-report": "mtime:3:size:3"
      },
      approvedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(decision).toEqual({
      approved: true,
      record: {
        schemaVersion: 1,
        approvedAt: "2026-05-24T00:00:00.000Z",
        approvedArtifactVersions: {
          PRD: "mtime:1:size:1",
          "confidence-report": "mtime:2:size:2",
          "ambiguity-report": "mtime:3:size:3"
        }
      }
    });
  });

  it("writes approval record under state directory", async () => {
    const projectRoot = await createTempRoot();
    const filePath = await writeApprovalRecord({
      projectRoot,
      record: {
        schemaVersion: 1,
        approvedAt: "2026-05-24T00:00:00.000Z",
        approvedArtifactVersions: {
          PRD: "mtime:1:size:1",
          "confidence-report": "mtime:2:size:2",
          "ambiguity-report": "mtime:3:size:3"
        }
      }
    });

    expect(filePath).toBe(
      path.join(projectRoot, "_mugiew-method", "state", "prd-approval.json")
    );
    await expect(fs.readFile(filePath, "utf8")).resolves.toContain(
      "\"approvedAt\""
    );
  });

  it("refreshes an existing approval record on re-approval", async () => {
    const projectRoot = await createTempRoot();
    await writeApprovalRecord({
      projectRoot,
      record: {
        schemaVersion: 1,
        approvedAt: "2026-05-24T00:00:00.000Z",
        approvedArtifactVersions: createArtifactVersions()
      }
    });

    await writeApprovalRecord({
      projectRoot,
      record: {
        schemaVersion: 1,
        approvedAt: "2026-05-25T00:00:00.000Z",
        approvedArtifactVersions: {
          PRD: "sha256:new-prd",
          "confidence-report": "sha256:new-confidence",
          "ambiguity-report": "sha256:new-ambiguity"
        }
      }
    });

    await expect(
      fs.readFile(
        path.join(projectRoot, "_mugiew-method", "state", "prd-approval.json"),
        "utf8"
      )
    ).resolves.toContain("2026-05-25T00:00:00.000Z");
  });

  it("approves project from PRD, confidence report, and ambiguity state", async () => {
    const projectRoot = await createTempRoot();
    await writeApprovalInputs(projectRoot, {
      confidenceScore: 95,
      ambiguities: []
    });

    const result = await approvePrdProject({
      projectRoot,
      approvedAt: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      approved: true,
      filePath: path.join(
        projectRoot,
        "_mugiew-method",
        "state",
        "prd-approval.json"
      )
    });
  });

  it("denies project approval with exact failed condition from state", async () => {
    const projectRoot = await createTempRoot();
    await writeApprovalInputs(projectRoot, {
      confidenceScore: 95,
      ambiguities: [
        {
          id: "AMB-001",
          category: "blocking-ambiguity",
          source: "Discovery",
          impact: "Auth is unresolved.",
          owner: "user",
          status: "open",
          resolution: "",
          blockingReason: "Auth blocks implementation."
        }
      ]
    });

    await expect(
      approvePrdProject({
        projectRoot,
        approvedAt: new Date("2026-05-24T00:00:00.000Z")
      })
    ).resolves.toEqual({
      approved: false,
      failedConditions: ["blockingAmbiguityCount > 0 (1)"]
    });
  });
});

async function createTempRoot(): Promise<string> {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-approval-")
  );
  tempRoots.push(tempRoot);

  return tempRoot;
}

function createArtifactVersions() {
  return {
    PRD: "mtime:1:size:1",
    "confidence-report": "mtime:2:size:2",
    "ambiguity-report": "mtime:3:size:3"
  };
}

async function writeApprovalInputs(
  projectRoot: string,
  options: {
    confidenceScore: number;
    ambiguities: unknown[];
  }
): Promise<void> {
  await fs.mkdir(path.join(projectRoot, "_mugiew-method", "prd"), {
    recursive: true
  });
  await fs.mkdir(path.join(projectRoot, "_mugiew-method", "discovery"), {
    recursive: true
  });
  await fs.mkdir(path.join(projectRoot, "_mugiew-method", "state"), {
    recursive: true
  });
  await fs.writeFile(
    path.join(projectRoot, "_mugiew-method", "prd", "PRD.md"),
    "# PRD\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(
      projectRoot,
      "_mugiew-method",
      "discovery",
      "confidence-report.md"
    ),
    `Project Understanding Confidence: ${options.confidenceScore}%\n`,
    "utf8"
  );
  await fs.writeFile(
    path.join(projectRoot, "_mugiew-method", "state", "ambiguity-report.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        updatedAt: "2026-05-24T00:00:00.000Z",
        ambiguities: options.ambiguities
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}
