import fs from "node:fs/promises";
import path from "node:path";

import {
  type ApprovalArtifactKey,
  type ApprovalRecord,
  calculateFileArtifactVersion,
  MissingInstallationError,
  createProjectPaths,
  parseAmbiguityReport,
  parseApprovalRecord,
  safeWriteFile
} from "@mugiew-method/core";

export const YOLO_RUN_CONFIDENCE_THRESHOLD = 90;

export interface YoloRunGateInput {
  approvalIntegrity: ApprovalIntegrity;
  confidenceScore: number;
  blockingAmbiguityCount: number;
}

export type ApprovalIntegrity =
  | { status: "missing" }
  | { status: "valid" }
  | { status: "malformed" }
  | { status: "stale"; staleArtifacts: ApprovalArtifactKey[] };

export interface YoloRunGateDenied {
  allowed: false;
  status: "YOLO-RUN DENIED";
  failedConditions: string[];
}

export interface YoloRunGateAllowed {
  allowed: true;
  status: "YOLO-RUN READY";
}

export type YoloRunGateDecision = YoloRunGateDenied | YoloRunGateAllowed;

export interface YoloRunProjectOptions {
  projectRoot: string;
  now?: Date;
}

export interface YoloRunProjectDenied extends YoloRunGateDenied {
  journalPath: string;
}

export interface YoloRunProjectReady extends YoloRunGateAllowed {
  journalPath?: undefined;
}

export type YoloRunProjectResult = YoloRunProjectDenied | YoloRunProjectReady;

export function evaluateYoloRunGate(
  input: YoloRunGateInput
): YoloRunGateDecision {
  const failedConditions: string[] = [];

  if (input.approvalIntegrity.status === "missing") {
    failedConditions.push("prdStatus != approved");
  }

  if (input.approvalIntegrity.status === "malformed") {
    failedConditions.push("approvalRecord invalid");
  }

  if (input.approvalIntegrity.status === "stale") {
    failedConditions.push(
      `approvalRecord stale: ${input.approvalIntegrity.staleArtifacts.join(", ")}`
    );
  }

  if (input.blockingAmbiguityCount > 0) {
    failedConditions.push(
      `blockingAmbiguityCount > 0 (${input.blockingAmbiguityCount})`
    );
  }

  if (input.confidenceScore < YOLO_RUN_CONFIDENCE_THRESHOLD) {
    failedConditions.push(
      `confidenceScore < ${YOLO_RUN_CONFIDENCE_THRESHOLD} (${input.confidenceScore})`
    );
  }

  if (failedConditions.length > 0) {
    return {
      allowed: false,
      status: "YOLO-RUN DENIED",
      failedConditions
    };
  }

  return {
    allowed: true,
    status: "YOLO-RUN READY"
  };
}

export async function yoloRunProject(
  options: YoloRunProjectOptions
): Promise<YoloRunProjectResult> {
  const paths = createProjectPaths(options.projectRoot);
  const now = options.now ?? new Date();
  const projectStatePath = path.join(paths.state, "project-state.json");
  const approvalRecordPath = path.join(paths.state, "prd-approval.json");
  const confidenceReportPath = path.join(
    paths.discovery,
    "confidence-report.md"
  );
  const ambiguityReportPath = path.join(paths.state, "ambiguity-report.json");

  await assertInstalled(paths.projectRoot, projectStatePath);

  const confidenceReport = await readOptionalText(confidenceReportPath);
  const ambiguityState = await readAmbiguityState(ambiguityReportPath);
  const decision = evaluateYoloRunGate({
    approvalIntegrity: await readApprovalIntegrity({
      approvalRecordPath,
      prdPath: path.join(paths.prd, "PRD.md"),
      confidenceReportPath,
      ambiguityReportPath
    }),
    confidenceScore: confidenceReport
      ? parseConfidenceScore(confidenceReport)
      : 0,
    blockingAmbiguityCount: ambiguityState.blockingAmbiguityCount
  });
  const gateFailedConditions = decision.allowed ? [] : decision.failedConditions;
  const failedConditions = [
    ...gateFailedConditions,
    ...ambiguityState.failedConditions
  ];

  if (decision.allowed && failedConditions.length === 0) {
    return decision;
  }

  const journalPath = await writeYoloRunDeniedJournal({
    projectRoot: paths.projectRoot,
    failedConditions,
    now
  });

  return {
    allowed: false,
    status: "YOLO-RUN DENIED",
    failedConditions,
    journalPath
  };
}

interface WriteYoloRunDeniedJournalOptions {
  projectRoot: string;
  failedConditions: string[];
  now: Date;
}

async function writeYoloRunDeniedJournal(
  options: WriteYoloRunDeniedJournalOptions
): Promise<string> {
  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(
    paths.journal,
    `${formatJournalTimestamp(options.now)}-yolo-run-denied.md`
  );
  const content = [
    "# YOLO-RUN Denied",
    "",
    `Recorded At: ${options.now.toISOString()}`,
    "",
    "## Failed Conditions",
    "",
    ...options.failedConditions.map((condition) => `- ${condition}`),
    ""
  ].join("\n");

  await safeWriteFile(filePath, content, {
    overwrite: false
  });

  return filePath;
}

async function assertInstalled(
  projectRoot: string,
  projectStatePath: string
): Promise<void> {
  try {
    await fs.access(projectStatePath);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new MissingInstallationError({ projectRoot });
    }

    throw error;
  }
}

async function readOptionalText(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

interface AmbiguityState {
  blockingAmbiguityCount: number;
  failedConditions: string[];
}

async function readAmbiguityState(filePath: string): Promise<AmbiguityState> {
  const content = await readOptionalText(filePath);

  if (content === undefined) {
    return {
      blockingAmbiguityCount: 0,
      failedConditions: []
    };
  }

  try {
    const report = parseAmbiguityReport(JSON.parse(content));

    return {
      blockingAmbiguityCount: countBlockingAmbiguities(report.ambiguities),
      failedConditions: []
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        blockingAmbiguityCount: 0,
        failedConditions: ["ambiguityReport invalid"]
      };
    }

    throw error;
  }
}

interface ReadApprovalIntegrityOptions {
  approvalRecordPath: string;
  prdPath: string;
  confidenceReportPath: string;
  ambiguityReportPath: string;
}

async function readApprovalIntegrity(
  options: ReadApprovalIntegrityOptions
): Promise<ApprovalIntegrity> {
  const approvalRecordText = await readOptionalText(options.approvalRecordPath);

  if (approvalRecordText === undefined) {
    return { status: "missing" };
  }

  let approvalRecord: ApprovalRecord;

  try {
    approvalRecord = parseApprovalRecord(JSON.parse(approvalRecordText));
  } catch (error) {
    if (error instanceof Error) {
      return { status: "malformed" };
    }

    throw error;
  }

  const staleArtifacts = await findStaleApprovalArtifacts({
    approvalRecord,
    prdPath: options.prdPath,
    confidenceReportPath: options.confidenceReportPath,
    ambiguityReportPath: options.ambiguityReportPath
  });

  if (staleArtifacts.length > 0) {
    return {
      status: "stale",
      staleArtifacts
    };
  }

  return { status: "valid" };
}

interface FindStaleApprovalArtifactsOptions {
  approvalRecord: ApprovalRecord;
  prdPath: string;
  confidenceReportPath: string;
  ambiguityReportPath: string;
}

async function findStaleApprovalArtifacts(
  options: FindStaleApprovalArtifactsOptions
): Promise<ApprovalArtifactKey[]> {
  const artifactPaths: Record<ApprovalArtifactKey, string> = {
    PRD: options.prdPath,
    "confidence-report": options.confidenceReportPath,
    "ambiguity-report": options.ambiguityReportPath
  };
  const staleArtifacts: ApprovalArtifactKey[] = [];

  for (const artifactKey of Object.keys(artifactPaths) as ApprovalArtifactKey[]) {
    const currentVersion = await readArtifactVersion(artifactPaths[artifactKey]);

    if (
      currentVersion === undefined ||
      currentVersion !==
        options.approvalRecord.approvedArtifactVersions[artifactKey]
    ) {
      staleArtifacts.push(artifactKey);
    }
  }

  return staleArtifacts;
}

async function readArtifactVersion(filePath: string): Promise<string | undefined> {
  try {
    return await calculateFileArtifactVersion(filePath);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

function parseConfidenceScore(content: string): number {
  const match = content.match(/Project Understanding Confidence:\s*(\d+)%/);

  return match?.[1] === undefined ? 0 : Number.parseInt(match[1], 10);
}

function countBlockingAmbiguities(
  ambiguities: Array<{ category: string; status: string }>
): number {
  return ambiguities.filter(
    (ambiguity) =>
      ambiguity.category === "blocking-ambiguity" &&
      ambiguity.status !== "resolved"
  ).length;
}

function formatJournalTimestamp(date: Date): string {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
