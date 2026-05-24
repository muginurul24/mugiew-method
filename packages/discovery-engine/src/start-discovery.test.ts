import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { installProject } from "@mugiew-method/governance-engine";
import { MissingInstallationError } from "@mugiew-method/core";
import { afterEach, describe, expect, it } from "vitest";

import { startDiscovery } from "./start-discovery.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("startDiscovery", () => {
  it("creates discovery state in an installed project", async () => {
    const projectRoot = await createInstalledProject();

    const result = await startDiscovery({
      projectRoot,
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    expect(result.status).toBe("created");
    expect(result).toMatchObject({
      phase: "bootstrap-primitives",
      adaptiveInterrogation: "pending"
    });
    expect(result.createdPaths).toEqual([
      path.join(projectRoot, "_mugiew-method", "discovery", "answers.md"),
      path.join(projectRoot, "_mugiew-method", "discovery", "ambiguities.md"),
      path.join(projectRoot, "_mugiew-method", "discovery", "assumptions.md"),
      path.join(
        projectRoot,
        "_mugiew-method",
        "discovery",
        "confidence-report.md"
      ),
      path.join(projectRoot, "_mugiew-method", "state", "ambiguity-report.json")
    ]);

    await expect(
      fs.readFile(
        path.join(projectRoot, "_mugiew-method", "discovery", "answers.md"),
        "utf8"
      )
    ).resolves.toBe("# Answers\n\n");
  });

  it("resumes discovery without overwriting existing markdown", async () => {
    const projectRoot = await createInstalledProject();
    await startDiscovery({ projectRoot });
    const answersPath = path.join(
      projectRoot,
      "_mugiew-method",
      "discovery",
      "answers.md"
    );
    await fs.writeFile(answersPath, "# Answers\n\nCustom answer\n", "utf8");

    const result = await startDiscovery({ projectRoot });

    expect(result.status).toBe("resumed");
    expect(result.createdPaths).toEqual([]);
    await expect(fs.readFile(answersPath, "utf8")).resolves.toBe(
      "# Answers\n\nCustom answer\n"
    );
  });

  it("returns recoverable missing installation error", async () => {
    const projectRoot = await createTempRoot();

    await expect(startDiscovery({ projectRoot })).rejects.toMatchObject({
      name: "MissingInstallationError",
      suggestedAction: "Run `mugiew-method install` first."
    } satisfies Partial<MissingInstallationError>);
  });

  it("does not create PRD approval state", async () => {
    const projectRoot = await createInstalledProject();

    await startDiscovery({ projectRoot });

    await expect(
      fs.stat(path.join(projectRoot, "_mugiew-method", "prd", "approved.json"))
    ).rejects.toThrow();
  });
});

async function createInstalledProject(): Promise<string> {
  const projectRoot = await createTempRoot();
  await installProject({
    projectRoot,
    packageVersion: "0.0.0-test",
    now: new Date("2026-05-24T00:00:00.000Z")
  });

  return projectRoot;
}

async function createTempRoot(): Promise<string> {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-discovery-")
  );
  tempRoots.push(tempRoot);

  return tempRoot;
}
