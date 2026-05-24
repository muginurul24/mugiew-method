import { Command } from "@oclif/core";
import {
  GateDeniedError,
  MissingInstallationError
} from "@mugiew-method/core";
import { yoloRunProject } from "@mugiew-method/execution-engine";

export default class YoloRunCommand extends Command {
  static description = "Start Mugiew Method YOLO-RUN runtime when gates pass.";

  async run(): Promise<void> {
    try {
      const result = await yoloRunProject({
        projectRoot: process.cwd()
      });

      if (!result.allowed) {
        throw new GateDeniedError({
          message: [
            result.status,
            ...result.failedConditions.map((condition) => `- ${condition}`),
            `Journal: ${result.journalPath}`
          ].join("\n"),
          failedConditions: result.failedConditions
        });
      }

      this.log(result.status);
    } catch (error) {
      if (error instanceof GateDeniedError) {
        this.error(error.message, {
          exit: error.exitCode
        });
      }

      if (error instanceof MissingInstallationError) {
        this.error(`${error.message}\n${error.suggestedAction}`, {
          exit: 2
        });
      }

      throw error;
    }
  }
}
