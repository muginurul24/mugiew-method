import type { Ambiguity, AmbiguityCategory } from "@mugiew-method/core";

export const DISCOVERY_CONCERNS = [
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
] as const;

export type DiscoveryConcern = (typeof DISCOVERY_CONCERNS)[number];
export type ConcernCoverageStatus =
  | "covered"
  | "not-applicable"
  | "unresolved";

export interface ConcernCoverageItem {
  concern: DiscoveryConcern;
  status: ConcernCoverageStatus;
}

export interface ConcernCoverageConfidenceInputs {
  totalApplicable: number;
  covered: number;
  unresolved: number;
  notApplicable: number;
  coverageRatio: number;
}

export interface ConcernCoverageEvaluation {
  coverage: ConcernCoverageItem[];
  ambiguities: Ambiguity[];
  confidenceInputs: ConcernCoverageConfidenceInputs;
}

export interface EvaluateConcernCoverageOptions {
  answers: string;
  coveredConcerns?: DiscoveryConcern[];
  notApplicableConcerns?: DiscoveryConcern[];
}

export function evaluateConcernCoverage(
  options: EvaluateConcernCoverageOptions
): ConcernCoverageEvaluation {
  const normalizedAnswers = normalizeConcernText(options.answers);
  const coveredConcerns = new Set(options.coveredConcerns ?? []);
  const notApplicableConcerns = new Set(options.notApplicableConcerns ?? []);

  const coverage = DISCOVERY_CONCERNS.map((concern) => {
    if (notApplicableConcerns.has(concern)) {
      return { concern, status: "not-applicable" } satisfies ConcernCoverageItem;
    }

    if (
      coveredConcerns.has(concern) ||
      normalizedAnswers.includes(normalizeConcernText(concern))
    ) {
      return { concern, status: "covered" } satisfies ConcernCoverageItem;
    }

    return { concern, status: "unresolved" } satisfies ConcernCoverageItem;
  });

  const ambiguities = coverage
    .filter((item) => item.status === "unresolved")
    .map((item, index) => createConcernAmbiguity(item.concern, index + 1));

  const notApplicable = coverage.filter(
    (item) => item.status === "not-applicable"
  ).length;
  const covered = coverage.filter((item) => item.status === "covered").length;
  const unresolved = coverage.filter(
    (item) => item.status === "unresolved"
  ).length;
  const totalApplicable = coverage.length - notApplicable;

  return {
    coverage,
    ambiguities,
    confidenceInputs: {
      totalApplicable,
      covered,
      unresolved,
      notApplicable,
      coverageRatio: totalApplicable === 0 ? 1 : covered / totalApplicable
    }
  };
}

function createConcernAmbiguity(
  concern: DiscoveryConcern,
  sequence: number
): Ambiguity {
  return {
    id: `AMB-CONCERN-${String(sequence).padStart(3, "0")}`,
    category: "blocking-ambiguity" satisfies AmbiguityCategory,
    source: `Concern coverage: ${concern}`,
    impact: `Discovery has not covered ${concern}, so implementation risk remains unknown.`,
    owner: "user",
    status: "open",
    resolution: "",
    blockingReason: `${concern} coverage is required before approval or execution.`
  };
}

function normalizeConcernText(value: string): string {
  return value.toLowerCase().replaceAll(/[\s_]+/g, "-");
}
