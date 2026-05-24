import fs from "node:fs";
import path from "node:path";

import { ProjectRootNotFoundError } from "../errors/project-root-not-found-error.js";

const STRONG_PROJECT_MARKERS = [
  "_mugiew-method",
  "AGENTS.md",
  "pnpm-workspace.yaml",
  ".git"
] as const;

export interface DetectProjectRootOptions {
  startDirectory?: string;
}

export function detectProjectRoot(
  options: DetectProjectRootOptions = {}
): string {
  let currentDirectory = path.resolve(options.startDirectory ?? process.cwd());
  let packageJsonFallback: string | undefined;

  while (true) {
    if (hasAnyMarker(currentDirectory, STRONG_PROJECT_MARKERS)) {
      return currentDirectory;
    }

    if (
      packageJsonFallback === undefined &&
      fs.existsSync(path.join(currentDirectory, "package.json"))
    ) {
      packageJsonFallback = currentDirectory;
    }

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      if (packageJsonFallback !== undefined) {
        return packageJsonFallback;
      }

      throw new ProjectRootNotFoundError(
        path.resolve(options.startDirectory ?? process.cwd())
      );
    }

    currentDirectory = parentDirectory;
  }
}

function hasAnyMarker(
  directory: string,
  markers: readonly string[]
): boolean {
  return markers.some((marker) => fs.existsSync(path.join(directory, marker)));
}
