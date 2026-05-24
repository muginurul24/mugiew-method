import path from "node:path";

import { createProjectPaths, safeWriteFile } from "@mugiew-method/core";

export const RULE_TEMPLATE_FILES = [
  "coding-rules.md",
  "architecture-rules.md",
  "testing-rules.md",
  "ui-rules.md"
] as const;

export type RuleTemplateFile = (typeof RULE_TEMPLATE_FILES)[number];
export type RuleTemplateMap = Record<RuleTemplateFile, string>;

export interface WriteRuleTemplatesOptions {
  projectRoot: string;
}

export interface WriteRuleTemplatesResult {
  writtenPaths: string[];
}

export async function writeRuleTemplates(
  options: WriteRuleTemplatesOptions
): Promise<WriteRuleTemplatesResult> {
  const paths = createProjectPaths(options.projectRoot);
  const templates = renderRuleTemplates();
  const writtenPaths: string[] = [];

  for (const fileName of RULE_TEMPLATE_FILES) {
    const filePath = path.join(paths.rules, fileName);
    await safeWriteFile(filePath, templates[fileName], {
      overwrite: false
    });
    writtenPaths.push(filePath);
  }

  return { writtenPaths };
}

export function renderRuleTemplates(): RuleTemplateMap {
  return {
    "coding-rules.md": [
      "# Coding Rules",
      "",
      "- Use TypeScript strict mode.",
      "- Keep package boundaries explicit.",
      "- Prefer deterministic, AI-readable functions.",
      "- Do not silently overwrite user-owned files.",
      ""
    ].join("\n"),
    "architecture-rules.md": [
      "# Architecture Rules",
      "",
      "- Keep CLI classes adapter-only.",
      "- Put shared contracts and filesystem primitives in core.",
      "- Put governance artifact generation in governance-engine.",
      "- Keep engine packages independent from CLI internals.",
      ""
    ].join("\n"),
    "testing-rules.md": [
      "# Testing Rules",
      "",
      "- Add focused unit tests for domain logic.",
      "- Cover error paths and guardrails.",
      "- Run typecheck, tests, and build before marking work done.",
      ""
    ].join("\n"),
    "ui-rules.md": [
      "# UI Rules",
      "",
      "- Follow Uncodixfy-aligned UI discipline.",
      "- Avoid excessive glassmorphism, unnecessary gradients, oversized rounded corners, generic dashboard cards, decorative layouts, and fake-modern interfaces.",
      "- Where UI exists, implement loading, empty, error, disabled, responsive, and accessibility states.",
      "- UI should feel intentionally designed by humans, not generated from generic AI patterns.",
      ""
    ].join("\n")
  };
}
