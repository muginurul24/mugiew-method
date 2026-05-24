import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const workspacePackages = [
  "packages/core",
  "packages/discovery-engine",
  "packages/governance-engine",
  "packages/execution-engine",
  "packages/cli",
  "."
];

const tempRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "mugiew-method-pack-smoke-")
);
const tarballDir = path.join(tempRoot, "tarballs");
const smokeProject = path.join(tempRoot, "project");
fs.mkdirSync(tarballDir);
fs.mkdirSync(smokeProject);

try {
  run("pnpm", ["build"], repoRoot);

  const tarballs = new Map();
  for (const packagePath of workspacePackages) {
    const packageRoot = path.join(repoRoot, packagePath);
    const result = parsePackJson(
      run(
        "pnpm",
        ["pack", "--json", "--pack-destination", tarballDir],
        packageRoot
      )
    );
    tarballs.set(
      result.name,
      path.isAbsolute(result.filename)
        ? result.filename
        : path.join(tarballDir, result.filename)
    );
  }

  writeSmokePackage(smokeProject, tarballs);
  run("pnpm", ["install", "--offline"], smokeProject);
  run(binaryPath(smokeProject, "mugiew-method"), ["install"], smokeProject);

  assertExists(path.join(smokeProject, "AGENTS.md"));
  assertExists(path.join(smokeProject, "_mugiew-method"));
  assertExists(path.join(smokeProject, "_mugiew-method", "state"));

  console.log(`Packaging smoke passed in ${smokeProject}`);
} catch (error) {
  console.error(`Packaging smoke failed. Temp directory kept at ${tempRoot}`);
  throw error;
}

function writeSmokePackage(projectRoot, tarballs) {
  const rootTarball = tarballs.get("mugiew-method");
  if (!rootTarball) {
    throw new Error("Missing root mugiew-method tarball");
  }

  const overrides = {};
  for (const [name, tarballPath] of tarballs) {
    overrides[name] = `file:${tarballPath}`;
  }

  fs.writeFileSync(
    path.join(projectRoot, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        dependencies: {
          "mugiew-method": `file:${rootTarball}`
        },
        pnpm: {
          overrides
        }
      },
      null,
      2
    )}\n`
  );
}

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  });
}

function parsePackJson(output) {
  const start = output.indexOf("{");
  if (start === -1) {
    throw new Error(`pnpm pack did not return JSON output: ${output}`);
  }

  return JSON.parse(output.slice(start));
}

function binaryPath(projectRoot, name) {
  if (process.platform === "win32") {
    return path.join(projectRoot, "node_modules", ".bin", `${name}.cmd`);
  }

  return path.join(projectRoot, "node_modules", ".bin", name);
}

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected path to exist: ${filePath}`);
  }
}
