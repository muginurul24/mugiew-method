import { describe, expect, it } from "vitest";

import { corePackageName, describeCorePackage } from "./index.js";

describe("core package", () => {
  it("exports package identity for workspace test discovery", () => {
    expect(corePackageName).toBe("@mugiew-method/core");
    expect(describeCorePackage()).toContain("Mugiew Method");
  });
});
