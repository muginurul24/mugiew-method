import { describe, expect, it } from "vitest";

import { ValidationError } from "../errors/validation-error.js";
import {
  AMBIGUITY_CATEGORIES,
  type AmbiguityCategory,
  parseAmbiguityReport
} from "./ambiguity-report.js";

describe("ambiguity report contract", () => {
  it("parses a valid ambiguity report", () => {
    const report = parseAmbiguityReport({
      schemaVersion: 1,
      updatedAt: "2026-05-24T00:00:00.000Z",
      ambiguities: [
        createAmbiguity({
          id: "AMB-001",
          category: "blocking-ambiguity"
        })
      ]
    });

    expect(report.ambiguities[0]?.id).toBe("AMB-001");
  });

  it("accepts every required ambiguity category", () => {
    const report = parseAmbiguityReport({
      schemaVersion: 1,
      updatedAt: "2026-05-24T00:00:00.000Z",
      ambiguities: AMBIGUITY_CATEGORIES.map((category, index) =>
        createAmbiguity({
          id: `AMB-00${index + 1}`,
          category
        })
      )
    });

    expect(report.ambiguities.map((ambiguity) => ambiguity.category)).toEqual([
      "blocking-ambiguity",
      "non-blocking-ambiguity",
      "assumption"
    ]);
  });

  it("throws ValidationError when required ambiguity fields are missing", () => {
    expect(() =>
      parseAmbiguityReport({
        schemaVersion: 1,
        updatedAt: "2026-05-24T00:00:00.000Z",
        ambiguities: [
          {
            id: "AMB-001",
            category: "blocking-ambiguity"
          }
        ]
      })
    ).toThrow(ValidationError);
  });

  it("throws ValidationError for invalid ambiguity category", () => {
    expect(() =>
      parseAmbiguityReport({
        schemaVersion: 1,
        updatedAt: "2026-05-24T00:00:00.000Z",
        ambiguities: [
          createAmbiguity({
            id: "AMB-001",
            category: "unknown" as AmbiguityCategory
          })
        ]
      })
    ).toThrow(ValidationError);
  });
});

function createAmbiguity(options: {
  id: string;
  category: AmbiguityCategory;
}) {
  const base = {
    id: options.id,
    category: options.category,
    source: "Discovery question",
    impact: "Execution cannot proceed predictably.",
    owner: "user",
    status: "open",
    resolution: ""
  };

  if (options.category === "blocking-ambiguity") {
    return {
      ...base,
      blockingReason: "This decision blocks approval."
    };
  }

  if (options.category === "non-blocking-ambiguity") {
    return {
      ...base,
      defaultHandlingStrategy: "Use documented best practice."
    };
  }

  return {
    ...base,
    confirmationState: "unconfirmed"
  };
}
