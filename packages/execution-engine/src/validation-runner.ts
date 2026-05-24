import path from "node:path";

import { type TaskFile, createProjectPaths, safeWriteFile } from "@mugiew-method/core";
import { execaCommand } from "execa";

export const DEFAULT_VALIDATION_TIMEOUT_MS = 120_000;
export const DEFAULT_VALIDATION_OUTPUT_LIMIT_BYTES = 64_000;
export const VALIDATION_COMMAND_TRUST_BOUNDARY =
  "Validation commands are trusted project-local task commands. They are executed only from TaskFile.validationCommands in the project root.";

export type ValidationFailureReason = "exit-code" | "timeout" | "output-limit";

export interface ValidationCommandResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  outputLimitExceeded: boolean;
  failureReason?: ValidationFailureReason;
}

export interface RunTaskValidationOptions {
  projectRoot: string;
  task: TaskFile;
  now?: Date;
  timeoutMs?: number;
  outputLimitBytes?: number;
}

export interface TaskValidationPassed {
  passed: true;
  taskId: string;
  results: ValidationCommandResult[];
  journalPath?: undefined;
}

export interface TaskValidationFailed {
  passed: false;
  taskId: string;
  failedCommand: string;
  results: ValidationCommandResult[];
  journalPath: string;
}

export type TaskValidationResult =
  | TaskValidationPassed
  | TaskValidationFailed;

export async function runTaskValidation(
  options: RunTaskValidationOptions
): Promise<TaskValidationResult> {
  const now = options.now ?? new Date();
  const timeoutMs = options.timeoutMs ?? DEFAULT_VALIDATION_TIMEOUT_MS;
  const outputLimitBytes =
    options.outputLimitBytes ?? DEFAULT_VALIDATION_OUTPUT_LIMIT_BYTES;
  const results: ValidationCommandResult[] = [];

  for (const command of options.task.validationCommands) {
    const result = await execaCommand(command, {
      cwd: options.projectRoot,
      reject: false,
      shell: true,
      timeout: timeoutMs,
      maxBuffer: outputLimitBytes
    });
    const stdout = truncateOutput(result.stdout, outputLimitBytes);
    const stderr = truncateOutput(result.stderr, outputLimitBytes);
    const timedOut = "timedOut" in result && result.timedOut === true;
    const outputLimitExceeded =
      "isMaxBuffer" in result && result.isMaxBuffer === true;
    const stdoutLimitReached = reachedOutputLimit(result.stdout, outputLimitBytes);
    const stderrLimitReached = reachedOutputLimit(result.stderr, outputLimitBytes);
    const failureReason: ValidationFailureReason | undefined =
      result.exitCode === 0 && !timedOut && !outputLimitExceeded
        ? undefined
        : timedOut
          ? "timeout"
          : outputLimitExceeded
            ? "output-limit"
            : "exit-code";
    const commandResult: ValidationCommandResult = {
      command,
      exitCode: result.exitCode ?? 1,
      stdout: stdout.content,
      stderr: stderr.content,
      timedOut,
      stdoutTruncated: stdout.truncated || stdoutLimitReached,
      stderrTruncated: stderr.truncated || stderrLimitReached,
      outputLimitExceeded,
      ...(failureReason === undefined ? {} : { failureReason })
    };
    results.push(commandResult);

    if (commandResult.exitCode !== 0) {
      const journalPath = await writeValidationFailureJournal({
        projectRoot: options.projectRoot,
        task: options.task,
        failedResult: commandResult,
        results,
        now
      });

      return {
        passed: false,
        taskId: options.task.id,
        failedCommand: command,
        results,
        journalPath
      };
    }
  }

  return {
    passed: true,
    taskId: options.task.id,
    results
  };
}

interface WriteValidationFailureJournalOptions {
  projectRoot: string;
  task: TaskFile;
  failedResult: ValidationCommandResult;
  results: ValidationCommandResult[];
  now: Date;
}

async function writeValidationFailureJournal(
  options: WriteValidationFailureJournalOptions
): Promise<string> {
  const paths = createProjectPaths(options.projectRoot);
  const safeTaskId = sanitizeJournalSegment(options.task.id);
  const filePath = path.join(
    paths.journal,
    `${formatJournalTimestamp(options.now)}-validation-failed-${safeTaskId}-${process.hrtime.bigint()}.md`
  );
  const content = [
    "# Validation Failed",
    "",
    `Recorded At: ${options.now.toISOString()}`,
    `Task ID: ${options.task.id}`,
      `Failed Command: ${options.failedResult.command}`,
      `Exit Code: ${options.failedResult.exitCode}`,
      `Failure Reason: ${options.failedResult.failureReason ?? "exit-code"}`,
      `Timed Out: ${options.failedResult.timedOut ? "yes" : "no"}`,
      `Stdout Truncated: ${options.failedResult.stdoutTruncated ? "yes" : "no"}`,
      `Stderr Truncated: ${options.failedResult.stderrTruncated ? "yes" : "no"}`,
      `Output Limit Exceeded: ${options.failedResult.outputLimitExceeded ? "yes" : "no"}`,
      "",
      "## Trust Boundary",
      "",
      VALIDATION_COMMAND_TRUST_BOUNDARY,
      "",
      "## Command Results",
    "",
    ...options.results.flatMap((result) => [
      `### ${result.command}`,
      "",
      `Exit Code: ${result.exitCode}`,
      "",
      "#### Stdout",
      "",
      "```txt",
      result.stdout,
      "```",
      "",
      "#### Stderr",
      "",
      "```txt",
      result.stderr,
      "```",
      ""
    ])
  ].join("\n");

  await safeWriteFile(filePath, content, {
    overwrite: false
  });

  return filePath;
}

function formatJournalTimestamp(date: Date): string {
  return date.toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function truncateOutput(
  output: string,
  limitBytes: number
): { content: string; truncated: boolean } {
  const outputBytes = Buffer.byteLength(output, "utf8");

  if (outputBytes <= limitBytes) {
    return {
      content: output,
      truncated: false
    };
  }

  return {
    content: `${Buffer.from(output, "utf8").subarray(0, limitBytes).toString("utf8")}\n[truncated to ${limitBytes} bytes]`,
    truncated: true
  };
}

function reachedOutputLimit(output: string, limitBytes: number): boolean {
  return output.length > 0 && Buffer.byteLength(output, "utf8") >= limitBytes;
}

function sanitizeJournalSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "task";
}
