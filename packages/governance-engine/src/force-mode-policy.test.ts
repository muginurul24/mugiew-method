import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  evaluateForceModePolicy,
  writeForceModeJournalEntry
} from "./force-mode-policy.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("force mode policy", () => {
  it("requires explicit confirmation before force mode proceeds", () => {
    expect(
      evaluateForceModePolicy({
        allowed: true,
        requested: true,
        confirmed: false,
        failedConditions: ["confidenceScore < 90 (80)"]
      }).status
    ).toBe("confirmation-required");
  });

  it("approves confirmed force mode and writes high severity journal", async () => {
    const projectRoot = await createTempRoot();
    const decision = evaluateForceModePolicy(
      {
        allowed: true,
        requested: true,
        confirmed: true,
        actor: "Mugiew",
        reason: "Explicit prototype override.",
        failedConditions: ["confidenceScore < 90 (80)"]
      },
      new Date("2026-05-24T00:00:00.000Z")
    );

    expect(decision.status).toBe("approved");
    const filePath = await writeForceModeJournalEntry({
      projectRoot,
      entry: decision.journalEntry!
    });

    await expect(fs.readFile(filePath, "utf8")).resolves.toContain(
      "Severity: high"
    );
  });

  it("marks force mode unavailable when policy disallows it", () => {
    expect(
      evaluateForceModePolicy({
        allowed: false,
        requested: true,
        confirmed: true,
        actor: "Mugiew",
        reason: "Override requested.",
        failedConditions: ["blockingAmbiguityCount > 0 (1)"]
      }).status
    ).toBe("unavailable");
  });

  it("requires non-empty actor and reason", () => {
    expect(
      evaluateForceModePolicy({
        allowed: true,
        requested: true,
        confirmed: true,
        actor: "",
        reason: " ",
        failedConditions: ["confidenceScore < 90 (80)"]
      }).status
    ).toBe("confirmation-required");
  });
});

async function createTempRoot(): Promise<string> {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-force-")
  );
  tempRoots.push(tempRoot);

  return tempRoot;
}
