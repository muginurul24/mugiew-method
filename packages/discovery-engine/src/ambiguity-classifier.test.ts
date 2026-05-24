import { describe, expect, it } from "vitest";

import { parseAmbiguityReport } from "@mugiew-method/core";

import { classifyDiscoveryItems } from "./ambiguity-classifier.js";

describe("classifyDiscoveryItems", () => {
  it("classifies blocking ambiguities with a blocking reason", () => {
    const [ambiguity] = classifyDiscoveryItems([
      {
        source: "User answer",
        text: "Auth model is unknown.",
        risk: "unknown-required-decision",
        blockingReason: "Auth decision blocks secure implementation."
      }
    ]);

    expect(ambiguity).toMatchObject({
      id: "AMB-001",
      category: "blocking-ambiguity",
      blockingReason: "Auth decision blocks secure implementation."
    });
  });

  it("classifies non-blocking ambiguities with a default handling strategy", () => {
    const [ambiguity] = classifyDiscoveryItems([
      {
        source: "Architecture note",
        text: "Exact logger format is not specified.",
        risk: "implementation-detail",
        defaultHandlingStrategy: "Use existing structured JSON logging."
      }
    ]);

    expect(ambiguity).toMatchObject({
      category: "non-blocking-ambiguity",
      defaultHandlingStrategy: "Use existing structured JSON logging."
    });
  });

  it("classifies assumptions with confirmation state", () => {
    const [ambiguity] = classifyDiscoveryItems([
      {
        source: "PM assumption",
        text: "CLI-only MVP.",
        classificationHint: "assumption",
        confirmationState: "confirmed"
      }
    ]);

    expect(ambiguity).toMatchObject({
      category: "assumption",
      confirmationState: "confirmed"
    });
  });

  it("rejects category-specific missing details in ambiguity reports", () => {
    expect(() =>
      parseAmbiguityReport({
        schemaVersion: 1,
        updatedAt: "2026-05-24T00:00:00.000Z",
        ambiguities: [
          {
            id: "AMB-001",
            category: "blocking-ambiguity",
            source: "Discovery",
            impact: "Unknown auth model.",
            owner: "user",
            status: "open",
            resolution: ""
          }
        ]
      })
    ).toThrow();
  });
});
