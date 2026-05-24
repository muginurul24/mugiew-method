import type { Ambiguity } from "@mugiew-method/core";

import type { ConcernCoverageConfidenceInputs } from "./concern-coverage.js";

export type ConfidenceReadinessState =
  | "DISCOVERY_IN_PROGRESS"
  | "READY_FOR_APPROVAL"
  | "EXECUTION_READY_BLOCKED";

export interface ConfidenceFactorInputs {
  concernCoverage: ConcernCoverageConfidenceInputs;
  architectureCompleteness: number;
  dependencyClarity: number;
  edgeCaseCoverage: number;
  requirementClarity: number;
  executionPredictability: number;
}

export interface CalculateConfidenceReportOptions {
  ambiguities: Ambiguity[];
  factors: ConfidenceFactorInputs;
}

export interface ConfidenceFactorBreakdown {
  concernCoverage: number;
  architectureCompleteness: number;
  dependencyClarity: number;
  edgeCaseCoverage: number;
  requirementClarity: number;
  executionPredictability: number;
  ambiguityResolution: number;
}

export interface ConfidenceReport {
  score: number;
  readinessState: ConfidenceReadinessState;
  blockingAmbiguityCount: number;
  factors: ConfidenceFactorBreakdown;
}

export function calculateConfidenceReport(
  options: CalculateConfidenceReportOptions
): ConfidenceReport {
  const blockingAmbiguityCount = options.ambiguities.filter(
    (ambiguity) =>
      ambiguity.category === "blocking-ambiguity" &&
      ambiguity.status !== "resolved"
  ).length;
  const factors = {
    concernCoverage: clampRatio(options.factors.concernCoverage.coverageRatio),
    architectureCompleteness: clampRatio(
      options.factors.architectureCompleteness
    ),
    dependencyClarity: clampRatio(options.factors.dependencyClarity),
    edgeCaseCoverage: clampRatio(options.factors.edgeCaseCoverage),
    requirementClarity: clampRatio(options.factors.requirementClarity),
    executionPredictability: clampRatio(options.factors.executionPredictability),
    ambiguityResolution:
      blockingAmbiguityCount === 0
        ? 1
        : Math.max(0, 1 - blockingAmbiguityCount * 0.2)
  };
  const rawScore = Math.round(
    ((factors.concernCoverage +
      factors.architectureCompleteness +
      factors.dependencyClarity +
      factors.edgeCaseCoverage +
      factors.requirementClarity +
      factors.executionPredictability +
      factors.ambiguityResolution) /
      7) *
      100
  );
  const score =
    blockingAmbiguityCount > 0 ? Math.min(rawScore, 89) : rawScore;

  return {
    score,
    readinessState:
      blockingAmbiguityCount > 0
        ? "EXECUTION_READY_BLOCKED"
        : score >= 90
          ? "READY_FOR_APPROVAL"
          : "DISCOVERY_IN_PROGRESS",
    blockingAmbiguityCount,
    factors
  };
}

export function renderConfidenceReport(report: ConfidenceReport): string {
  return [
    "# Confidence Report",
    "",
    `Project Understanding Confidence: ${report.score}%`,
    `Remaining Blocking Ambiguities: ${report.blockingAmbiguityCount}`,
    `Execution Readiness: ${report.readinessState}`,
    "",
    "## Factor Breakdown",
    "",
    `- Concern Coverage: ${toPercent(report.factors.concernCoverage)}`,
    `- Architecture Completeness: ${toPercent(report.factors.architectureCompleteness)}`,
    `- Dependency Clarity: ${toPercent(report.factors.dependencyClarity)}`,
    `- Edge Case Coverage: ${toPercent(report.factors.edgeCaseCoverage)}`,
    `- Requirement Clarity: ${toPercent(report.factors.requirementClarity)}`,
    `- Execution Predictability: ${toPercent(report.factors.executionPredictability)}`,
    `- Ambiguity Resolution: ${toPercent(report.factors.ambiguityResolution)}`,
    ""
  ].join("\n");
}

function clampRatio(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
