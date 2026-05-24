import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  renderAgentsConstitution,
  writeAgentsConstitution
} from "./agents-generator.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("AGENTS.md generator", () => {
  it("renders all required constitution sections", () => {
    const content = renderAgentsConstitution(createInput());

    for (const section of [
      "## Architecture Rules",
      "## Coding Standards",
      "## UI Rules",
      "## Maintainability Standards",
      "## Testing Requirements",
      "## Forbidden Patterns",
      "## Stack Decisions",
      "## AI Execution Constraints"
    ]) {
      expect(content).toContain(section);
    }
  });

  it("states implementation cannot begin before clarity gates pass", () => {
    const content = renderAgentsConstitution(createInput());

    expect(content).toContain("No implementation before clarity gates pass.");
  });

  it("uses common Markdown without tool-specific metadata", () => {
    const content = renderAgentsConstitution(createInput());

    expect(content.startsWith("# AGENTS.md")).toBe(true);
    expect(content).not.toContain("---\n");
    expect(content).not.toContain("@metadata");
  });

  it("writes root AGENTS.md", async () => {
    const projectRoot = await createTempRoot();

    const result = await writeAgentsConstitution({
      projectRoot,
      input: createInput()
    });

    expect(result.filePath).toBe(path.join(projectRoot, "AGENTS.md"));
    await expect(fs.readFile(result.filePath, "utf8")).resolves.toContain(
      "## Architecture Rules"
    );
  });
});

function createInput(): ReturnTypeInput {
  return {
    architectureRules: ["Keep CLI adapter-only."],
    codingStandards: ["Use TypeScript strict mode."],
    uiRules: ["Avoid generic AI-generated UI patterns."],
    maintainabilityStandards: ["Prefer AI-readable structure."],
    testingRequirements: ["Run typecheck and tests before done."],
    forbiddenPatterns: ["Do not silently overwrite user-owned files."],
    stackDecisions: ["Use Node.js, TypeScript, pnpm, and oclif."],
    aiExecutionConstraints: ["Respect AGENTS.md and Mugiew Method state."]
  };
}

type ReturnTypeInput = Parameters<typeof renderAgentsConstitution>[0];

async function createTempRoot(): Promise<string> {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-agents-")
  );
  tempRoots.push(tempRoot);

  return tempRoot;
}
