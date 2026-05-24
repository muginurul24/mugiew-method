export const corePackageName = "@mugiew-method/core";

export function describeCorePackage(): string {
  return "Shared contracts and primitives for Mugiew Method.";
}

export {
  AGENTS_FILE_NAME,
  MUGIEW_DIRECTORY_NAME,
  MUGIEW_MANAGED_DIRECTORY_NAMES,
  MUGIEW_RELATIVE_DIRECTORY_PATHS,
  createProjectPaths,
  resolveProjectPaths
} from "./filesystem/project-paths.js";
export type {
  MugiewDirectoryPaths,
  MugiewManagedDirectoryName,
  MugiewProjectPaths,
  ResolveProjectPathsOptions
} from "./filesystem/project-paths.js";
export { ProjectRootNotFoundError } from "./errors/project-root-not-found-error.js";
export { MissingInstallationError } from "./errors/missing-installation-error.js";
export type { MissingInstallationErrorOptions } from "./errors/missing-installation-error.js";
export { SchemaVersionError } from "./errors/schema-version-error.js";
export type { SchemaVersionErrorOptions } from "./errors/schema-version-error.js";
export { UnsafeWriteError } from "./errors/unsafe-write-error.js";
export type { UnsafeWriteErrorOptions } from "./errors/unsafe-write-error.js";
export { detectProjectRoot } from "./filesystem/workspace-detector.js";
export type { DetectProjectRootOptions } from "./filesystem/workspace-detector.js";
export { safeWriteFile } from "./filesystem/safe-write.js";
export type {
  SafeWriteFileOptions,
  SafeWriteFileResult
} from "./filesystem/safe-write.js";
export { calculateFileArtifactVersion } from "./filesystem/artifact-version.js";
export {
  CURRENT_PROJECT_STATE_SCHEMA_VERSION,
  createInitialProjectState
} from "./contracts/project-state.js";
export type {
  CreateInitialProjectStateOptions,
  ProjectState
} from "./contracts/project-state.js";
export {
  AMBIGUITY_CATEGORIES,
  AMBIGUITY_OWNERS,
  AMBIGUITY_STATUSES,
  ASSUMPTION_CONFIRMATION_STATES,
  CURRENT_AMBIGUITY_REPORT_SCHEMA_VERSION,
  ambiguityCategorySchema,
  ambiguityOwnerSchema,
  ambiguityReportSchema,
  ambiguitySchema,
  ambiguityStatusSchema,
  assumptionConfirmationStateSchema,
  assumptionSchema,
  blockingAmbiguitySchema,
  nonBlockingAmbiguitySchema,
  parseAmbiguityReport
} from "./contracts/ambiguity-report.js";
export type {
  Ambiguity,
  AmbiguityCategory,
  AmbiguityOwner,
  AmbiguityReport,
  AmbiguityStatus,
  AssumptionConfirmationState
} from "./contracts/ambiguity-report.js";
export { ValidationError } from "./errors/validation-error.js";
export type {
  ValidationErrorOptions,
  ValidationIssue
} from "./errors/validation-error.js";
export { GateDeniedError } from "./errors/gate-denied-error.js";
export type { GateDeniedErrorOptions } from "./errors/gate-denied-error.js";
export {
  parseTaskFile,
  taskFileSchema
} from "./contracts/task-file.js";
export type { TaskFile } from "./contracts/task-file.js";
export {
  CURRENT_DEPENDENCY_GRAPH_SCHEMA_VERSION,
  dependencyGraphNodeSchema,
  dependencyGraphSchema,
  dependencyStatusSchema,
  detectDependencyCycles,
  parseDependencyGraph,
  taskGraphStatusSchema
} from "./contracts/dependency-graph.js";
export type {
  DependencyGraph,
  DependencyCycleFinding,
  DependencyGraphNode,
  DependencyStatus,
  TaskGraphStatus
} from "./contracts/dependency-graph.js";
export {
  APPROVAL_ARTIFACT_KEYS,
  CURRENT_APPROVAL_RECORD_SCHEMA_VERSION,
  approvalArtifactVersionsSchema,
  approvalRecordSchema,
  parseApprovalRecord
} from "./contracts/approval-record.js";
export type {
  ApprovalArtifactKey,
  ApprovalArtifactVersions,
  ApprovalRecord
} from "./contracts/approval-record.js";
