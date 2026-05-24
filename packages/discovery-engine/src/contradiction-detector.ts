import type { Ambiguity } from "@mugiew-method/core";

import { classifyDiscoveryItems } from "./ambiguity-classifier.js";

export type DiscoveryFindingType = "contradiction" | "risky-decision";
export type DiscoveryFindingStatus = "unresolved" | "overridden";

export interface DecisionOverrideProvenance {
  overriddenBy: string;
  reason: string;
  recordedAt: string;
}

export interface DiscoveryStatement {
  id: string;
  source: string;
  text: string;
  conflictsWith?: string[];
  override?: DecisionOverrideProvenance;
}

export interface RiskyDecision {
  id: string;
  source: string;
  decision: string;
  rationale: string;
  override?: DecisionOverrideProvenance;
}

export interface DiscoveryFinding {
  id: string;
  type: DiscoveryFindingType;
  source: string;
  rationale: string;
  status: DiscoveryFindingStatus;
  override?: DecisionOverrideProvenance;
}

export interface DetectContradictionsAndRisksOptions {
  statements?: DiscoveryStatement[];
  riskyDecisions?: RiskyDecision[];
}

export interface DetectContradictionsAndRisksResult {
  findings: DiscoveryFinding[];
  ambiguities: Ambiguity[];
}

export function detectContradictionsAndRisks(
  options: DetectContradictionsAndRisksOptions
): DetectContradictionsAndRisksResult {
  const findings = [
    ...detectStatementContradictions(options.statements ?? []),
    ...detectRiskyDecisions(options.riskyDecisions ?? [])
  ];
  const unresolvedContradictions = findings.filter(
    (finding) =>
      finding.type === "contradiction" && finding.status === "unresolved"
  );

  return {
    findings,
    ambiguities: classifyDiscoveryItems(
      unresolvedContradictions.map((finding) => ({
        source: finding.source,
        text: finding.rationale,
        risk: "contradiction",
        blockingReason:
          "Contradiction must be resolved or explicitly overridden before approval or execution."
      })),
      { idPrefix: "AMB-CONFLICT" }
    )
  };
}

function detectStatementContradictions(
  statements: DiscoveryStatement[]
): DiscoveryFinding[] {
  const statementsById = new Map(
    statements.map((statement) => [statement.id, statement])
  );
  const findings: DiscoveryFinding[] = [];
  const seenPairs = new Set<string>();

  for (const statement of statements) {
    for (const conflictingId of statement.conflictsWith ?? []) {
      const conflictingStatement = statementsById.get(conflictingId);

      if (conflictingStatement === undefined) {
        continue;
      }

      const pairKey = [statement.id, conflictingId].sort().join("::");

      if (seenPairs.has(pairKey)) {
        continue;
      }

      seenPairs.add(pairKey);
      findings.push(
        createFinding({
          id: `CONFLICT-${String(findings.length + 1).padStart(3, "0")}`,
          type: "contradiction",
          source: `${statement.source}; ${conflictingStatement.source}`,
          rationale: `Conflicting statements: "${statement.text}" conflicts with "${conflictingStatement.text}".`,
          override: statement.override ?? conflictingStatement.override
        })
      );
    }
  }

  return findings;
}

function detectRiskyDecisions(
  riskyDecisions: RiskyDecision[]
): DiscoveryFinding[] {
  return riskyDecisions.map((decision, index) =>
    createFinding({
      id: `RISK-${String(index + 1).padStart(3, "0")}`,
      type: "risky-decision",
      source: decision.source,
      rationale: `${decision.decision}: ${decision.rationale}`,
      override: decision.override
    })
  );
}

function createFinding(options: {
  id: string;
  type: DiscoveryFindingType;
  source: string;
  rationale: string;
  override?: DecisionOverrideProvenance;
}): DiscoveryFinding {
  return {
    id: options.id,
    type: options.type,
    source: options.source,
    rationale: options.rationale,
    status: options.override === undefined ? "unresolved" : "overridden",
    ...(options.override === undefined ? {} : { override: options.override })
  };
}
