import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  validateWorkAgainstAgents,
  writeApprovedExceptionJournal
} from "./constitution-validator.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("constitution validator", () => {
  it("reports violations with rule reference", () => {
    const result = validateWorkAgainstAgents({
      agentsContent: createAgentsContent(),
      outputs: [
        {
          path: "src/example.ts",
          content: "This implementation uses silent overwrite."
        }
      ]
    });

    expect(result.violations).toEqual([
      {
        id: "AGENTS-001-001",
        ruleReference: "Forbidden Patterns #1",
        rule: "silent overwrite",
        severity: "critical",
        status: "unresolved",
        outputPath: "src/example.ts",
        evidence: "silent overwrite"
      }
    ]);
  });

  it("prevents done state while critical violations are unresolved", () => {
    const result = validateWorkAgainstAgents({
      agentsContent: createAgentsContent(),
      outputs: [
        {
          path: "src/example.ts",
          content: "This implementation uses silent overwrite."
        }
      ]
    });

    expect(result.canMarkDone).toBe(false);
  });

  it("creates unique IDs for same rule across multiple outputs", () => {
    const result = validateWorkAgainstAgents({
      agentsContent: createAgentsContent(),
      outputs: [
        {
          path: "src/one.ts",
          content: "silent overwrite"
        },
        {
          path: "src/two.ts",
          content: "silent overwrite"
        }
      ]
    });

    expect(result.violations.map((violation) => violation.id)).toEqual([
      "AGENTS-001-001",
      "AGENTS-001-002"
    ]);
  });

  it("allows done state when critical violations have approved exceptions", () => {
    const result = validateWorkAgainstAgents({
      agentsContent: createAgentsContent(),
      outputs: [
        {
          path: "src/example.ts",
          content: "This implementation uses silent overwrite."
        }
      ],
      approvedExceptions: [
        {
          ruleReference: "Forbidden Patterns #1",
          approvedBy: "Mugiew",
          reason: "Legacy migration requires one controlled overwrite."
        }
      ]
    });

    expect(result.canMarkDone).toBe(true);
    expect(result.violations[0]?.status).toBe("approved-exception");
  });

  it("writes approved exceptions to Journal", async () => {
    const projectRoot = await createProjectRoot();
    const approvedExceptions = [
      {
        ruleReference: "Forbidden Patterns #1",
        approvedBy: "Mugiew",
        reason: "Legacy migration requires one controlled overwrite."
      }
    ];
    const validationResult = validateWorkAgainstAgents({
      agentsContent: createAgentsContent(),
      outputs: [
        {
          path: "src/example.ts",
          content: "This implementation uses silent overwrite."
        }
      ],
      approvedExceptions
    });

    const result = await writeApprovedExceptionJournal({
      projectRoot,
      validationResult,
      approvedExceptions,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result?.filePath).toContain("_mugiew-method/journal");
    await expect(fs.readFile(result!.filePath, "utf8")).resolves.toContain(
      "Legacy migration requires one controlled overwrite."
    );
  });
});

function createAgentsContent(): string {
  return [
    "# AGENTS.md",
    "",
    "## Forbidden Patterns",
    "",
    "- silent overwrite",
    "- broad multi-concern tasks",
    "",
    "## Testing Requirements",
    "",
    "- Run tests.",
    ""
  ].join("\n");
}

async function createProjectRoot(): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-constitution-")
  );
  tempRoots.push(projectRoot);
  await fs.mkdir(path.join(projectRoot, "_mugiew-method", "journal"), {
    recursive: true
  });

  return projectRoot;
}
