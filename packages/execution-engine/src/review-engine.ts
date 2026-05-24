import path from "node:path";

import { createProjectPaths, safeWriteFile } from "@mugiew-method/core";

import type { TaskValidationResult } from "./validation-runner.js";

export type SelfReviewFindingSeverity = "low" | "medium" | "critical";
export type SelfReviewFindingDisposition =
  | "blocks-completion"
  | "tracked"
  | "resolved"
  | "approved-exception";

export interface SelfReviewCheck {
  category:
    | "code-smell"
    | "duplication"
    | "architecture-drift"
    | "maintainability"
    | "ai-readability"
    | "type-safety"
    | "lint"
    | "tests"
    | "rule-compliance";
  severity: SelfReviewFindingSeverity;
  message: string;
  evidence: string;
  disposition?: SelfReviewFindingDisposition;
}

export interface SelfReviewFinding extends SelfReviewCheck {
  id: string;
  disposition: SelfReviewFindingDisposition;
}

export interface RunSelfReviewOptions {
  projectRoot: string;
  taskId: string;
  validationResult: TaskValidationResult;
  checks?: SelfReviewCheck[];
  now?: Date;
}

export interface SelfReviewResult {
  taskId: string;
  canCompleteTask: boolean;
  findings: SelfReviewFinding[];
  journalPath: string;
}

export async function runSelfReview(
  options: RunSelfReviewOptions
): Promise<SelfReviewResult> {
  const now = options.now ?? new Date();
  const findings = createSelfReviewFindings({
    validationResult: options.validationResult,
    checks: options.checks ?? []
  });
  const resultWithoutJournal = {
    taskId: options.taskId,
    canCompleteTask: !findings.some(
      (finding) => finding.disposition === "blocks-completion"
    ),
    findings
  };
  const journalPath = await writeSelfReviewJournal({
    projectRoot: options.projectRoot,
    now,
    result: resultWithoutJournal
  });

  return {
    ...resultWithoutJournal,
    journalPath
  };
}

interface CreateSelfReviewFindingsOptions {
  validationResult: TaskValidationResult;
  checks: SelfReviewCheck[];
}

function createSelfReviewFindings(
  options: CreateSelfReviewFindingsOptions
): SelfReviewFinding[] {
  const findings: SelfReviewFinding[] = [];

  if (!options.validationResult.passed) {
    findings.push({
      id: "SELF-REVIEW-001",
      category: "tests",
      severity: "critical",
      message: "Validation command failed.",
      evidence: options.validationResult.failedCommand,
      disposition: "blocks-completion"
    });
  }

  for (const check of options.checks) {
    findings.push({
      ...check,
      id: `SELF-REVIEW-${String(findings.length + 1).padStart(3, "0")}`,
      disposition:
        check.disposition ??
        (check.severity === "critical" ? "blocks-completion" : "tracked")
    });
  }

  return findings;
}

interface WriteSelfReviewJournalOptions {
  projectRoot: string;
  now: Date;
  result: Omit<SelfReviewResult, "journalPath">;
}

async function writeSelfReviewJournal(
  options: WriteSelfReviewJournalOptions
): Promise<string> {
  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(
    paths.journal,
    `${formatJournalTimestamp(options.now)}-self-review-${options.result.taskId}.md`
  );
  const content = [
    "# Self Review",
    "",
    `Recorded At: ${options.now.toISOString()}`,
    `Task ID: ${options.result.taskId}`,
    `Can Complete Task: ${options.result.canCompleteTask ? "yes" : "no"}`,
    "",
    "## Findings",
    "",
    ...(options.result.findings.length === 0
      ? ["- None"]
      : options.result.findings.flatMap((finding) => [
          `### ${finding.id}`,
          "",
          `- Category: ${finding.category}`,
          `- Severity: ${finding.severity}`,
          `- Disposition: ${finding.disposition}`,
          `- Message: ${finding.message}`,
          `- Evidence: ${finding.evidence}`,
          ""
        ]))
  ].join("\n");

  await safeWriteFile(filePath, content, {
    overwrite: false
  });

  return filePath;
}

function formatJournalTimestamp(date: Date): string {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}
