import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { installProject } from "./install-project.js";
import {
  SPECIFICATION_ARTIFACTS,
  renderSpecificationArtifact,
  writeSpecificationArtifacts
} from "./specification-generator.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("specification generator", () => {
  it("writes all required specification artifact files", async () => {
    const projectRoot = await createInstalledProject();
    await fs.writeFile(
      path.join(projectRoot, "_mugiew-method", "prd", "PRD.md"),
      "# PRD\n",
      "utf8"
    );

    const result = await writeSpecificationArtifacts({
      projectRoot,
      artifacts: [
        {
          kind: "architecture",
          applicability: "applicable",
          prdReferences: ["FR-001"],
          content: ["Use local filesystem persistence."]
        }
      ]
    });

    expect(result.writtenPaths).toEqual(
      SPECIFICATION_ARTIFACTS.map((artifact) =>
        path.join(projectRoot, "_mugiew-method", "prd", artifact.fileName)
      )
    );
  });

  it("requires PRD.md before writing supporting specifications", async () => {
    const projectRoot = await createInstalledProject();

    await expect(
      writeSpecificationArtifacts({
        projectRoot,
        artifacts: []
      })
    ).rejects.toThrow();
  });

  it("renders PRD ID references for applicable artifacts", () => {
    const content = renderSpecificationArtifact({
      kind: "execution-plan",
      applicability: "applicable",
      prdReferences: ["FR-001", "AC-001"],
      content: ["Generate tasks after approval."]
    });

    expect(content).toContain("- FR-001");
    expect(content).toContain("- AC-001");
  });

  it("explains why non-applicable artifacts do not apply", () => {
    const content = renderSpecificationArtifact({
      kind: "database-schema",
      applicability: "not-applicable",
      prdReferences: ["NFR-001"],
      notApplicableReason: "MVP has no database."
    });

    expect(content).toContain("Applicability: not-applicable");
    expect(content).toContain("Not applicable: MVP has no database.");
  });
});

async function createInstalledProject(): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-specs-")
  );
  tempRoots.push(projectRoot);
  await installProject({
    projectRoot,
    packageVersion: "0.0.0-test",
    now: new Date("2026-05-24T00:00:00.000Z")
  });

  return projectRoot;
}
