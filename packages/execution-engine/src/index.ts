export const executionEnginePackageName = "@mugiew-method/execution-engine";

export {
  detectArchitectureDrift,
  writeArchitectureDriftState,
  writeApprovedDriftJournal
} from "./architecture-drift-detector.js";
export type {
  ApprovedArchitectureDrift,
  ArchitectureDriftFinding,
  ArchitectureDriftOutput,
  ArchitectureDriftResult,
  ArchitectureDriftSeverity,
  ArchitectureDriftStatus,
  ArchitectureRule,
  DetectArchitectureDriftOptions,
  WriteArchitectureDriftStateOptions,
  WriteArchitectureDriftStateResult,
  WriteApprovedDriftJournalOptions,
  WriteApprovedDriftJournalResult
} from "./architecture-drift-detector.js";
export {
  createDependencyGraph,
  findDependencyCycles,
  selectNextUnblockedTask
} from "./dependency-graph.js";
export type { CreateDependencyGraphOptions } from "./dependency-graph.js";
export {
  selectRuntimeTask,
  selectRuntimeTaskFromProject
} from "./task-selection.js";
export type {
  RuntimeTaskNotSelected,
  RuntimeTaskSelected,
  RuntimeTaskSelection,
  SelectRuntimeTaskFromProjectOptions,
  SelectRuntimeTaskFromProjectResult
} from "./task-selection.js";
export {
  YOLO_RUN_CONFIDENCE_THRESHOLD,
  evaluateYoloRunGate,
  yoloRunProject
} from "./yolo-runtime.js";
export type {
  YoloRunGateAllowed,
  YoloRunGateDecision,
  YoloRunGateDenied,
  YoloRunGateInput,
  YoloRunProjectDenied,
  YoloRunProjectOptions,
  YoloRunProjectReady,
  YoloRunProjectResult
} from "./yolo-runtime.js";
export {
  DEFAULT_VALIDATION_OUTPUT_LIMIT_BYTES,
  DEFAULT_VALIDATION_TIMEOUT_MS,
  VALIDATION_COMMAND_TRUST_BOUNDARY,
  runTaskValidation
} from "./validation-runner.js";
export type {
  RunTaskValidationOptions,
  TaskValidationFailed,
  TaskValidationPassed,
  TaskValidationResult,
  ValidationCommandResult,
  ValidationFailureReason
} from "./validation-runner.js";
export { runSelfReview } from "./review-engine.js";
export type {
  RunSelfReviewOptions,
  SelfReviewCheck,
  SelfReviewFinding,
  SelfReviewFindingDisposition,
  SelfReviewFindingSeverity,
  SelfReviewResult
} from "./review-engine.js";
export { stopRuntimeSafely } from "./runtime-stop.js";
export type {
  RuntimeStopStatus,
  StopRuntimeSafelyOptions,
  StopRuntimeSafelyResult
} from "./runtime-stop.js";
export { rebuildTasksSafely } from "./rebuild-tasks.js";
export type {
  ManualTaskEdit,
  ManualTaskEditType,
  RebuildTaskConflict,
  RebuildTaskConflictType,
  RebuildTasksSafelyOptions,
  RebuildTasksSafelyResult
} from "./rebuild-tasks.js";
export { generateTasksFromConcerns } from "./task-generator.js";
export type {
  GenerateTasksFromConcernsOptions,
  TaskConcernInput
} from "./task-generator.js";
