import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@mugiew-method/core": fileURLToPath(
        new URL("./packages/core/src/index.ts", import.meta.url)
      ),
      "@mugiew-method/discovery-engine": fileURLToPath(
        new URL("./packages/discovery-engine/src/index.ts", import.meta.url)
      ),
      "@mugiew-method/governance-engine": fileURLToPath(
        new URL("./packages/governance-engine/src/index.ts", import.meta.url)
      )
    }
  },
  test: {
    include: ["packages/**/*.test.ts"],
    passWithNoTests: false
  }
});
