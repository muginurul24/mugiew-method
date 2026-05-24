export const discoveryEnginePackageName = "@mugiew-method/discovery-engine";

export { startDiscovery } from "./start-discovery.js";
export type {
  StartDiscoveryOptions,
  StartDiscoveryResult,
  StartDiscoveryStatus
} from "./start-discovery.js";
export {
  DISCOVERY_CONCERNS,
  evaluateConcernCoverage
} from "./concern-coverage.js";
export type {
  ConcernCoverageConfidenceInputs,
  ConcernCoverageEvaluation,
  ConcernCoverageItem,
  ConcernCoverageStatus,
  DiscoveryConcern,
  EvaluateConcernCoverageOptions
} from "./concern-coverage.js";
export { classifyDiscoveryItems } from "./ambiguity-classifier.js";
export type {
  ClassifyDiscoveryItemsOptions,
  DiscoveryItem,
  DiscoveryItemClassificationHint,
  DiscoveryItemRisk
} from "./ambiguity-classifier.js";
export { detectContradictionsAndRisks } from "./contradiction-detector.js";
export type {
  DecisionOverrideProvenance,
  DetectContradictionsAndRisksOptions,
  DetectContradictionsAndRisksResult,
  DiscoveryFinding,
  DiscoveryFindingStatus,
  DiscoveryFindingType,
  DiscoveryStatement,
  RiskyDecision
} from "./contradiction-detector.js";
export {
  calculateConfidenceReport,
  renderConfidenceReport
} from "./confidence-calculator.js";
export type {
  CalculateConfidenceReportOptions,
  ConfidenceFactorBreakdown,
  ConfidenceFactorInputs,
  ConfidenceReadinessState,
  ConfidenceReport
} from "./confidence-calculator.js";
