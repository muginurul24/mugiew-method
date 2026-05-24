import fs from "node:fs/promises";
import path from "node:path";

import {
  MissingInstallationError,
  ValidationError,
  createProjectPaths,
  parseDependencyGraph,
  safeWriteFile
} from "@mugiew-method/core";

import {
  type WorkOutput,
  validateWorkAgainstAgents
} from "./constitution-validator.js";

export type ReviewFindingCategory =
  | "architecture-drift"
  | "rule-violation"
  | "task-claim"
  | "validation-gap";

export type ReviewFindingSeverity = "low" | "medium" | "high" | "critical";

export interface ReviewFinding {
  category: ReviewFindingCategory;
  severity: ReviewFindingSeverity;
  message: string;
  evidence: string;
}

export interface ReviewProjectOptions {
  projectRoot: string;
  taskOutputs?: WorkOutput[];
  scanPaths?: string[];
  now?: Date;
}

export interface ReviewProjectResult {
  journalPath: string;
  findings: ReviewFinding[];
  scannedFileCount: number;
  skippedFileCount: number;
  findingCountsByCategory: Record<ReviewFindingCategory, number>;
  scanStatus: "not-scanned" | "scanned-with-findings" | "scanned-clean";
}

export async function reviewProject(
  options: ReviewProjectOptions
): Promise<ReviewProjectResult> {
  const paths = createProjectPaths(options.projectRoot);
  const now = options.now ?? new Date();

  await assertInstalled(paths.projectRoot, path.join(paths.state, "project-state.json"));

  const scannedOutputs = await collectScannedOutputs({
    projectRoot: paths.projectRoot,
    scanPaths: options.scanPaths ?? []
  });
  const taskOutputs = [...(options.taskOutputs ?? []), ...scannedOutputs.outputs];
  const findings = [
    ...(await collectArchitectureDriftFindings(
      path.join(paths.state, "architecture-drift.json")
    )),
    ...(await collectRuleViolationFindings(paths.agentsFile, taskOutputs)),
    ...(await collectTaskClaimFindings(path.join(paths.state, "dependency-graph.json"))),
    ...(await collectValidationGapFindings(
      path.join(paths.state, "execution-metrics.json")
    ))
  ];
  const content = renderReviewProjectReport({
    now,
    findings,
    scannedFileCount: scannedOutputs.scannedFileCount,
    skippedFileCount: scannedOutputs.skippedFileCount,
    scanStatus: createScanStatus(scannedOutputs.scannedFileCount, findings)
  });
  const journalPath = path.join(
    paths.journal,
    `${formatJournalTimestamp(now)}-review-project.md`
  );

  await safeWriteFile(journalPath, content, {
    overwrite: false
  });

  return {
    journalPath,
    findings,
    scannedFileCount: scannedOutputs.scannedFileCount,
    skippedFileCount: scannedOutputs.skippedFileCount,
    findingCountsByCategory: countFindingsByCategory(findings),
    scanStatus: createScanStatus(scannedOutputs.scannedFileCount, findings)
  };
}

interface CollectScannedOutputsOptions {
  projectRoot: string;
  scanPaths: string[];
}

async function collectScannedOutputs(
  options: CollectScannedOutputsOptions
): Promise<{
  outputs: WorkOutput[];
  scannedFileCount: number;
  skippedFileCount: number;
}> {
  const outputs: WorkOutput[] = [];
  let skippedFileCount = 0;

  for (const scanPath of options.scanPaths) {
    const absolutePath = path.resolve(options.projectRoot, scanPath);
    const relativePath = path.relative(options.projectRoot, absolutePath);

    if (isOutsideProject(relativePath)) {
      skippedFileCount += 1;
      continue;
    }

    try {
      const realPath = await fs.realpath(absolutePath);
      const realRelativePath = path.relative(options.projectRoot, realPath);

      if (isOutsideProject(realRelativePath)) {
        skippedFileCount += 1;
        continue;
      }

      const stat = await fs.stat(realPath);

      if (!stat.isFile()) {
        skippedFileCount += 1;
        continue;
      }

      const content = await fs.readFile(realPath);

      if (content.includes(0)) {
        skippedFileCount += 1;
        continue;
      }

      outputs.push({
        path: relativePath,
        content: content.toString("utf8")
      });
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        skippedFileCount += 1;
        continue;
      }

      throw error;
    }
  }

  return {
    outputs,
    scannedFileCount: outputs.length,
    skippedFileCount
  };
}

function isOutsideProject(relativePath: string): boolean {
  return (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  );
}

async function collectArchitectureDriftFindings(
  driftStatePath: string
): Promise<ReviewFinding[]> {
  const driftState = await readOptionalJson(driftStatePath);

  if (!isRecord(driftState) || !Array.isArray(driftState.findings)) {
    return [];
  }

  return driftState.findings
    .filter((finding) => isRecord(finding) && finding.status === "unresolved")
    .map((finding) => ({
      category: "architecture-drift" as const,
      severity: readSeverity(finding.severity),
      message: String(finding.observedChange ?? "Architecture drift detected."),
      evidence: String(finding.id ?? "unknown")
    }));
}

async function collectRuleViolationFindings(
  agentsPath: string,
  taskOutputs: WorkOutput[]
): Promise<ReviewFinding[]> {
  const agentsContent = await readOptionalText(agentsPath);

  if (!agentsContent || taskOutputs.length === 0) {
    return [];
  }

  const result = validateWorkAgainstAgents({
    agentsContent,
    outputs: taskOutputs
  });

  return result.violations
    .filter((violation) => violation.status === "unresolved")
    .map((violation) => ({
      category: "rule-violation" as const,
      severity: violation.severity,
      message: `${violation.ruleReference}: ${violation.rule}`,
      evidence: `${violation.outputPath}: ${violation.evidence}`
    }));
}

async function collectTaskClaimFindings(
  dependencyGraphPath: string
): Promise<ReviewFinding[]> {
  const dependencyGraph = await readOptionalJson(dependencyGraphPath);

  if (!dependencyGraph) {
    return [];
  }

  let graph;

  try {
    graph = parseDependencyGraph(dependencyGraph);
  } catch (error) {
    if (error instanceof ValidationError) {
      return [
        {
          category: "task-claim",
          severity: "critical",
          message: "Dependency graph has invalid task completion claims.",
          evidence: error.message
        }
      ];
    }

    throw error;
  }

  return graph.tasks
    .filter(
      (task) => task.status === "completed" && task.journalEntries.length === 0
    )
    .map((task) => ({
      category: "task-claim" as const,
      severity: "critical" as const,
      message: "Completed task lacks Journal trace.",
      evidence: task.id
    }));
}

async function collectValidationGapFindings(
  executionMetricsPath: string
): Promise<ReviewFinding[]> {
  const metrics = await readOptionalJson(executionMetricsPath);

  if (!isRecord(metrics)) {
    return [
      {
        category: "validation-gap",
        severity: "medium",
        message: "Latest validation status is unknown.",
        evidence: "state/execution-metrics.json missing"
      }
    ];
  }

  return metrics.latestValidationStatus === "passed"
    ? []
    : [
        {
          category: "validation-gap",
          severity: "high",
          message: "Latest validation status is not passed.",
          evidence: String(metrics.latestValidationStatus ?? "unknown")
        }
      ];
}

interface RenderReviewProjectReportOptions {
  now: Date;
  findings: ReviewFinding[];
  scannedFileCount: number;
  skippedFileCount: number;
  scanStatus: ReviewProjectResult["scanStatus"];
}

function renderReviewProjectReport(
  options: RenderReviewProjectReportOptions
): string {
  return [
    "# Project Review",
    "",
    `Recorded At: ${options.now.toISOString()}`,
    `Findings: ${options.findings.length}`,
    `Scanned Files: ${options.scannedFileCount}`,
    `Skipped Files: ${options.skippedFileCount}`,
    `Scan Status: ${options.scanStatus}`,
    "",
    ...options.findings.flatMap((finding, index) => [
      `## Finding ${index + 1}`,
      "",
      `- Category: ${finding.category}`,
      `- Severity: ${finding.severity}`,
      `- Message: ${finding.message}`,
      `- Evidence: ${finding.evidence}`,
      ""
    ])
  ].join("\n");
}

function countFindingsByCategory(
  findings: ReviewFinding[]
): Record<ReviewFindingCategory, number> {
  return {
    "architecture-drift": findings.filter(
      (finding) => finding.category === "architecture-drift"
    ).length,
    "rule-violation": findings.filter(
      (finding) => finding.category === "rule-violation"
    ).length,
    "task-claim": findings.filter((finding) => finding.category === "task-claim")
      .length,
    "validation-gap": findings.filter(
      (finding) => finding.category === "validation-gap"
    ).length
  };
}

function createScanStatus(
  scannedFileCount: number,
  findings: ReviewFinding[]
): ReviewProjectResult["scanStatus"] {
  if (scannedFileCount === 0) {
    return "not-scanned";
  }

  return findings.some((finding) => finding.category === "rule-violation")
    ? "scanned-with-findings"
    : "scanned-clean";
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

async function readOptionalJson(filePath: string): Promise<unknown | undefined> {
  const content = await readOptionalText(filePath);

  return content === undefined ? undefined : JSON.parse(content);
}

function readSeverity(value: unknown): ReviewFindingSeverity {
  return value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "critical"
    ? value
    : "medium";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function formatJournalTimestamp(date: Date): string {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}
