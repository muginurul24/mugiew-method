import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { Command, Flags } from "@oclif/core";
import { MissingInstallationError } from "@mugiew-method/core";
import { reviewProject } from "@mugiew-method/governance-engine";

const execFileAsync = promisify(execFile);

export default class ReviewProjectCommand extends Command {
  static description = "Review Mugiew Method project governance state.";

  static flags = {
    path: Flags.string({
      char: "p",
      description: "File path to scan for AGENTS.md violations.",
      multiple: true
    }),
    changed: Flags.boolean({
      description: "Scan files changed in git working tree."
    })
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ReviewProjectCommand);

    try {
      const changedPaths = flags.changed ? await collectChangedPaths() : [];
      const result = await reviewProject({
        projectRoot: process.cwd(),
        scanPaths: [...new Set([...(flags.path ?? []), ...changedPaths])]
      });

      this.log(`Project review written: ${result.journalPath}`);
      this.log(`Findings: ${result.findings.length}`);
      this.log(`Scanned Files: ${result.scannedFileCount}`);
      this.log(`Skipped Files: ${result.skippedFileCount}`);
      this.log(`Scan Status: ${result.scanStatus}`);
      this.log(
        `Finding Categories: ${Object.entries(result.findingCountsByCategory)
          .map(([category, count]) => `${category}=${count}`)
          .join(", ")}`
      );
    } catch (error) {
      if (error instanceof MissingInstallationError) {
        this.error(`${error.message}\n${error.suggestedAction}`, {
          exit: 2
        });
      }

      throw error;
    }
  }
}

async function collectChangedPaths(): Promise<string[]> {
  let stdout: string;

  try {
    const tracked = await execFileAsync("git", ["diff", "--name-only", "HEAD"]);
    const untracked = await execFileAsync("git", [
      "ls-files",
      "--others",
      "--exclude-standard"
    ]);
    stdout = `${tracked.stdout}\n${untracked.stdout}`;
  } catch {
    return [];
  }

  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
