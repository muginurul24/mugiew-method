import { Command } from "@oclif/core";
import { MissingInstallationError } from "@mugiew-method/core";
import {
  type StartDiscoveryResult,
  startDiscovery
} from "@mugiew-method/discovery-engine";

export default class CreatePrdCommand extends Command {
  static description = "Start or resume Mugiew Method discovery.";

  async run(): Promise<void> {
    try {
      const result = await startDiscovery({
        projectRoot: process.cwd()
      });

      for (const line of formatCreatePrdResult(result)) {
        this.log(line);
      }
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

export function formatCreatePrdResult(result: StartDiscoveryResult): string[] {
  const lines = [
    `Discovery ${result.status} in ${result.projectRoot}`,
    `Discovery Phase: ${result.phase}`,
    `Adaptive Interrogation: ${result.adaptiveInterrogation}`,
    result.scopeNote
  ];

  if (result.createdPaths.length > 0) {
    lines.push("Created:");

    for (const createdPath of result.createdPaths) {
      lines.push(`- ${createdPath}`);
    }
  }

  if (result.existingPaths.length > 0) {
    lines.push("Existing:");

    for (const existingPath of result.existingPaths) {
      lines.push(`- ${existingPath}`);
    }
  }

  return lines;
}
