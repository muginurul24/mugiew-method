import { describe, expect, it } from "vitest";

import {
  DISCOVERY_CONCERNS,
  evaluateConcernCoverage
} from "./concern-coverage.js";

describe("evaluateConcernCoverage", () => {
  it("includes all required discovery concerns", () => {
    expect(DISCOVERY_CONCERNS).toEqual([
      "security",
      "performance",
      "deployment",
      "api",
      "testing",
      "error-handling",
      "maintainability",
      "ai-readability",
      "observability",
      "accessibility",
      "scalability"
    ]);
  });

  it("marks concerns covered, not-applicable, or unresolved", () => {
    const result = evaluateConcernCoverage({
      answers: "Security and performance constraints are defined.",
      notApplicableConcerns: ["accessibility"]
    });

    expect(result.coverage).toContainEqual({
      concern: "security",
      status: "covered"
    });
    expect(result.coverage).toContainEqual({
      concern: "performance",
      status: "covered"
    });
    expect(result.coverage).toContainEqual({
      concern: "accessibility",
      status: "not-applicable"
    });
    expect(result.coverage).toContainEqual({
      concern: "deployment",
      status: "unresolved"
    });
  });

  it("creates ambiguity entries for unresolved applicable concerns", () => {
    const result = evaluateConcernCoverage({
      answers: "",
      notApplicableConcerns: ["accessibility"]
    });

    expect(result.ambiguities).toHaveLength(DISCOVERY_CONCERNS.length - 1);
    expect(result.ambiguities[0]).toMatchObject({
      category: "blocking-ambiguity",
      owner: "user",
      status: "open"
    });
  });

  it("returns confidence inputs from coverage counts", () => {
    const result = evaluateConcernCoverage({
      answers: "",
      coveredConcerns: ["security", "testing"],
      notApplicableConcerns: ["accessibility"]
    });

    expect(result.confidenceInputs).toEqual({
      totalApplicable: 10,
      covered: 2,
      unresolved: 8,
      notApplicable: 1,
      coverageRatio: 0.2
    });
  });
});
