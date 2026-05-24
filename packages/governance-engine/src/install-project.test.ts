import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { SchemaVersionError } from "@mugiew-method/core";

import { installProject } from "./install-project.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("installProject", () => {
  it("creates Mugiew Method directories, AGENTS.md, and project state", async () => {
    const projectRoot = await createTempRoot();
    const result = await installProject({
      projectRoot,
      packageVersion: "0.0.0-test",
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    const expectedPaths = [
      "_mugiew-method",
      "_mugiew-method/discovery",
      "_mugiew-method/prd",
      "_mugiew-method/tasks",
      "_mugiew-method/journal",
      "_mugiew-method/state",
      "_mugiew-method/rules",
      "AGENTS.md",
      "_mugiew-method/state/project-state.json"
    ].map((relativePath) => path.join(projectRoot, relativePath));

    expect(result).toEqual({
      projectRoot,
      status: "installed",
      detectedPaths: [],
      createdPaths: expectedPaths
    });

    for (const expectedPath of expectedPaths.slice(0, 7)) {
      expect((await fs.stat(expectedPath)).isDirectory()).toBe(true);
    }

    await expect(
      fs.readFile(path.join(projectRoot, "AGENTS.md"), "utf8")
    ).resolves.toContain("No implementation before clarity.");

    const projectState = JSON.parse(
      await fs.readFile(
        path.join(projectRoot, "_mugiew-method", "state", "project-state.json"),
        "utf8"
      )
    ) as Record<string, unknown>;

    expect(projectState).toEqual({
      schemaVersion: 1,
      updatedAt: "2026-05-24T00:00:00.000Z",
      installStatus: "installed",
      packageVersion: "0.0.0-test"
    });
  });

  it("reports existing installation without overwriting AGENTS.md", async () => {
    const projectRoot = await createTempRoot();
    await installProject({
      projectRoot,
      packageVersion: "0.0.0-test",
      now: new Date("2026-05-24T00:00:00.000Z")
    });
    const agentsPath = path.join(projectRoot, "AGENTS.md");
    await fs.writeFile(agentsPath, "custom constitution\n", "utf8");

    const result = await installProject({
      projectRoot,
      packageVersion: "0.0.0-test",
      now: new Date("2026-05-25T00:00:00.000Z")
    });

    expect(result).toEqual({
      projectRoot,
      status: "already-installed",
      createdPaths: [],
      detectedPaths: [
        path.join(projectRoot, "_mugiew-method"),
        agentsPath,
        path.join(projectRoot, "_mugiew-method", "state", "project-state.json")
      ]
    });
    await expect(fs.readFile(agentsPath, "utf8")).resolves.toBe(
      "custom constitution\n"
    );
  });

  it("reports partial installation when only _mugiew-method exists", async () => {
    const projectRoot = await createTempRoot();
    const mugiewRoot = path.join(projectRoot, "_mugiew-method");
    await fs.mkdir(mugiewRoot);

    const result = await installProject({
      projectRoot,
      packageVersion: "0.0.0-test"
    });

    expect(result).toEqual({
      projectRoot,
      status: "partial-installation",
      createdPaths: [],
      detectedPaths: [mugiewRoot]
    });
    await expect(fs.stat(path.join(projectRoot, "AGENTS.md"))).rejects.toThrow();
  });

  it("reports partial installation when only AGENTS.md exists", async () => {
    const projectRoot = await createTempRoot();
    const agentsPath = path.join(projectRoot, "AGENTS.md");
    await fs.writeFile(agentsPath, "custom\n", "utf8");

    const result = await installProject({
      projectRoot,
      packageVersion: "0.0.0-test"
    });

    expect(result).toEqual({
      projectRoot,
      status: "partial-installation",
      createdPaths: [],
      detectedPaths: [agentsPath]
    });
    await expect(fs.readFile(agentsPath, "utf8")).resolves.toBe("custom\n");
  });

  it("throws SchemaVersionError for unsupported existing project state", async () => {
    const projectRoot = await createTempRoot();
    const stateDirectory = path.join(projectRoot, "_mugiew-method", "state");
    await fs.mkdir(stateDirectory, { recursive: true });
    await fs.writeFile(
      path.join(stateDirectory, "project-state.json"),
      JSON.stringify({
        schemaVersion: 999,
        updatedAt: "2026-05-24T00:00:00.000Z",
        installStatus: "installed",
        packageVersion: "0.0.0-test"
      }),
      "utf8"
    );

    await expect(
      installProject({
        projectRoot,
        packageVersion: "0.0.0-test"
      })
    ).rejects.toBeInstanceOf(SchemaVersionError);
  });

  it("reports partial installation when project state exists without AGENTS.md", async () => {
    const projectRoot = await createTempRoot();
    const stateDirectory = path.join(projectRoot, "_mugiew-method", "state");
    const projectStatePath = path.join(stateDirectory, "project-state.json");
    await fs.mkdir(stateDirectory, { recursive: true });
    await fs.writeFile(
      projectStatePath,
      JSON.stringify({
        schemaVersion: 1,
        updatedAt: "2026-05-24T00:00:00.000Z",
        installStatus: "installed",
        packageVersion: "0.0.0-test"
      }),
      "utf8"
    );

    await expect(
      installProject({
        projectRoot,
        packageVersion: "0.0.0-test"
      })
    ).resolves.toEqual({
      projectRoot,
      status: "partial-installation",
      createdPaths: [],
      detectedPaths: [
        path.join(projectRoot, "_mugiew-method"),
        projectStatePath
      ]
    });
  });
});

async function createTempRoot(): Promise<string> {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-install-")
  );
  tempRoots.push(tempRoot);

  return tempRoot;
}
