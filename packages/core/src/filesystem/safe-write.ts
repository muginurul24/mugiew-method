import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { UnsafeWriteError } from "../errors/unsafe-write-error.js";

export interface SafeWriteFileOptions {
  overwrite?: boolean;
  createParentDirectories?: boolean;
}

export interface SafeWriteFileResult {
  filePath: string;
  overwritten: boolean;
}

export async function safeWriteFile(
  filePath: string,
  content: string | Uint8Array,
  options: SafeWriteFileOptions = {}
): Promise<SafeWriteFileResult> {
  const resolvedFilePath = path.resolve(filePath);
  const parentDirectory = path.dirname(resolvedFilePath);
  const overwrite = options.overwrite ?? false;
  const createParentDirectories = options.createParentDirectories ?? true;

  if (createParentDirectories) {
    await fs.mkdir(parentDirectory, { recursive: true });
  }

  const existingFile = await pathExists(resolvedFilePath);

  if (existingFile && !overwrite) {
    throw new UnsafeWriteError({ targetPath: resolvedFilePath });
  }

  const temporaryFilePath = path.join(
    parentDirectory,
    `.mugiew-safe-write-${process.pid}-${randomUUID()}.tmp`
  );

  try {
    await fs.writeFile(temporaryFilePath, content);

    if (overwrite) {
      await fs.rename(temporaryFilePath, resolvedFilePath);
    } else {
      await fs.link(temporaryFilePath, resolvedFilePath);
      await fs.unlink(temporaryFilePath);
    }
  } catch (error) {
    await removeTemporaryFileIfPresent(temporaryFilePath);

    if (isFileExistsError(error)) {
      throw new UnsafeWriteError({ targetPath: resolvedFilePath });
    }

    throw error;
  }

  return {
    filePath: resolvedFilePath,
    overwritten: existingFile
  };
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if (isNotFoundError(error)) {
      return false;
    }

    throw error;
  }
}

async function removeTemporaryFileIfPresent(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // Cleanup must not mask the write failure that triggered it.
  }
}

function isNotFoundError(error: unknown): boolean {
  return isNodeError(error) && error.code === "ENOENT";
}

function isFileExistsError(error: unknown): boolean {
  return isNodeError(error) && error.code === "EEXIST";
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
