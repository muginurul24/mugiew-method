import fs from "node:fs/promises";
import path from "node:path";

import {
  MissingInstallationError,
  createProjectPaths,
  safeWriteFile
} from "@mugiew-method/core";

export type RuntimeStopStatus = "blocked" | "failed" | "paused" | "complete";

export interface StopRuntimeSafelyOptions {
  projectRoot: string;
  status: RuntimeStopStatus;
  reason: string;
  nextSuggestedAction: string;
  now?: Date;
}

export interface StopRuntimeSafelyResult {
  projectStatePath: string;
  journalPath: string;
  status: RuntimeStopStatus;
}

export async function stopRuntimeSafely(
  options: StopRuntimeSafelyOptions
): Promise<StopRuntimeSafelyResult> {
  const paths = createProjectPaths(options.projectRoot);
  const now = options.now ?? new Date();
  const projectStatePath = path.join(paths.state, "project-state.json");

  await assertInstalled(paths.projectRoot, projectStatePath);

  const projectState = JSON.parse(
    await fs.readFile(projectStatePath, "utf8")
  ) as Record<string, unknown>;
  const nextProjectState = {
    ...projectState,
    updatedAt: now.toISOString(),
    runtime: {
      status: options.status,
      reason: options.reason,
      nextSuggestedAction: options.nextSuggestedAction,
      updatedAt: now.toISOString()
    }
  };

  await safeWriteFile(
    projectStatePath,
    `${JSON.stringify(nextProjectState, null, 2)}\n`,
    { overwrite: true }
  );

  const journalPath = await writeRuntimeStopJournal({
    projectRoot: paths.projectRoot,
    status: options.status,
    reason: options.reason,
    nextSuggestedAction: options.nextSuggestedAction,
    now
  });

  return {
    projectStatePath,
    journalPath,
    status: options.status
  };
}

interface WriteRuntimeStopJournalOptions {
  projectRoot: string;
  status: RuntimeStopStatus;
  reason: string;
  nextSuggestedAction: string;
  now: Date;
}

async function writeRuntimeStopJournal(
  options: WriteRuntimeStopJournalOptions
): Promise<string> {
  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(
    paths.journal,
    `${formatJournalTimestamp(options.now)}-runtime-stopped.md`
  );
  const content = [
    "# Runtime Stopped",
    "",
    `Recorded At: ${options.now.toISOString()}`,
    `Status: ${options.status}`,
    `Reason: ${options.reason}`,
    `Next Suggested Action: ${options.nextSuggestedAction}`,
    ""
  ].join("\n");

  await safeWriteFile(filePath, content, {
    overwrite: false
  });

  return filePath;
}

async function assertInstalled(
  projectRoot: string,
  projectStatePath: string
): Promise<void> {
  try {
    await fs.access(projectStatePath);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new MissingInstallationError({ projectRoot });
    }

    throw error;
  }
}

function formatJournalTimestamp(date: Date): string {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
