import fs from "node:fs/promises";
import { createHash } from "node:crypto";

export async function calculateFileArtifactVersion(
  filePath: string
): Promise<string> {
  const content = await fs.readFile(filePath);
  const hash = createHash("sha256").update(content).digest("hex");

  return `sha256:${hash}`;
}
