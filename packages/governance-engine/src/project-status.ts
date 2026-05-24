import fs from "node:fs/promises";
import path from "node:path";

import {
  type ApprovalArtifactKey,
  type ApprovalRecord,
  type DependencyGraph,
  calculateFileArtifactVersion,
  detectDependencyCycles,
  MissingInstallationError,
  createProjectPaths,
  parseAmbiguityReport,
  parseApprovalRecord,
  parseDependencyGraph,
  ValidationError
} from "@mugiew-method/core";

export type PrdStatus = "approved" | "draft" | "stale" | "malformed";
export type ArchitectureHealth = "unknown" | "healthy" | "drifted";
export type LatestValidationStatus = "unknown" | string;

export interface TaskProgressStatus {
  total: number;
  pending: number;
  blocked: number;
  completed: number;
}

export interface RuntimeStopStatus {
  status: "blocked" | "failed" | "paused" | "complete";
  reason: string;
  nextSuggestedAction: string;
  updatedAt: string;
}

export interface ProjectStatusDrift {
  type: "ambiguity-count-mismatch" | "state-file-invalid";
  markdownBlockingCount?: number;
  jsonBlockingCount?: number;
  file?: string;
  message: string;
}

export interface ProjectStatusReport {
  projectRoot: string;
  confidenceScore: number;
  ambiguityCount: number;
  prdStatus: PrdStatus;
  taskProgress: TaskProgressStatus;
  activeBlockers: string[];
  architectureHealth: ArchitectureHealth;
  latestValidationStatus: LatestValidationStatus;
  runtime?: RuntimeStopStatus;
  drift: ProjectStatusDrift[];
}

export interface GetProjectStatusOptions {
  projectRoot: string;
}

export async function getProjectStatus(
  options: GetProjectStatusOptions
): Promise<ProjectStatusReport> {
  const paths = createProjectPaths(options.projectRoot);
  const projectStatePath = path.join(paths.state, "project-state.json");

  await assertInstalled(paths.projectRoot, projectStatePath);

  const confidenceReportPath = path.join(
    paths.discovery,
    "confidence-report.md"
  );
  const ambiguityReportPath = path.join(paths.state, "ambiguity-report.json");
  const approvalRecordPath = path.join(paths.state, "prd-approval.json");
  const dependencyGraphPath = path.join(paths.state, "dependency-graph.json");
  const executionMetricsPath = path.join(paths.state, "execution-metrics.json");
  const architectureDriftPath = path.join(paths.state, "architecture-drift.json");
  const confidenceReport = await readOptionalText(confidenceReportPath);
  const ambiguityReport = await readOptionalJsonState(
    ambiguityReportPath,
    "ambiguity-report.json"
  );
  const dependencyGraph = await readOptionalJsonState(
    dependencyGraphPath,
    "dependency-graph.json"
  );
  const executionMetrics = await readOptionalJsonState(
    executionMetricsPath,
    "execution-metrics.json"
  );
  const architectureDrift = await readOptionalJsonState(
    architectureDriftPath,
    "architecture-drift.json"
  );
  const projectState = await readOptionalJsonState(
    projectStatePath,
    "project-state.json"
  );
  const confidenceScore = confidenceReport
    ? parseConfidenceScore(confidenceReport)
    : 0;
  const markdownBlockingCount = confidenceReport
    ? parseBlockingAmbiguityCount(confidenceReport)
    : 0;
  const parsedAmbiguityReport = parseAmbiguityReportState(ambiguityReport);
  const ambiguityCount = parsedAmbiguityReport
    ? countBlockingAmbiguities(parsedAmbiguityReport.ambiguities)
    : 0;
  const parsedDependencyGraph = parseDependencyGraphState(dependencyGraph);
  const prdStatus = await readPrdStatus({
    approvalRecordPath,
    prdPath: path.join(paths.prd, "PRD.md"),
    confidenceReportPath,
    ambiguityReportPath
  });
  const taskProgress = parsedDependencyGraph
    ? calculateTaskProgress(parsedDependencyGraph.tasks)
    : {
        total: 0,
        pending: 0,
        blocked: 0,
        completed: 0
      };
  const activeBlockers = [
    ...createApprovalBlockers(prdStatus),
    ...createInvalidStateBlockers([
      ambiguityReport,
      dependencyGraph,
      executionMetrics,
      architectureDrift,
      projectState
    ]),
    ...createAmbiguityBlockers(ambiguityCount),
    ...createCycleBlockers(parsedDependencyGraph),
    ...createTaskBlockers(taskProgress.blocked)
  ];
  const drift: ProjectStatusDrift[] = [
    ...createInvalidStateDrift([
      ambiguityReport,
      dependencyGraph,
      executionMetrics,
      architectureDrift,
      projectState
    ]),
    ...(confidenceReport &&
    parsedAmbiguityReport &&
    markdownBlockingCount !== ambiguityCount
      ? [
          {
            type: "ambiguity-count-mismatch" as const,
            markdownBlockingCount,
            jsonBlockingCount: ambiguityCount,
            message:
              "Confidence report blocking ambiguity count does not match ambiguity-report.json."
          }
        ]
      : [])
  ];

  return {
    projectRoot: paths.projectRoot,
    confidenceScore,
    ambiguityCount,
    prdStatus,
    taskProgress,
    activeBlockers,
    architectureHealth: readArchitectureHealth(architectureDrift.value),
    latestValidationStatus: readLatestValidationStatus(executionMetrics.value),
    runtime: readRuntimeStopStatus(projectState.value),
    drift
  };
}

interface ApprovalStatusOptions {
  approvalRecordPath: string;
  prdPath: string;
  confidenceReportPath: string;
  ambiguityReportPath: string;
}

async function readPrdStatus(options: ApprovalStatusOptions): Promise<PrdStatus> {
  const approvalRecordText = await readOptionalText(options.approvalRecordPath);

  if (approvalRecordText === undefined) {
    return "draft";
  }

  let approvalRecord: ApprovalRecord;

  try {
    approvalRecord = parseApprovalRecord(JSON.parse(approvalRecordText));
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ValidationError) {
      return "malformed";
    }

    throw error;
  }

  const staleArtifacts = await findStaleApprovalArtifacts({
    approvalRecord,
    prdPath: options.prdPath,
    confidenceReportPath: options.confidenceReportPath,
    ambiguityReportPath: options.ambiguityReportPath
  });

  return staleArtifacts.length > 0 ? "stale" : "approved";
}

export function renderProjectStatusText(status: ProjectStatusReport): string {
  return [
    "Project Status",
    `Confidence: ${status.confidenceScore}%`,
    `Blocking Ambiguities: ${status.ambiguityCount}`,
    `PRD Status: ${status.prdStatus}`,
    `Task Progress: ${status.taskProgress.completed}/${status.taskProgress.total} completed, ${status.taskProgress.blocked} blocked`,
    `Active Blockers: ${status.activeBlockers.length === 0 ? "none" : status.activeBlockers.join("; ")}`,
    `Architecture Health: ${status.architectureHealth}`,
    `Latest Validation: ${status.latestValidationStatus}`,
    `Runtime: ${status.runtime ? `${status.runtime.status} - ${status.runtime.reason}` : "not-started"}`,
    `Drift: ${status.drift.length === 0 ? "none" : status.drift.map((drift) => drift.message).join("; ")}`
  ].join("\n");
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

interface OptionalJsonState {
  file: string;
  value?: unknown;
  invalid: boolean;
}

async function readOptionalJsonState(
  filePath: string,
  file: string
): Promise<OptionalJsonState> {
  const content = await readOptionalText(filePath);

  try {
    return {
      file,
      value: content === undefined ? undefined : JSON.parse(content),
      invalid: false
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        file,
        invalid: true
      };
    }

    throw error;
  }
}

function parseAmbiguityReportState(state: OptionalJsonState) {
  if (state.value === undefined || state.invalid) {
    return undefined;
  }

  try {
    return parseAmbiguityReport(state.value);
  } catch (error) {
    if (error instanceof ValidationError) {
      state.invalid = true;
      return undefined;
    }

    throw error;
  }
}

function parseDependencyGraphState(state: OptionalJsonState) {
  if (state.value === undefined || state.invalid) {
    return undefined;
  }

  try {
    return parseDependencyGraph(state.value);
  } catch (error) {
    if (error instanceof ValidationError) {
      state.invalid = true;
      return undefined;
    }

    throw error;
  }
}

function parseConfidenceScore(content: string): number {
  const match = content.match(/Project Understanding Confidence:\s*(\d+)%/);

  return match?.[1] === undefined ? 0 : Number.parseInt(match[1], 10);
}

function parseBlockingAmbiguityCount(content: string): number {
  const match = content.match(/Remaining Blocking Ambiguities:\s*(\d+)/);

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

function calculateTaskProgress(
  tasks: Array<{ status: "pending" | "blocked" | "completed" }>
): TaskProgressStatus {
  return {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    blocked: tasks.filter((task) => task.status === "blocked").length,
    completed: tasks.filter((task) => task.status === "completed").length
  };
}

function createAmbiguityBlockers(ambiguityCount: number): string[] {
  return ambiguityCount > 0
    ? [`${ambiguityCount} unresolved blocking ambiguities`]
    : [];
}

function createTaskBlockers(blockedTaskCount: number): string[] {
  return blockedTaskCount > 0 ? [`${blockedTaskCount} blocked tasks`] : [];
}

function createCycleBlockers(graph: DependencyGraph | undefined): string[] {
  if (!graph) {
    return [];
  }

  const cycles = detectDependencyCycles(graph);

  return cycles.length > 0
    ? [
        `dependency graph cycles: ${cycles
          .map((cycle) => [...cycle.taskIds, cycle.taskIds[0]].join(" -> "))
          .join("; ")}`
      ]
    : [];
}

function createApprovalBlockers(prdStatus: PrdStatus): string[] {
  if (prdStatus === "draft") {
    return ["PRD approval missing"];
  }

  if (prdStatus === "stale") {
    return ["stale PRD approval"];
  }

  if (prdStatus === "malformed") {
    return ["malformed PRD approval"];
  }

  return [];
}

function createInvalidStateBlockers(states: OptionalJsonState[]): string[] {
  return states
    .filter((state) => state.invalid)
    .map((state) => `${state.file} invalid`);
}

function createInvalidStateDrift(states: OptionalJsonState[]): ProjectStatusDrift[] {
  return states
    .filter((state) => state.invalid)
    .map((state) => ({
      type: "state-file-invalid",
      file: state.file,
      message: `${state.file} is invalid.`
    }));
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

function readLatestValidationStatus(metrics: unknown): LatestValidationStatus {
  if (!isRecord(metrics)) {
    return "unknown";
  }

  const value = metrics.latestValidationStatus;

  return typeof value === "string" && value.length > 0 ? value : "unknown";
}

function readArchitectureHealth(driftState: unknown): ArchitectureHealth {
  if (!isRecord(driftState)) {
    return "unknown";
  }

  const findings = driftState.findings;

  if (!Array.isArray(findings)) {
    return "unknown";
  }

  return findings.some(
    (finding) => isRecord(finding) && finding.status === "unresolved"
  )
    ? "drifted"
    : "healthy";
}

function readRuntimeStopStatus(projectState: unknown): RuntimeStopStatus | undefined {
  if (!isRecord(projectState) || !isRecord(projectState.runtime)) {
    return undefined;
  }

  const runtime = projectState.runtime;
  const status = runtime.status;
  const reason = runtime.reason;
  const nextSuggestedAction = runtime.nextSuggestedAction;
  const updatedAt = runtime.updatedAt;

  if (
    (status === "blocked" ||
      status === "failed" ||
      status === "paused" ||
      status === "complete") &&
    typeof reason === "string" &&
    typeof nextSuggestedAction === "string" &&
    typeof updatedAt === "string"
  ) {
    return {
      status,
      reason,
      nextSuggestedAction,
      updatedAt
    };
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
