import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { evaluateYoloRunGate, yoloRunProject } from "./yolo-runtime.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("YOLO-RUN gate", () => {
  it("denies missing approval", () => {
    expect(
      evaluateYoloRunGate({
        approvalIntegrity: { status: "missing" },
        confidenceScore: 97,
        blockingAmbiguityCount: 0
      })
    ).toEqual({
      allowed: false,
      status: "YOLO-RUN DENIED",
      failedConditions: ["prdStatus != approved"]
    });
  });

  it("denies unresolved blocking ambiguities", () => {
    expect(
      evaluateYoloRunGate({
        approvalIntegrity: { status: "valid" },
        confidenceScore: 97,
        blockingAmbiguityCount: 2
      })
    ).toEqual({
      allowed: false,
      status: "YOLO-RUN DENIED",
      failedConditions: ["blockingAmbiguityCount > 0 (2)"]
    });
  });

  it("denies insufficient confidence", () => {
    expect(
      evaluateYoloRunGate({
        approvalIntegrity: { status: "valid" },
        confidenceScore: 89,
        blockingAmbiguityCount: 0
      })
    ).toEqual({
      allowed: false,
      status: "YOLO-RUN DENIED",
      failedConditions: ["confidenceScore < 90 (89)"]
    });
  });

  it("writes denial Journal entry", async () => {
    const projectRoot = await createProjectRoot({
      approval: false,
      confidenceScore: 89,
      blockingAmbiguityCount: 1
    });

    const result = await yoloRunProject({
      projectRoot,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      allowed: false,
      status: "YOLO-RUN DENIED",
      failedConditions: [
        "prdStatus != approved",
        "blockingAmbiguityCount > 0 (1)",
        "confidenceScore < 90 (89)"
      ]
    });

    if (!result.allowed) {
      await expect(fs.readFile(result.journalPath, "utf8")).resolves.toContain(
        "YOLO-RUN Denied"
      );
    }
  });

  it("denies malformed approval records", async () => {
    const projectRoot = await createProjectRoot({
      approval: "malformed",
      confidenceScore: 97,
      blockingAmbiguityCount: 0
    });

    const result = await yoloRunProject({
      projectRoot,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      allowed: false,
      status: "YOLO-RUN DENIED",
      failedConditions: ["approvalRecord invalid"]
    });
  });

  it("denies stale approval records", async () => {
    const projectRoot = await createProjectRoot({
      approval: "stale",
      confidenceScore: 97,
      blockingAmbiguityCount: 0
    });

    const result = await yoloRunProject({
      projectRoot,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      allowed: false,
      status: "YOLO-RUN DENIED",
      failedConditions: [
        "approvalRecord stale: PRD, confidence-report, ambiguity-report"
      ]
    });
  });

  it("denies malformed ambiguity report and writes Journal", async () => {
    const projectRoot = await createProjectRoot({
      approval: "fresh",
      confidenceScore: 97,
      blockingAmbiguityCount: 0
    });
    await fs.writeFile(
      path.join(projectRoot, "_mugiew-method", "state", "ambiguity-report.json"),
      "{",
      "utf8"
    );

    const result = await yoloRunProject({
      projectRoot,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result).toMatchObject({
      allowed: false,
      status: "YOLO-RUN DENIED",
      failedConditions: [
        "approvalRecord stale: ambiguity-report",
        "ambiguityReport invalid"
      ]
    });

    if (!result.allowed) {
      await expect(fs.readFile(result.journalPath, "utf8")).resolves.toContain(
        "ambiguityReport invalid"
      );
    }
  });

  it("allows fresh approval records when other gates pass", async () => {
    const projectRoot = await createProjectRoot({
      approval: "fresh",
      confidenceScore: 97,
      blockingAmbiguityCount: 0
    });

    await expect(
      yoloRunProject({
        projectRoot,
        now: new Date("2026-05-24T00:00:00.000Z")
      })
    ).resolves.toEqual({
      allowed: true,
      status: "YOLO-RUN READY"
    });
  });
});

interface CreateProjectRootOptions {
  approval: false | "malformed" | "stale" | "fresh";
  confidenceScore: number;
  blockingAmbiguityCount: number;
}

async function createProjectRoot(
  options: CreateProjectRootOptions
): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-yolo-")
  );
  tempRoots.push(projectRoot);
  const prdDirectory = path.join(projectRoot, "_mugiew-method", "prd");
  const discoveryDirectory = path.join(projectRoot, "_mugiew-method", "discovery");
  const stateDirectory = path.join(projectRoot, "_mugiew-method", "state");
  const journalDirectory = path.join(projectRoot, "_mugiew-method", "journal");

  await fs.mkdir(prdDirectory, { recursive: true });
  await fs.mkdir(discoveryDirectory, { recursive: true });
  await fs.mkdir(stateDirectory, { recursive: true });
  await fs.mkdir(journalDirectory, { recursive: true });
  await fs.writeFile(path.join(prdDirectory, "PRD.md"), "# PRD\n", "utf8");
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
    path.join(discoveryDirectory, "confidence-report.md"),
    [
      "# Confidence Report",
      "",
      `Project Understanding Confidence: ${options.confidenceScore}%`,
      `Remaining Blocking Ambiguities: ${options.blockingAmbiguityCount}`,
      "Execution Readiness: DISCOVERY_IN_PROGRESS",
      ""
    ].join("\n"),
    "utf8"
  );
  await fs.writeFile(
    path.join(stateDirectory, "ambiguity-report.json"),
    `${JSON.stringify(createAmbiguityReport(options.blockingAmbiguityCount))}\n`,
    "utf8"
  );

  if (options.approval === "malformed") {
    await fs.writeFile(
      path.join(stateDirectory, "prd-approval.json"),
      "{",
      "utf8"
    );
  }

  if (options.approval === "stale") {
    await fs.writeFile(
      path.join(stateDirectory, "prd-approval.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        approvedAt: "2026-05-24T00:00:00.000Z",
        approvedArtifactVersions: {
          PRD: "mtime:0:size:0",
          "confidence-report": "mtime:0:size:0",
          "ambiguity-report": "mtime:0:size:0"
        }
      })}\n`,
      "utf8"
    );
  }

  if (options.approval === "fresh") {
    await fs.writeFile(
      path.join(stateDirectory, "prd-approval.json"),
      `${JSON.stringify({
        schemaVersion: 1,
        approvedAt: "2026-05-24T00:00:00.000Z",
        approvedArtifactVersions: {
          PRD: await calculateVersion(path.join(prdDirectory, "PRD.md")),
          "confidence-report": await calculateVersion(
            path.join(discoveryDirectory, "confidence-report.md")
          ),
          "ambiguity-report": await calculateVersion(
            path.join(stateDirectory, "ambiguity-report.json")
          )
        }
      })}\n`,
      "utf8"
    );
  }

  return projectRoot;
}

async function calculateVersion(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  const hash = createHash("sha256").update(content).digest("hex");

  return `sha256:${hash}`;
}

function createAmbiguityReport(blockingAmbiguityCount: number) {
  return {
    schemaVersion: 1,
    updatedAt: "2026-05-24T00:00:00.000Z",
    ambiguities: Array.from(
      { length: blockingAmbiguityCount },
      (_, index) => ({
        id: `AMB-${index + 1}`,
        category: "blocking-ambiguity",
        source: "test",
        impact: "Blocks execution.",
        owner: "user",
        status: "open",
        resolution: "",
        blockingReason: "Decision required."
      })
    )
  };
}
