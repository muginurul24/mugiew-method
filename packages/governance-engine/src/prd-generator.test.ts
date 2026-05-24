import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { installProject } from "./install-project.js";
import { renderPrdArtifact, writePrdArtifact } from "./prd-generator.js";
import { afterEach, describe, expect, it } from "vitest";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("PRD generator", () => {
  it("renders stable IDs for every required PRD section", () => {
    const content = renderPrdArtifact(createInput());

    for (const id of ["FR-001", "NFR-001", "AC-001", "C-001", "AD-001", "OQ-001", "AS-001"]) {
      expect(content).toContain(id);
    }
  });

  it("renders an assumption index", () => {
    const content = renderPrdArtifact(createInput());

    expect(content).toContain("## Assumption Index");
    expect(content).toContain("- AS-001: CLI-only MVP.");
  });

  it("normalizes implementation-detail wording from functional requirements", () => {
    const content = renderPrdArtifact({
      ...createInput(),
      functionalRequirements: ["Use React for dashboard."]
    });

    expect(content).toContain("FR-001: support React for dashboard.");
  });

  it("renders source discovery artifact references", () => {
    const content = renderPrdArtifact(createInput());

    expect(content).toContain("## Source Discovery Artifacts");
    expect(content).toContain("- _mugiew-method/discovery/answers.md");
  });

  it("writes PRD.md under project PRD directory", async () => {
    const projectRoot = await createInstalledProject();

    const result = await writePrdArtifact({
      projectRoot,
      input: createInput()
    });

    expect(result.filePath).toBe(
      path.join(projectRoot, "_mugiew-method", "prd", "PRD.md")
    );
    await expect(fs.readFile(result.filePath, "utf8")).resolves.toContain(
      "FR-001"
    );
  });
});

function createInput() {
  return {
    title: "Mugiew Method PRD",
    functionalRequirements: ["System can generate PRD artifacts."],
    nonFunctionalRequirements: ["Artifacts are deterministic."],
    acceptanceCriteria: ["Generated PRD includes stable IDs."],
    constraints: ["No hosted service required."],
    architectureDecisions: ["Use local filesystem persistence."],
    openQuestions: ["Exact future adapter model."],
    assumptions: ["CLI-only MVP."],
    sourceArtifacts: ["_mugiew-method/discovery/answers.md"]
  };
}

async function createInstalledProject(): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-prd-")
  );
  tempRoots.push(projectRoot);
  await installProject({
    projectRoot,
    packageVersion: "0.0.0-test",
    now: new Date("2026-05-24T00:00:00.000Z")
  });

  return projectRoot;
}
