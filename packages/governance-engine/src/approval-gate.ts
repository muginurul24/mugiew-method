import fs from "node:fs/promises";
import path from "node:path";

import {
  type ApprovalArtifactVersions,
  type ApprovalRecord,
  calculateFileArtifactVersion,
  createProjectPaths,
  parseAmbiguityReport,
  parseApprovalRecord,
  safeWriteFile
} from "@mugiew-method/core";

export const APPROVAL_CONFIDENCE_THRESHOLD = 90;

export interface ApprovalGateInput {
  confidenceScore: number;
  blockingAmbiguityCount: number;
  approvedArtifactVersions: ApprovalArtifactVersions;
  approvedAt: Date;
}

export interface ApprovalGateDenied {
  approved: false;
  failedConditions: string[];
}

export interface ApprovalGateApproved {
  approved: true;
  record: ApprovalRecord;
}

export type ApprovalGateDecision = ApprovalGateDenied | ApprovalGateApproved;

export interface WriteApprovalRecordOptions {
  projectRoot: string;
  record: ApprovalRecord;
}

export interface ApprovePrdProjectOptions {
  projectRoot: string;
  approvedAt?: Date;
}

export interface ApprovePrdProjectDenied {
  approved: false;
  failedConditions: string[];
}

export interface ApprovePrdProjectApproved {
  approved: true;
  filePath: string;
  record: ApprovalRecord;
}

export type ApprovePrdProjectResult =
  | ApprovePrdProjectDenied
  | ApprovePrdProjectApproved;

export function evaluateApprovalGate(
  input: ApprovalGateInput
): ApprovalGateDecision {
  const failedConditions: string[] = [];

  if (input.blockingAmbiguityCount > 0) {
    failedConditions.push(
      `blockingAmbiguityCount > 0 (${input.blockingAmbiguityCount})`
    );
  }

  if (input.confidenceScore < APPROVAL_CONFIDENCE_THRESHOLD) {
    failedConditions.push(
      `confidenceScore < ${APPROVAL_CONFIDENCE_THRESHOLD} (${input.confidenceScore})`
    );
  }

  if (failedConditions.length > 0) {
    return {
      approved: false,
      failedConditions
    };
  }

  return {
    approved: true,
    record: {
      schemaVersion: 1,
      approvedAt: input.approvedAt.toISOString(),
      approvedArtifactVersions: input.approvedArtifactVersions
    }
  };
}

export async function writeApprovalRecord(
  options: WriteApprovalRecordOptions
): Promise<string> {
  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(paths.state, "prd-approval.json");

  await safeWriteFile(
    filePath,
    `${JSON.stringify(parseApprovalRecord(options.record), null, 2)}\n`,
    { overwrite: true }
  );

  return filePath;
}

export async function approvePrdProject(
  options: ApprovePrdProjectOptions
): Promise<ApprovePrdProjectResult> {
  const paths = createProjectPaths(options.projectRoot);
  const prdPath = path.join(paths.prd, "PRD.md");
  const confidenceReportPath = path.join(
    paths.discovery,
    "confidence-report.md"
  );
  const ambiguityReportPath = path.join(paths.state, "ambiguity-report.json");

  await fs.access(prdPath);
  await fs.access(confidenceReportPath);

  const confidenceScore = parseConfidenceScore(
    await fs.readFile(confidenceReportPath, "utf8")
  );
  const ambiguityReport = parseAmbiguityReport(
    JSON.parse(await fs.readFile(ambiguityReportPath, "utf8"))
  );
  const blockingAmbiguityCount = ambiguityReport.ambiguities.filter(
    (ambiguity) =>
      ambiguity.category === "blocking-ambiguity" &&
      ambiguity.status !== "resolved"
  ).length;
  const decision = evaluateApprovalGate({
    confidenceScore,
    blockingAmbiguityCount,
    approvedArtifactVersions: await calculateApprovalArtifactVersions({
      prdPath,
      confidenceReportPath,
      ambiguityReportPath
    }),
    approvedAt: options.approvedAt ?? new Date()
  });

  if (!decision.approved) {
    return decision;
  }

  const filePath = await writeApprovalRecord({
    projectRoot: paths.projectRoot,
    record: decision.record
  });

  return {
    approved: true,
    filePath,
    record: decision.record
  };
}

export async function assertApprovalInputsExist(
  projectRoot: string
): Promise<void> {
  const paths = createProjectPaths(projectRoot);
  await fs.access(path.join(paths.prd, "PRD.md"));
  await fs.access(path.join(paths.discovery, "confidence-report.md"));
}

function parseConfidenceScore(content: string): number {
  const match = content.match(/Project Understanding Confidence:\s*(\d+)%/);

  if (match?.[1] === undefined) {
    return 0;
  }

  return Number.parseInt(match[1], 10);
}

interface CalculateApprovalArtifactVersionsOptions {
  prdPath: string;
  confidenceReportPath: string;
  ambiguityReportPath: string;
}

export async function calculateApprovalArtifactVersions(
  options: CalculateApprovalArtifactVersionsOptions
): Promise<ApprovalArtifactVersions> {
  return {
    PRD: await calculateFileArtifactVersion(options.prdPath),
    "confidence-report": await calculateFileArtifactVersion(
      options.confidenceReportPath
    ),
    "ambiguity-report": await calculateFileArtifactVersion(
      options.ambiguityReportPath
    )
  };
}

export type { ApprovalRecord } from "@mugiew-method/core";
