import path from "node:path";

import { createProjectPaths, safeWriteFile } from "@mugiew-method/core";

export type ArchitectureDriftSeverity = "low" | "medium" | "high" | "critical";
export type ArchitectureDriftStatus = "unresolved" | "approved";

export interface ArchitectureRule {
  id: string;
  expectedRule: string;
  forbiddenPattern: string;
  severity: ArchitectureDriftSeverity;
  remediation: string;
}

export interface ArchitectureDriftOutput {
  path: string;
  content: string;
}

export interface ApprovedArchitectureDrift {
  findingId: string;
  reason: string;
  approvedBy: string;
}

export interface ArchitectureDriftFinding {
  id: string;
  ruleId: string;
  outputPath: string;
  expectedRule: string;
  observedChange: string;
  severity: ArchitectureDriftSeverity;
  remediation: string;
  status: ArchitectureDriftStatus;
}

export interface DetectArchitectureDriftOptions {
  rules: ArchitectureRule[];
  outputs: ArchitectureDriftOutput[];
  approvedDrift?: ApprovedArchitectureDrift[];
}

export interface ArchitectureDriftResult {
  findings: ArchitectureDriftFinding[];
  hasUnresolvedDrift: boolean;
}

export interface WriteApprovedDriftJournalOptions {
  projectRoot: string;
  driftResult: ArchitectureDriftResult;
  approvedDrift: ApprovedArchitectureDrift[];
  now: Date;
}

export interface WriteApprovedDriftJournalResult {
  filePath: string;
  content: string;
}

export interface WriteArchitectureDriftStateOptions {
  projectRoot: string;
  driftResult: ArchitectureDriftResult;
}

export interface WriteArchitectureDriftStateResult {
  filePath: string;
  content: string;
}

export function detectArchitectureDrift(
  options: DetectArchitectureDriftOptions
): ArchitectureDriftResult {
  const approvedFindingIds = new Set(
    (options.approvedDrift ?? []).map((drift) => drift.findingId)
  );
  const findings = options.rules.flatMap((rule, ruleIndex) =>
    options.outputs.flatMap((output, outputIndex) =>
      createFindingForOutput({
        rule,
        ruleIndex,
        output,
        outputIndex,
        approvedFindingIds
      })
    )
  );

  return {
    findings,
    hasUnresolvedDrift: findings.some(
      (finding) => finding.status === "unresolved"
    )
  };
}

export async function writeApprovedDriftJournal(
  options: WriteApprovedDriftJournalOptions
): Promise<WriteApprovedDriftJournalResult | undefined> {
  const approvedFindings = options.driftResult.findings.filter(
    (finding) => finding.status === "approved"
  );

  if (approvedFindings.length === 0) {
    return undefined;
  }

  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(
    paths.journal,
    `${formatJournalTimestamp(options.now)}-architecture-drift.md`
  );
  const content = renderApprovedDriftJournal({
    approvedFindings,
    approvedDrift: options.approvedDrift,
    now: options.now
  });

  await safeWriteFile(filePath, content, {
    overwrite: false
  });

  return {
    filePath,
    content
  };
}

export async function writeArchitectureDriftState(
  options: WriteArchitectureDriftStateOptions
): Promise<WriteArchitectureDriftStateResult> {
  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(paths.state, "architecture-drift.json");
  const content = `${JSON.stringify(options.driftResult, null, 2)}\n`;

  await safeWriteFile(filePath, content, {
    overwrite: true
  });

  return {
    filePath,
    content
  };
}

interface CreateFindingForOutputOptions {
  rule: ArchitectureRule;
  ruleIndex: number;
  output: ArchitectureDriftOutput;
  outputIndex: number;
  approvedFindingIds: Set<string>;
}

function createFindingForOutput(
  options: CreateFindingForOutputOptions
): ArchitectureDriftFinding[] {
  if (!options.output.content.includes(options.rule.forbiddenPattern)) {
    return [];
  }

  const id = `DRIFT-${String(options.ruleIndex + 1).padStart(3, "0")}-${String(options.outputIndex + 1).padStart(3, "0")}`;

  return [
    {
      id,
      ruleId: options.rule.id,
      outputPath: options.output.path,
      expectedRule: options.rule.expectedRule,
      observedChange: `Found forbidden pattern: ${options.rule.forbiddenPattern}`,
      severity: options.rule.severity,
      remediation: options.rule.remediation,
      status: options.approvedFindingIds.has(id) ? "approved" : "unresolved"
    }
  ];
}

interface RenderApprovedDriftJournalOptions {
  approvedFindings: ArchitectureDriftFinding[];
  approvedDrift: ApprovedArchitectureDrift[];
  now: Date;
}

function renderApprovedDriftJournal(
  options: RenderApprovedDriftJournalOptions
): string {
  const approvalByFindingId = new Map(
    options.approvedDrift.map((approval) => [approval.findingId, approval])
  );

  return [
    "# Approved Architecture Drift",
    "",
    `Recorded At: ${options.now.toISOString()}`,
    "",
    ...options.approvedFindings.flatMap((finding) => {
      const approval = approvalByFindingId.get(finding.id);

      return [
        `## ${finding.id}`,
        "",
        `- Rule: ${finding.expectedRule}`,
        `- Observed: ${finding.observedChange}`,
        `- Severity: ${finding.severity}`,
        `- Remediation: ${finding.remediation}`,
        `- Approved By: ${approval?.approvedBy ?? "unknown"}`,
        `- Reason: ${approval?.reason ?? "No reason recorded."}`,
        ""
      ];
    })
  ].join("\n");
}

function formatJournalTimestamp(date: Date): string {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}
