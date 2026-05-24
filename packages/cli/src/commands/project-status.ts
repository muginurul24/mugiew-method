import { Command, Flags } from "@oclif/core";
import { MissingInstallationError } from "@mugiew-method/core";
import {
  getProjectStatus,
  renderProjectStatusText
} from "@mugiew-method/governance-engine";

export default class ProjectStatusCommand extends Command {
  static description = "Show Mugiew Method project status.";

  static flags = {
    json: Flags.boolean({
      description: "Output machine-readable JSON."
    })
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ProjectStatusCommand);

    try {
      const status = await getProjectStatus({
        projectRoot: process.cwd()
      });

      if (flags.json) {
        this.log(JSON.stringify(status, null, 2));
        return;
      }

      this.log(renderProjectStatusText(status));
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
