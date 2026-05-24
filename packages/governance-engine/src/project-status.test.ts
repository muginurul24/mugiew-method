import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { getProjectStatus, renderProjectStatusText } from "./project-status.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("project status", () => {
  it("reports required status fields", async () => {
    const projectRoot = await createInstalledProject();
    await writeStatusArtifacts(projectRoot);

    const status = await getProjectStatus({ projectRoot });

    expect(status).toMatchObject({
      confidenceScore: 97,
      ambiguityCount: 0,
      prdStatus: "approved",
      architectureHealth: "unknown",
      latestValidationStatus: "passed"
    });
    expect(renderProjectStatusText(status)).toContain("Confidence: 97%");
  });

  it("derives task progress and blockers from dependency graph", async () => {
    const projectRoot = await createInstalledProject();
    await writeStatusArtifacts(projectRoot, {
      blockedTask: true
    });

    const status = await getProjectStatus({ projectRoot });

    expect(status.taskProgress).toEqual({
      total: 2,
      pending: 0,
      blocked: 1,
      completed: 1
    });
    expect(status.activeBlockers).toContain("1 blocked tasks");
  });

  it("reports Markdown and JSON ambiguity mismatch as drift", async () => {
    const projectRoot = await createInstalledProject();
    await writeStatusArtifacts(projectRoot, {
      confidenceBlockingCount: 0,
      jsonBlockingCount: 1
    });

    const status = await getProjectStatus({ projectRoot });

    expect(status.drift).toEqual([
      {
        type: "ambiguity-count-mismatch",
        markdownBlockingCount: 0,
        jsonBlockingCount: 1,
        message:
          "Confidence report blocking ambiguity count does not match ambiguity-report.json."
      }
    ]);
  });

  it("reports drifted architecture health from drift state", async () => {
    const projectRoot = await createInstalledProject();
    await writeStatusArtifacts(projectRoot, {
      architectureDrift: true
    });

    const status = await getProjectStatus({ projectRoot });

    expect(status.architectureHealth).toBe("drifted");
  });

  it("reports runtime stop state", async () => {
    const projectRoot = await createInstalledProject({
      runtime: {
        status: "blocked",
        reason: "No unblocked task available.",
        nextSuggestedAction: "Resolve blockers.",
        updatedAt: "2026-05-24T00:00:00.000Z"
      }
    });
    await writeStatusArtifacts(projectRoot);

    const status = await getProjectStatus({ projectRoot });

    expect(status.runtime).toEqual({
      status: "blocked",
      reason: "No unblocked task available.",
      nextSuggestedAction: "Resolve blockers.",
      updatedAt: "2026-05-24T00:00:00.000Z"
    });
    expect(renderProjectStatusText(status)).toContain(
      "Runtime: blocked - No unblocked task available."
    );
  });

  it("reports draft approval when approval record is missing", async () => {
    const projectRoot = await createInstalledProject();
    await writeStatusArtifacts(projectRoot, {
      approvalStatus: "draft"
    });

    const status = await getProjectStatus({ projectRoot });

    expect(status.prdStatus).toBe("draft");
    expect(status.activeBlockers).toContain("PRD approval missing");
  });

  it("reports malformed approval distinctly", async () => {
    const projectRoot = await createInstalledProject();
    await writeStatusArtifacts(projectRoot, {
      approvalStatus: "malformed"
    });

    const status = await getProjectStatus({ projectRoot });

    expect(status.prdStatus).toBe("malformed");
    expect(status.activeBlockers).toContain("malformed PRD approval");
  });

  it("reports stale approval distinctly", async () => {
    const projectRoot = await createInstalledProject();
    await writeStatusArtifacts(projectRoot, {
      approvalStatus: "stale"
    });

    const status = await getProjectStatus({ projectRoot });

    expect(status.prdStatus).toBe("stale");
    expect(status.activeBlockers).toContain("stale PRD approval");
  });

  it("reports malformed ambiguity state without crashing", async () => {
    const projectRoot = await createInstalledProject();
    await writeStatusArtifacts(projectRoot);
    await fs.writeFile(
      path.join(projectRoot, "_mugiew-method", "state", "ambiguity-report.json"),
      "{",
      "utf8"
    );

    const status = await getProjectStatus({ projectRoot });

    expect(status.activeBlockers).toContain("ambiguity-report.json invalid");
    expect(status.drift).toContainEqual({
      type: "state-file-invalid",
      file: "ambiguity-report.json",
      message: "ambiguity-report.json is invalid."
    });
  });

  it("reports dependency graph cycle blockers", async () => {
    const projectRoot = await createInstalledProject();
    await writeStatusArtifacts(projectRoot, {
      cyclicGraph: true
    });

    const status = await getProjectStatus({ projectRoot });

    expect(status.activeBlockers).toContain(
      "dependency graph cycles: TASK-001 -> TASK-002 -> TASK-001"
    );
  });
});

interface CreateInstalledProjectOptions {
  runtime?: {
    status: "blocked" | "failed" | "paused" | "complete";
    reason: string;
    nextSuggestedAction: string;
    updatedAt: string;
  };
}

async function createInstalledProject(
  options: CreateInstalledProjectOptions = {}
): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-status-")
  );
  tempRoots.push(projectRoot);

  await fs.mkdir(path.join(projectRoot, "_mugiew-method", "discovery"), {
    recursive: true
  });
  await fs.mkdir(path.join(projectRoot, "_mugiew-method", "state"), {
    recursive: true
  });
  await fs.writeFile(
    path.join(projectRoot, "_mugiew-method", "state", "project-state.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      updatedAt: "2026-05-24T00:00:00.000Z",
      installStatus: "installed",
      packageVersion: "0.0.0-test",
      ...(options.runtime ? { runtime: options.runtime } : {})
    })}\n`,
    "utf8"
  );

  return projectRoot;
}

interface WriteStatusArtifactsOptions {
  blockedTask?: boolean;
  confidenceBlockingCount?: number;
  jsonBlockingCount?: number;
  architectureDrift?: boolean;
  approvalStatus?: "approved" | "draft" | "malformed" | "stale";
  cyclicGraph?: boolean;
}

async function writeStatusArtifacts(
  projectRoot: string,
  options: WriteStatusArtifactsOptions = {}
): Promise<void> {
  const stateDirectory = path.join(projectRoot, "_mugiew-method", "state");
  const discoveryDirectory = path.join(projectRoot, "_mugiew-method", "discovery");
  const prdDirectory = path.join(projectRoot, "_mugiew-method", "prd");
  const graph = options.cyclicGraph
    ? createCyclicDependencyGraphFixture()
    : createDependencyGraphFixture(options.blockedTask ?? false);

  await fs.mkdir(prdDirectory, { recursive: true });
  await fs.writeFile(path.join(prdDirectory, "PRD.md"), "# PRD\n", "utf8");
  await fs.writeFile(
    path.join(discoveryDirectory, "confidence-report.md"),
    [
      "# Confidence Report",
      "",
      "Project Understanding Confidence: 97%",
      `Remaining Blocking Ambiguities: ${options.confidenceBlockingCount ?? 0}`,
      "Execution Readiness: READY_FOR_APPROVAL",
      ""
    ].join("\n"),
    "utf8"
  );
  await fs.writeFile(
    path.join(stateDirectory, "ambiguity-report.json"),
    `${JSON.stringify(createAmbiguityReport(options.jsonBlockingCount ?? 0))}\n`,
    "utf8"
  );
  const approvalStatus = options.approvalStatus ?? "approved";

  if (approvalStatus !== "draft") {
    const approvalRecord =
      approvalStatus === "malformed"
        ? undefined
        : await createApprovalRecord({
            approvalStatus,
            prdPath: path.join(prdDirectory, "PRD.md"),
            confidenceReportPath: path.join(
              discoveryDirectory,
              "confidence-report.md"
            ),
            ambiguityReportPath: path.join(
              stateDirectory,
              "ambiguity-report.json"
            )
          });

    await fs.writeFile(
      path.join(stateDirectory, "prd-approval.json"),
      approvalStatus === "malformed"
        ? "{"
        : `${JSON.stringify(approvalRecord)}\n`,
      "utf8"
    );
  }
  await fs.writeFile(
    path.join(stateDirectory, "dependency-graph.json"),
    `${JSON.stringify(graph)}\n`,
    "utf8"
  );
  await fs.writeFile(
    path.join(stateDirectory, "execution-metrics.json"),
    `${JSON.stringify({ latestValidationStatus: "passed" })}\n`,
    "utf8"
  );

  if (options.architectureDrift) {
    await fs.writeFile(
      path.join(stateDirectory, "architecture-drift.json"),
      `${JSON.stringify({
        findings: [
          {
            id: "DRIFT-001-001",
            status: "unresolved"
          }
        ]
      })}\n`,
      "utf8"
    );
  }
}

interface CreateApprovalRecordOptions {
  approvalStatus: "approved" | "draft" | "malformed" | "stale";
  prdPath: string;
  confidenceReportPath: string;
  ambiguityReportPath: string;
}

async function createApprovalRecord(options: CreateApprovalRecordOptions) {
  if (options.approvalStatus === "stale") {
    return {
      schemaVersion: 1,
      approvedAt: "2026-05-24T00:00:00.000Z",
      approvedArtifactVersions: {
        PRD: "mtime:0:size:0",
        "confidence-report": "mtime:0:size:0",
        "ambiguity-report": "mtime:0:size:0"
      }
    };
  }

  return {
    schemaVersion: 1,
    approvedAt: "2026-05-24T00:00:00.000Z",
    approvedArtifactVersions: {
      PRD: await calculateVersion(options.prdPath),
      "confidence-report": await calculateVersion(options.confidenceReportPath),
      "ambiguity-report": await calculateVersion(options.ambiguityReportPath)
    }
  };
}

async function calculateVersion(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  const hash = createHash("sha256").update(content).digest("hex");

  return `sha256:${hash}`;
}

function createAmbiguityReport(blockingCount: number) {
  return {
    schemaVersion: 1,
    updatedAt: "2026-05-24T00:00:00.000Z",
    ambiguities: Array.from({ length: blockingCount }, (_, index) => ({
      id: `AMB-${index + 1}`,
      category: "blocking-ambiguity",
      source: "test",
      impact: "Blocks execution.",
      owner: "user",
      status: "open",
      resolution: "",
      blockingReason: "Decision required."
    }))
  };
}

function createDependencyGraphFixture(blockedTask: boolean) {
  return {
    schemaVersion: 1,
    updatedAt: "2026-05-24T00:00:00.000Z",
    tasks: [
      {
        id: "TASK-001",
        title: "Completed task",
        status: "completed",
        sourcePrdIds: ["FR-006"],
        dependencies: [],
        journalEntries: ["journal/001-done.md"]
      },
      {
        id: "TASK-002",
        title: "Next task",
        status: blockedTask ? "blocked" : "pending",
        sourcePrdIds: ["FR-006"],
        dependencies: [
          {
            id: blockedTask ? "TASK-999" : "TASK-001",
            status: blockedTask ? "missing" : "completed"
          }
        ],
        journalEntries: []
      }
    ]
  };
}

function createCyclicDependencyGraphFixture() {
  return {
    schemaVersion: 1,
    updatedAt: "2026-05-24T00:00:00.000Z",
    tasks: [
      {
        id: "TASK-001",
        title: "Cycle A",
        status: "blocked",
        sourcePrdIds: ["FR-006"],
        dependencies: [
          {
            id: "TASK-002",
            status: "pending"
          }
        ],
        journalEntries: []
      },
      {
        id: "TASK-002",
        title: "Cycle B",
        status: "blocked",
        sourcePrdIds: ["FR-006"],
        dependencies: [
          {
            id: "TASK-001",
            status: "pending"
          }
        ],
        journalEntries: []
      }
    ]
  };
}
