import { describe, expect, it } from "vitest";

import { formatCreatePrdResult } from "./create-prd.js";

describe("formatCreatePrdResult", () => {
  it("prints discovery runtime scope explicitly", () => {
    expect(
      formatCreatePrdResult({
        adaptiveInterrogation: "pending",
        createdPaths: ["/project/_mugiew-method/discovery/answers.md"],
        existingPaths: ["/project/_mugiew-method/discovery/ambiguities.md"],
        phase: "bootstrap-primitives",
        projectRoot: "/project",
        scopeNote:
          "Current /create-prd bootstraps discovery artifacts and state. Full adaptive conversational interrogation is deferred.",
        status: "created"
      })
    ).toEqual([
      "Discovery created in /project",
      "Discovery Phase: bootstrap-primitives",
      "Adaptive Interrogation: pending",
      "Current /create-prd bootstraps discovery artifacts and state. Full adaptive conversational interrogation is deferred.",
      "Created:",
      "- /project/_mugiew-method/discovery/answers.md",
      "Existing:",
      "- /project/_mugiew-method/discovery/ambiguities.md"
    ]);
  });
});
