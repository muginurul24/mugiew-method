import path from "node:path";

import { createProjectPaths, safeWriteFile } from "@mugiew-method/core";

export interface PrdArtifactInput {
  title: string;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  acceptanceCriteria: string[];
  constraints: string[];
  architectureDecisions: string[];
  openQuestions: string[];
  assumptions: string[];
  sourceArtifacts: string[];
}

export interface WritePrdArtifactOptions {
  projectRoot: string;
  input: PrdArtifactInput;
}

export interface WritePrdArtifactResult {
  filePath: string;
  content: string;
}

export async function writePrdArtifact(
  options: WritePrdArtifactOptions
): Promise<WritePrdArtifactResult> {
  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(paths.prd, "PRD.md");
  const content = renderPrdArtifact(options.input);

  await safeWriteFile(filePath, content, {
    overwrite: false
  });

  return {
    filePath,
    content
  };
}

export function renderPrdArtifact(input: PrdArtifactInput): string {
  return [
    `# ${input.title}`,
    "",
    renderSection("Functional Requirements", "FR", normalizeCapabilities(input.functionalRequirements)),
    renderSection("Non-Functional Requirements", "NFR", input.nonFunctionalRequirements),
    renderSection("Acceptance Criteria", "AC", input.acceptanceCriteria),
    renderSection("Constraints", "C", input.constraints),
    renderSection("Architecture Decisions", "AD", input.architectureDecisions),
    renderSection("Open Questions", "OQ", input.openQuestions),
    renderSection("Assumptions", "AS", input.assumptions),
    renderAssumptionIndex(input.assumptions),
    renderSourceArtifacts(input.sourceArtifacts)
  ].join("\n");
}

function renderSection(title: string, prefix: string, items: string[]): string {
  return [
    `## ${title}`,
    "",
    ...items.map((item, index) => `${formatId(prefix, index)}: ${item}`),
    ""
  ].join("\n");
}

function renderAssumptionIndex(assumptions: string[]): string {
  return [
    "## Assumption Index",
    "",
    ...assumptions.map(
      (assumption, index) => `- ${formatId("AS", index)}: ${assumption}`
    ),
    ""
  ].join("\n");
}

function renderSourceArtifacts(sourceArtifacts: string[]): string {
  return [
    "## Source Discovery Artifacts",
    "",
    ...sourceArtifacts.map((sourceArtifact) => `- ${sourceArtifact}`),
    ""
  ].join("\n");
}

function normalizeCapabilities(requirements: string[]): string[] {
  return requirements.map((requirement) =>
    requirement.replaceAll(/\b(use|install|create table|add package)\b/gi, "support")
  );
}

function formatId(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}
