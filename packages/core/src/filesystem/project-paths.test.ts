import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  AGENTS_FILE_NAME,
  MUGIEW_DIRECTORY_NAME,
  MUGIEW_MANAGED_DIRECTORY_NAMES,
  createProjectPaths,
  resolveProjectPaths
} from "./project-paths.js";
import { detectProjectRoot } from "./workspace-detector.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("project path contracts", () => {
  it("creates canonical paths from an explicit project root", async () => {
    const projectRoot = await createTempProject();

    const paths = createProjectPaths(projectRoot);

    expect(paths.projectRoot).toBe(projectRoot);
    expect(paths.agentsFile).toBe(path.join(projectRoot, AGENTS_FILE_NAME));
    expect(paths.mugiewRoot).toBe(path.join(projectRoot, MUGIEW_DIRECTORY_NAME));

    for (const directoryName of MUGIEW_MANAGED_DIRECTORY_NAMES) {
      expect(paths[directoryName]).toBe(
        path.join(projectRoot, MUGIEW_DIRECTORY_NAME, directoryName)
      );
    }
  });

  it("resolves paths from nested working directories relative to detected project root", async () => {
    const projectRoot = await createTempProject();
    const nestedDirectory = path.join(projectRoot, "src", "feature", "deep");
    await fs.mkdir(nestedDirectory, { recursive: true });

    const detectedRoot = detectProjectRoot({ startDirectory: nestedDirectory });
    const paths = resolveProjectPaths({ startDirectory: nestedDirectory });

    expect(detectedRoot).toBe(projectRoot);
    expect(paths.projectRoot).toBe(projectRoot);
    expect(paths.agentsFile).toBe(path.join(projectRoot, "AGENTS.md"));
    expect(paths.discovery).toBe(
      path.join(projectRoot, "_mugiew-method", "discovery")
    );
    expect(paths.prd).toBe(path.join(projectRoot, "_mugiew-method", "prd"));
    expect(paths.tasks).toBe(path.join(projectRoot, "_mugiew-method", "tasks"));
    expect(paths.journal).toBe(
      path.join(projectRoot, "_mugiew-method", "journal")
    );
    expect(paths.state).toBe(path.join(projectRoot, "_mugiew-method", "state"));
    expect(paths.rules).toBe(path.join(projectRoot, "_mugiew-method", "rules"));
  });

  it("prefers workspace root markers over nested package.json files", async () => {
    const projectRoot = await createTempProject();
    await fs.writeFile(path.join(projectRoot, "pnpm-workspace.yaml"), "\n");

    const nestedPackageDirectory = path.join(projectRoot, "packages", "core");
    const nestedWorkingDirectory = path.join(nestedPackageDirectory, "src");
    await fs.mkdir(nestedWorkingDirectory, { recursive: true });
    await fs.writeFile(
      path.join(nestedPackageDirectory, "package.json"),
      "{}\n",
      "utf8"
    );

    expect(detectProjectRoot({ startDirectory: nestedWorkingDirectory })).toBe(
      projectRoot
    );
  });
});

async function createTempProject(): Promise<string> {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-paths-")
  );
  tempRoots.push(tempRoot);

  await fs.writeFile(path.join(tempRoot, "package.json"), "{}\n", "utf8");

  return tempRoot;
}
