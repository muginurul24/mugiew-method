import path from "node:path";

import { createProjectPaths, safeWriteFile } from "@mugiew-method/core";

export type ForceModeDecisionStatus =
  | "not-requested"
  | "unavailable"
  | "confirmation-required"
  | "approved";

export interface ForceModePolicyInput {
  allowed: boolean;
  requested: boolean;
  confirmed: boolean;
  actor?: string;
  reason?: string;
  failedConditions: string[];
}

export interface ForceModeDecision {
  status: ForceModeDecisionStatus;
  failedConditions: string[];
  journalEntry?: ForceModeJournalEntry;
}

export interface ForceModeJournalEntry {
  severity: "high";
  actor: string;
  reason: string;
  failedConditions: string[];
  recordedAt: string;
}

export interface WriteForceModeJournalOptions {
  projectRoot: string;
  entry: ForceModeJournalEntry;
}

export function evaluateForceModePolicy(
  input: ForceModePolicyInput,
  recordedAt = new Date()
): ForceModeDecision {
  if (!input.requested) {
    return {
      status: "not-requested",
      failedConditions: input.failedConditions
    };
  }

  if (!input.allowed) {
    return {
      status: "unavailable",
      failedConditions: input.failedConditions
    };
  }

  if (
    !input.confirmed ||
    input.reason?.trim() === "" ||
    input.reason === undefined ||
    input.actor?.trim() === "" ||
    input.actor === undefined
  ) {
    return {
      status: "confirmation-required",
      failedConditions: input.failedConditions
    };
  }

  return {
    status: "approved",
    failedConditions: input.failedConditions,
    journalEntry: {
      severity: "high",
      actor: input.actor,
      reason: input.reason,
      failedConditions: input.failedConditions,
      recordedAt: recordedAt.toISOString()
    }
  };
}

export async function writeForceModeJournalEntry(
  options: WriteForceModeJournalOptions
): Promise<string> {
  const paths = createProjectPaths(options.projectRoot);
  const filePath = path.join(
    paths.journal,
    `${options.entry.recordedAt.replaceAll(/[:.]/g, "-")}-force-mode.md`
  );

  await safeWriteFile(filePath, renderForceModeJournalEntry(options.entry), {
    overwrite: false
  });

  return filePath;
}

export function renderForceModeJournalEntry(
  entry: ForceModeJournalEntry
): string {
  return [
    "# Force Mode Override",
    "",
    "Severity: high",
    `Actor: ${entry.actor}`,
    `Recorded At: ${entry.recordedAt}`,
    "",
    "## Reason",
    "",
    entry.reason,
    "",
    "## Failed Conditions",
    "",
    ...entry.failedConditions.map((condition) => `- ${condition}`),
    ""
  ].join("\n");
}
