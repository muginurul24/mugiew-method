import { describe, expect, it } from "vitest";

import { detectContradictionsAndRisks } from "./contradiction-detector.js";

describe("detectContradictionsAndRisks", () => {
  it("logs conflict findings with source and rationale", () => {
    const result = detectContradictionsAndRisks({
      statements: [
        {
          id: "S1",
          source: "Answer 1",
          text: "No authentication is required.",
          conflictsWith: ["S2"]
        },
        {
          id: "S2",
          source: "Answer 2",
          text: "Admin-only access is required."
        }
      ]
    });

    expect(result.findings[0]).toMatchObject({
      id: "CONFLICT-001",
      type: "contradiction",
      source: "Answer 1; Answer 2",
      status: "unresolved"
    });
    expect(result.findings[0]?.rationale).toContain("conflicts with");
  });

  it("turns unresolved contradictions into blocking ambiguities", () => {
    const result = detectContradictionsAndRisks({
      statements: [
        {
          id: "S1",
          source: "Answer 1",
          text: "No persistence needed.",
          conflictsWith: ["S2"]
        },
        {
          id: "S2",
          source: "Answer 2",
          text: "Audit trail must be persisted."
        }
      ]
    });

    expect(result.ambiguities).toHaveLength(1);
    expect(result.ambiguities[0]).toMatchObject({
      id: "AMB-CONFLICT-001",
      category: "blocking-ambiguity",
      blockingReason:
        "Contradiction must be resolved or explicitly overridden before approval or execution."
    });
  });

  it("records explicit user override as decision provenance", () => {
    const override = {
      overriddenBy: "Mugiew",
      reason: "Accept risk for prototype.",
      recordedAt: "2026-05-24T00:00:00.000Z"
    };

    const result = detectContradictionsAndRisks({
      riskyDecisions: [
        {
          id: "R1",
          source: "User answer",
          decision: "Skip automated tests",
          rationale: "Fast prototype requested.",
          override
        }
      ]
    });

    expect(result.findings[0]).toMatchObject({
      status: "overridden",
      override
    });
  });

  it("does not apply override silently when no override provenance exists", () => {
    const result = detectContradictionsAndRisks({
      riskyDecisions: [
        {
          id: "R1",
          source: "User answer",
          decision: "Skip validation",
          rationale: "Validation is considered too slow."
        }
      ]
    });

    expect(result.findings[0]).toMatchObject({
      status: "unresolved"
    });
    expect(result.findings[0]).not.toHaveProperty("override");
  });
});
