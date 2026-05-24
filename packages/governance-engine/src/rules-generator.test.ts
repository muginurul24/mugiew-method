import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  RULE_TEMPLATE_FILES,
  renderRuleTemplates,
  writeRuleTemplates
} from "./rules-generator.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("rules generator", () => {
  it("writes all required rule files", async () => {
    const projectRoot = await createTempRoot();

    const result = await writeRuleTemplates({ projectRoot });

    expect(result.writtenPaths).toEqual(
      RULE_TEMPLATE_FILES.map((fileName) =>
        path.join(projectRoot, "_mugiew-method", "rules", fileName)
      )
    );
  });

  it("renders Uncodixfy-aligned UI anti-pattern avoidance", () => {
    const templates = renderRuleTemplates();

    expect(templates["ui-rules.md"]).toContain("Uncodixfy-aligned");
    expect(templates["ui-rules.md"]).toContain("excessive glassmorphism");
    expect(templates["ui-rules.md"]).toContain("fake-modern interfaces");
  });

  it("requires expected UI states where UI exists", () => {
    const templates = renderRuleTemplates();

    for (const state of [
      "loading",
      "empty",
      "error",
      "disabled",
      "responsive",
      "accessibility"
    ]) {
      expect(templates["ui-rules.md"]).toContain(state);
    }
  });
});

async function createTempRoot(): Promise<string> {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-rules-")
  );
  tempRoots.push(tempRoot);

  return tempRoot;
}
