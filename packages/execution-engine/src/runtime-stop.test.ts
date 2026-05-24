import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { stopRuntimeSafely, type RuntimeStopStatus } from "./runtime-stop.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("stopRuntimeSafely", () => {
  it.each(["blocked", "failed", "paused", "complete"] as RuntimeStopStatus[])(
    "writes runtime status %s to Project State",
    async (status) => {
      const projectRoot = await createProjectRoot();

      await stopRuntimeSafely({
        projectRoot,
        status,
        reason: "Runtime reached stop condition.",
        nextSuggestedAction: "Review Journal.",
        now: new Date("2026-05-24T00:00:00.000Z")
      });

      const projectState = JSON.parse(
        await fs.readFile(
          path.join(projectRoot, "_mugiew-method", "state", "project-state.json"),
          "utf8"
        )
      ) as Record<string, { status?: string }>;

      expect(projectState.runtime?.status).toBe(status);
    }
  );

  it("writes stop reason and next action to Journal", async () => {
    const projectRoot = await createProjectRoot();
    const result = await stopRuntimeSafely({
      projectRoot,
      status: "blocked",
      reason: "No unblocked task available.",
      nextSuggestedAction: "Resolve dependency graph blockers.",
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    await expect(fs.readFile(result.journalPath, "utf8")).resolves.toContain(
      "Resolve dependency graph blockers."
    );
  });

  it("does not invent approval records", async () => {
    const projectRoot = await createProjectRoot();
    await stopRuntimeSafely({
      projectRoot,
      status: "paused",
      reason: "User paused runtime.",
      nextSuggestedAction: "Resume when ready.",
      now: new Date("2026-05-24T00:00:00.000Z")
    });

    await expect(
      fs.stat(
        path.join(projectRoot, "_mugiew-method", "state", "prd-approval.json")
      )
    ).rejects.toThrow();
  });
});

async function createProjectRoot(): Promise<string> {
  const projectRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-runtime-stop-")
  );
  tempRoots.push(projectRoot);
  const stateDirectory = path.join(projectRoot, "_mugiew-method", "state");
  const journalDirectory = path.join(projectRoot, "_mugiew-method", "journal");

  await fs.mkdir(stateDirectory, { recursive: true });
  await fs.mkdir(journalDirectory, { recursive: true });
  await fs.writeFile(
    path.join(stateDirectory, "project-state.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      updatedAt: "2026-05-24T00:00:00.000Z",
      installStatus: "installed",
      packageVersion: "0.0.0-test"
    })}\n`,
    "utf8"
  );

  return projectRoot;
}
