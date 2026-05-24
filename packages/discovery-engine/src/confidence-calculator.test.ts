import { describe, expect, it } from "vitest";

import type { Ambiguity } from "@mugiew-method/core";

import {
  calculateConfidenceReport,
  renderConfidenceReport
} from "./confidence-calculator.js";

describe("confidence calculator", () => {
  it("renders score, factors, blocking count, and readiness state", () => {
    const report = calculateConfidenceReport({
      ambiguities: [],
      factors: createPerfectFactors()
    });

    expect(renderConfidenceReport(report)).toContain(
      "Project Understanding Confidence: 100%"
    );
    expect(renderConfidenceReport(report)).toContain(
      "Remaining Blocking Ambiguities: 0"
    );
    expect(renderConfidenceReport(report)).toContain(
      "Execution Readiness: READY_FOR_APPROVAL"
    );
    expect(renderConfidenceReport(report)).toContain("## Factor Breakdown");
  });

  it("changes score when blocking ambiguity status changes", () => {
    const unresolved = calculateConfidenceReport({
      ambiguities: [createBlockingAmbiguity("open")],
      factors: createPerfectFactors()
    });
    const resolved = calculateConfidenceReport({
      ambiguities: [createBlockingAmbiguity("resolved")],
      factors: createPerfectFactors()
    });

    expect(unresolved.score).toBeLessThan(resolved.score);
  });

  it("cannot report execution-ready while blocking ambiguities remain", () => {
    const report = calculateConfidenceReport({
      ambiguities: [createBlockingAmbiguity("open")],
      factors: createPerfectFactors()
    });

    expect(report.blockingAmbiguityCount).toBe(1);
    expect(report.score).toBeLessThan(90);
    expect(report.readinessState).toBe("EXECUTION_READY_BLOCKED");
  });
});

function createPerfectFactors() {
  return {
    concernCoverage: {
      totalApplicable: 11,
      covered: 11,
      unresolved: 0,
      notApplicable: 0,
      coverageRatio: 1
    },
    architectureCompleteness: 1,
    dependencyClarity: 1,
    edgeCaseCoverage: 1,
    requirementClarity: 1,
    executionPredictability: 1
  };
}

function createBlockingAmbiguity(status: "open" | "resolved"): Ambiguity {
  return {
    id: "AMB-001",
    category: "blocking-ambiguity",
    source: "Discovery",
    impact: "Auth model unknown.",
    owner: "user",
    status,
    resolution: status === "resolved" ? "Use OAuth." : "",
    blockingReason: "Auth model blocks implementation."
  };
}
