import { Command } from "@oclif/core";
import { installProject } from "@mugiew-method/governance-engine";

import packageJson from "../../package.json" with { type: "json" };

export default class InstallCommand extends Command {
  static description = "Install Mugiew Method project governance files.";

  async run(): Promise<void> {
    const result = await installProject({
      projectRoot: process.cwd(),
      packageVersion: packageJson.version
    });

    if (result.status !== "installed") {
      this.log(`Mugiew Method installation detected: ${result.status}`);
      this.log("No files changed.");

      if (result.detectedPaths.length > 0) {
        this.log("Detected:");

        for (const detectedPath of result.detectedPaths) {
          this.log(`- ${detectedPath}`);
        }
      }

      return;
    }

    this.log(`Installed Mugiew Method in ${result.projectRoot}`);
    this.log("Created:");

    for (const createdPath of result.createdPaths) {
      this.log(`- ${createdPath}`);
    }
  }
}
