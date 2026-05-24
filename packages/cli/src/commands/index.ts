import { Command } from "@oclif/core";

import ApprovePrdCommand from "./approve-prd.js";
import CreatePrdCommand from "./create-prd.js";
import InstallCommand from "./install.js";
import ProjectStatusCommand from "./project-status.js";
import ReviewProjectCommand from "./review-project.js";
import YoloRunCommand from "./yolo-run.js";

export default class IndexCommand extends Command {
  static description = "Show Mugiew Method CLI status.";

  async run(): Promise<void> {
    this.log("Mugiew Method CLI foundation ready.");
  }
}

export const commands = {
  "approve-prd": ApprovePrdCommand,
  "create-prd": CreatePrdCommand,
  index: IndexCommand,
  install: InstallCommand,
  "project-status": ProjectStatusCommand,
  "review-project": ReviewProjectCommand,
  "yolo-run": YoloRunCommand
};
