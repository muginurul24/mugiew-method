import { createProjectPaths, safeWriteFile } from "@mugiew-method/core";

export interface AgentsConstitutionInput {
  architectureRules: string[];
  codingStandards: string[];
  uiRules: string[];
  maintainabilityStandards: string[];
  testingRequirements: string[];
  forbiddenPatterns: string[];
  stackDecisions: string[];
  aiExecutionConstraints: string[];
}

export interface WriteAgentsConstitutionOptions {
  projectRoot: string;
  input: AgentsConstitutionInput;
}

export interface WriteAgentsConstitutionResult {
  filePath: string;
  content: string;
}

export async function writeAgentsConstitution(
  options: WriteAgentsConstitutionOptions
): Promise<WriteAgentsConstitutionResult> {
  const paths = createProjectPaths(options.projectRoot);
  const content = renderAgentsConstitution(options.input);

  await safeWriteFile(paths.agentsFile, content, {
    overwrite: false
  });

  return {
    filePath: paths.agentsFile,
    content
  };
}

export function renderAgentsConstitution(
  input: AgentsConstitutionInput
): string {
  return [
    "# AGENTS.md",
    "",
    "Mugiew Method AI Constitution.",
    "",
    "## Core Rule",
    "",
    "- No implementation before clarity gates pass.",
    "- Read Mugiew Method artifacts before editing project files.",
    "",
    renderRuleSection("Architecture Rules", input.architectureRules),
    renderRuleSection("Coding Standards", input.codingStandards),
    renderRuleSection("UI Rules", input.uiRules),
    renderRuleSection(
      "Maintainability Standards",
      input.maintainabilityStandards
    ),
    renderRuleSection("Testing Requirements", input.testingRequirements),
    renderRuleSection("Forbidden Patterns", input.forbiddenPatterns),
    renderRuleSection("Stack Decisions", input.stackDecisions),
    renderRuleSection("AI Execution Constraints", input.aiExecutionConstraints)
  ].join("\n");
}

function renderRuleSection(title: string, rules: string[]): string {
  return [
    `## ${title}`,
    "",
    ...(rules.length === 0 ? ["- Not specified."] : rules.map((rule) => `- ${rule}`)),
    ""
  ].join("\n");
}
