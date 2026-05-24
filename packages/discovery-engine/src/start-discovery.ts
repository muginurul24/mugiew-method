import fs from "node:fs/promises";
import path from "node:path";

import {
  MissingInstallationError,
  createProjectPaths,
  parseAmbiguityReport,
  safeWriteFile
} from "@mugiew-method/core";

export type StartDiscoveryStatus = "created" | "resumed";
export type DiscoveryRuntimePhase = "bootstrap-primitives";

export interface StartDiscoveryOptions {
  projectRoot: string;
  now?: Date;
}

export interface StartDiscoveryResult {
  projectRoot: string;
  status: StartDiscoveryStatus;
  phase: DiscoveryRuntimePhase;
  adaptiveInterrogation: "pending";
  scopeNote: string;
  createdPaths: string[];
  existingPaths: string[];
}

export async function startDiscovery(
  options: StartDiscoveryOptions
): Promise<StartDiscoveryResult> {
  const paths = createProjectPaths(options.projectRoot);
  await assertInstalled(paths.projectRoot, paths.mugiewRoot, paths.agentsFile);

  await fs.mkdir(paths.discovery, { recursive: true });
  await fs.mkdir(paths.state, { recursive: true });

  const artifacts = [
    {
      path: path.join(paths.discovery, "answers.md"),
      content: "# Answers\n\n"
    },
    {
      path: path.join(paths.discovery, "ambiguities.md"),
      content: "# Ambiguities\n\n"
    },
    {
      path: path.join(paths.discovery, "assumptions.md"),
      content: "# Assumptions\n\n"
    },
    {
      path: path.join(paths.discovery, "confidence-report.md"),
      content: [
        "# Confidence Report",
        "",
        "Project Understanding Confidence: 0%",
        "Remaining Blocking Ambiguities: 0",
        "Execution Readiness: DISCOVERY_IN_PROGRESS",
        ""
      ].join("\n")
    },
    {
      path: path.join(paths.state, "ambiguity-report.json"),
      content: `${JSON.stringify(
        {
          schemaVersion: 1,
          updatedAt: (options.now ?? new Date()).toISOString(),
          ambiguities: []
        },
        null,
        2
      )}\n`
    }
  ];

  const createdPaths: string[] = [];
  const existingPaths: string[] = [];

  for (const artifact of artifacts) {
    if (await pathExists(artifact.path)) {
      if (artifact.path.endsWith("ambiguity-report.json")) {
        parseAmbiguityReport(
          JSON.parse(await fs.readFile(artifact.path, "utf8"))
        );
      }

      existingPaths.push(artifact.path);
      continue;
    }

    await safeWriteFile(artifact.path, artifact.content, {
      overwrite: false
    });
    createdPaths.push(artifact.path);
  }

  return {
    projectRoot: paths.projectRoot,
    status: createdPaths.length > 0 ? "created" : "resumed",
    phase: "bootstrap-primitives",
    adaptiveInterrogation: "pending",
    scopeNote:
      "Current /create-prd bootstraps discovery artifacts and state. Full adaptive conversational interrogation is deferred.",
    createdPaths,
    existingPaths
  };
}

async function assertInstalled(
  projectRoot: string,
  mugiewRoot: string,
  agentsFile: string
): Promise<void> {
  if (!(await pathExists(mugiewRoot)) || !(await pathExists(agentsFile))) {
    throw new MissingInstallationError({ projectRoot });
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return false;
    }

    throw error;
  }
}
