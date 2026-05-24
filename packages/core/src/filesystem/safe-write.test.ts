import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { UnsafeWriteError } from "../errors/unsafe-write-error.js";
import { safeWriteFile } from "./safe-write.js";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      fs.rm(tempRoot, { force: true, recursive: true })
    )
  );
});

describe("safeWriteFile", () => {
  it("denies overwriting existing files without explicit overwrite", async () => {
    const tempRoot = await createTempRoot();
    const targetPath = path.join(tempRoot, "AGENTS.md");
    await fs.writeFile(targetPath, "original\n", "utf8");

    await expect(safeWriteFile(targetPath, "new\n")).rejects.toBeInstanceOf(
      UnsafeWriteError
    );
    await expect(fs.readFile(targetPath, "utf8")).resolves.toBe("original\n");
  });

  it("overwrites existing files only when overwrite is explicit", async () => {
    const tempRoot = await createTempRoot();
    const targetPath = path.join(tempRoot, "AGENTS.md");
    await fs.writeFile(targetPath, "original\n", "utf8");

    const result = await safeWriteFile(targetPath, "new\n", {
      overwrite: true
    });

    expect(result).toEqual({
      filePath: targetPath,
      overwritten: true
    });
    await expect(fs.readFile(targetPath, "utf8")).resolves.toBe("new\n");
  });

  it("creates parent directories and writes complete fresh files", async () => {
    const tempRoot = await createTempRoot();
    const targetPath = path.join(
      tempRoot,
      "_mugiew-method",
      "state",
      "project-state.json"
    );

    const result = await safeWriteFile(targetPath, "{\"schemaVersion\":1}\n");

    expect(result).toEqual({
      filePath: targetPath,
      overwritten: false
    });
    await expect(fs.readFile(targetPath, "utf8")).resolves.toBe(
      "{\"schemaVersion\":1}\n"
    );
  });

  it("removes temporary write artifacts after success", async () => {
    const tempRoot = await createTempRoot();
    const targetPath = path.join(tempRoot, "nested", "artifact.md");

    await safeWriteFile(targetPath, "content\n");

    const siblingFiles = await fs.readdir(path.dirname(targetPath));
    expect(siblingFiles).toEqual(["artifact.md"]);
  });
});

async function createTempRoot(): Promise<string> {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "mugiew-method-safe-write-")
  );
  tempRoots.push(tempRoot);

  return tempRoot;
}
