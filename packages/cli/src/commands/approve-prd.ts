import { Command } from "@oclif/core";

import { approvePrdProject } from "@mugiew-method/governance-engine";

export default class ApprovePrdCommand extends Command {
  static description = "Approve Mugiew Method PRD when gates pass.";

  async run(): Promise<void> {
    const result = await approvePrdProject({
      projectRoot: process.cwd()
    });

    if (!result.approved) {
      this.error(`PRD approval denied: ${result.failedConditions.join(", ")}`, {
        exit: 2
      });
    }

    this.log(`PRD approved: ${result.filePath}`);
  }
}
