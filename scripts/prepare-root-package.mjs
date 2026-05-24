import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const vendorRoot = path.join(repoRoot, "vendor", "node_modules");
const internalPackages = [
  ["cli", "packages/cli"],
  ["core", "packages/core"],
  ["discovery-engine", "packages/discovery-engine"],
  ["governance-engine", "packages/governance-engine"],
  ["execution-engine", "packages/execution-engine"]
];

fs.rmSync(path.join(repoRoot, "vendor"), { force: true, recursive: true });

for (const [packageName, packagePath] of internalPackages) {
  const sourceRoot = path.join(repoRoot, packagePath);
  const targetRoot = path.join(
    vendorRoot,
    "@mugiew-method",
    packageName
  );

  fs.mkdirSync(targetRoot, { recursive: true });
  copyRequired(sourceRoot, targetRoot, "package.json");
  copyDirectory(path.join(sourceRoot, "dist"), path.join(targetRoot, "dist"));

  const binRoot = path.join(sourceRoot, "bin");
  if (fs.existsSync(binRoot)) {
    copyDirectory(binRoot, path.join(targetRoot, "bin"));
  }
}

console.log("Prepared self-contained root package vendor files.");

function copyRequired(sourceRoot, targetRoot, relativePath) {
  fs.copyFileSync(
    path.join(sourceRoot, relativePath),
    path.join(targetRoot, relativePath)
  );
}

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Expected directory to exist: ${source}`);
  }

  fs.cpSync(source, target, { recursive: true });
}
