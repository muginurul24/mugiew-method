import path from "node:path";
import fs from "node:fs/promises";

import { createProjectPaths, safeWriteFile } from "@mugiew-method/core";

export const SPECIFICATION_ARTIFACTS = [
  { kind: "architecture", fileName: "architecture.md", title: "Architecture" },
  { kind: "technical-spec", fileName: "technical-spec.md", title: "Technical Spec" },
  { kind: "api-contracts", fileName: "api-contracts.md", title: "API Contracts" },
  { kind: "database-schema", fileName: "database-schema.md", title: "Database Schema" },
  { kind: "execution-plan", fileName: "execution-plan.md", title: "Execution Plan" },
  { kind: "testing-strategy", fileName: "testing-strategy.md", title: "Testing Strategy" }
] as const;

export type SpecificationArtifactKind =
  (typeof SPECIFICATION_ARTIFACTS)[number]["kind"];
export type SpecificationApplicability = "applicable" | "not-applicable";

export interface SpecificationArtifactInput {
  kind: SpecificationArtifactKind;
  applicability: SpecificationApplicability;
  prdReferences: string[];
  content?: string[];
  notApplicableReason?: string;
}

export interface WriteSpecificationArtifactsOptions {
  projectRoot: string;
  artifacts: SpecificationArtifactInput[];
}

export interface WriteSpecificationArtifactsResult {
  writtenPaths: string[];
}

export async function writeSpecificationArtifacts(
  options: WriteSpecificationArtifactsOptions
): Promise<WriteSpecificationArtifactsResult> {
  const paths = createProjectPaths(options.projectRoot);
  const writtenPaths: string[] = [];
  await fs.access(path.join(paths.prd, "PRD.md"));

  for (const artifactDefinition of SPECIFICATION_ARTIFACTS) {
    const input = options.artifacts.find(
      (artifact) => artifact.kind === artifactDefinition.kind
    ) ?? {
      kind: artifactDefinition.kind,
      applicability: "not-applicable" as const,
      prdReferences: [],
      notApplicableReason: "No applicable requirement was identified in the PRD."
    };
    const filePath = path.join(paths.prd, artifactDefinition.fileName);

    await safeWriteFile(filePath, renderSpecificationArtifact(input), {
      overwrite: false
    });
    writtenPaths.push(filePath);
  }

  return { writtenPaths };
}

export function renderSpecificationArtifact(
  input: SpecificationArtifactInput
): string {
  const definition = SPECIFICATION_ARTIFACTS.find(
    (artifact) => artifact.kind === input.kind
  );
  const title = definition?.title ?? input.kind;

  return [
    `# ${title}`,
    "",
    `Applicability: ${input.applicability}`,
    "",
    "## PRD References",
    "",
    ...(input.prdReferences.length === 0
      ? ["- None"]
      : input.prdReferences.map((reference) => `- ${reference}`)),
    "",
    "## Details",
    "",
    ...renderDetails(input),
    ""
  ].join("\n");
}

function renderDetails(input: SpecificationArtifactInput): string[] {
  if (input.applicability === "not-applicable") {
    return [
      `Not applicable: ${input.notApplicableReason ?? "No applicable scope."}`
    ];
  }

  return input.content?.length === 0 || input.content === undefined
    ? ["Applicable. Details pending generation."]
    : input.content.map((line) => `- ${line}`);
}
