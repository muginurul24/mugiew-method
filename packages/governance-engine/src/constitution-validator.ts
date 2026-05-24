import path from "node:path";

import { createProjectPaths, safeWriteFile } from "@mugiew-method/core";

export type ConstitutionViolationSeverity = "critical";
export type ConstitutionViolationStatus = "unresolved" | "approved-exception";

export interface WorkOutput {
  path: string;
  content: string;
}

export interface ApprovedConstitutionException {
  ruleReference: string;
  reason: string;
  approvedBy: string;
}

export interface ConstitutionViolation {
  id: string;
  ruleReference: string;
  rule: string;
  severity: ConstitutionViolationSeverity;
  status: ConstitutionViolationStatus;
  outputPath: string;
  evidence: string;
}

export interface ValidateWorkAgainstAgentsOptions {
  agentsContent: string;
  outputs: WorkOutput[];
  approvedExceptions?: ApprovedConstitutionException[];
}

export interface ConstitutionValidationResult {
  violations: ConstitutionViolation[];
  canMarkDone: boolean;
}

export interface WriteApprovedExceptionJournalOptions {
  projectRoot: string;
  validationResult: ConstitutionValidationResult;
  approvedExceptions: ApprovedConstitutionException[];
  now: Date;
}

export interface WriteApprovedExceptionJournalResult {
  filePath: string;
  content: string;
}

interface ConstitutionRule {
  reference: string;
  text: string;
}

export function validateWorkAgainstAgents(
  options: ValidateWorkAgainstAgentsOptions
): ConstitutionValidationResult {
  const forbiddenPatternRules = parseSectionRules({
    content: options.agentsContent,
    sectionTitle: "Forbidden Patterns"
  });
  const approvedRuleReferences = new Set(
    (options.approvedExceptions ?? []).map((exception) => exception.ruleReference)
  );
  const violations = forbiddenPatternRules.flatMap((rule, ruleIndex) =>
    options.outputs.flatMap((output, outputIndex) =>
      createViolationForOutput({
        rule,
        ruleIndex,
        outputIndex,
        output,
        approvedRuleReferences
      })
    )
  );

  return {
    violations,
    canMarkDone: !violations.some(
      (violation) =>
        violation.severity === "critical" && violation.status === "unresolved"
    )
  };
}

export async function writeApprovedExceptionJournal(
  options: WriteApprovedExceptionJournalOptions
): Promise<WriteApprovedExceptionJournalResult | undefined> {
  const approvedViolations = options.validationResult.violations.filter(
    (violation) => violation.status === "approved-exception"
  );

  if (approvedViolations.length === 0) {
    return undefined;
  }

  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(
    paths.journal,
    `${formatJournalTimestamp(options.now)}-agents-exceptions.md`
  );
  const content = renderApprovedExceptionJournal({
    approvedViolations,
    approvedExceptions: options.approvedExceptions,
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

interface RenderApprovedExceptionJournalOptions {
  approvedViolations: ConstitutionViolation[];
  approvedExceptions: ApprovedConstitutionException[];
  now: Date;
}

function renderApprovedExceptionJournal(
  options: RenderApprovedExceptionJournalOptions
): string {
  const exceptionByRuleReference = new Map(
    options.approvedExceptions.map((exception) => [
      exception.ruleReference,
      exception
    ])
  );

  return [
    "# AGENTS.md Approved Exceptions",
    "",
    `Recorded At: ${options.now.toISOString()}`,
    "",
    ...options.approvedViolations.flatMap((violation) => {
      const exception = exceptionByRuleReference.get(violation.ruleReference);

      return [
        `## ${violation.ruleReference}`,
        "",
        `- Rule: ${violation.rule}`,
        `- Output: ${violation.outputPath}`,
        `- Evidence: ${violation.evidence}`,
        `- Approved By: ${exception?.approvedBy ?? "unknown"}`,
        `- Reason: ${exception?.reason ?? "No reason recorded."}`,
        ""
      ];
    })
  ].join("\n");
}

interface ParseSectionRulesOptions {
  content: string;
  sectionTitle: string;
}

function parseSectionRules(options: ParseSectionRulesOptions): ConstitutionRule[] {
  const sectionLines: string[] = [];
  let inSection = false;

  for (const line of options.content.split("\n")) {
    if (line.trim() === `## ${options.sectionTitle}`) {
      inSection = true;
      continue;
    }

    if (inSection && line.startsWith("## ")) {
      break;
    }

    if (inSection) {
      sectionLines.push(line);
    }
  }

  return sectionLines
    .map((line) => line.match(/^\s*-\s+(.+)$/)?.[1]?.trim())
    .filter((rule): rule is string => rule !== undefined && rule !== "Not specified.")
    .map((rule, index) => ({
      reference: `${options.sectionTitle} #${index + 1}`,
      text: rule
    }));
}

interface CreateViolationForOutputOptions {
  rule: ConstitutionRule;
  ruleIndex: number;
  outputIndex: number;
  output: WorkOutput;
  approvedRuleReferences: Set<string>;
}

function createViolationForOutput(
  options: CreateViolationForOutputOptions
): ConstitutionViolation[] {
  if (!options.output.content.includes(options.rule.text)) {
    return [];
  }

  const status = options.approvedRuleReferences.has(options.rule.reference)
    ? "approved-exception"
    : "unresolved";

  return [
    {
      id: `AGENTS-${String(options.ruleIndex + 1).padStart(3, "0")}-${String(options.outputIndex + 1).padStart(3, "0")}`,
      ruleReference: options.rule.reference,
      rule: options.rule.text,
      severity: "critical",
      status,
      outputPath: options.output.path,
      evidence: options.rule.text
    }
  ];
}

function formatJournalTimestamp(date: Date): string {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}
