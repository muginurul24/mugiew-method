export const governanceEnginePackageName = "@mugiew-method/governance-engine";

export { installProject } from "./install-project.js";
export type {
  InstallProjectOptions,
  InstallProjectResult
} from "./install-project.js";
export {
  renderPrdArtifact,
  writePrdArtifact
} from "./prd-generator.js";
export type {
  PrdArtifactInput,
  WritePrdArtifactOptions,
  WritePrdArtifactResult
} from "./prd-generator.js";
export {
  SPECIFICATION_ARTIFACTS,
  renderSpecificationArtifact,
  writeSpecificationArtifacts
} from "./specification-generator.js";
export type {
  SpecificationApplicability,
  SpecificationArtifactInput,
  SpecificationArtifactKind,
  WriteSpecificationArtifactsOptions,
  WriteSpecificationArtifactsResult
} from "./specification-generator.js";
export {
  renderAgentsConstitution,
  writeAgentsConstitution
} from "./agents-generator.js";
export type {
  AgentsConstitutionInput,
  WriteAgentsConstitutionOptions,
  WriteAgentsConstitutionResult
} from "./agents-generator.js";
export {
  RULE_TEMPLATE_FILES,
  renderRuleTemplates,
  writeRuleTemplates
} from "./rules-generator.js";
export type {
  RuleTemplateFile,
  RuleTemplateMap,
  WriteRuleTemplatesOptions,
  WriteRuleTemplatesResult
} from "./rules-generator.js";
export {
  APPROVAL_CONFIDENCE_THRESHOLD,
  approvePrdProject,
  assertApprovalInputsExist,
  calculateApprovalArtifactVersions,
  evaluateApprovalGate,
  writeApprovalRecord
} from "./approval-gate.js";
export type {
  ApprovePrdProjectApproved,
  ApprovePrdProjectDenied,
  ApprovePrdProjectOptions,
  ApprovePrdProjectResult,
  ApprovalGateApproved,
  ApprovalGateDecision,
  ApprovalGateDenied,
  ApprovalGateInput,
  ApprovalRecord,
  WriteApprovalRecordOptions
} from "./approval-gate.js";
export {
  evaluateForceModePolicy,
  renderForceModeJournalEntry,
  writeForceModeJournalEntry
} from "./force-mode-policy.js";
export type {
  ForceModeDecision,
  ForceModeDecisionStatus,
  ForceModeJournalEntry,
  ForceModePolicyInput,
  WriteForceModeJournalOptions
} from "./force-mode-policy.js";
export {
  getProjectStatus,
  renderProjectStatusText
} from "./project-status.js";
export type {
  ArchitectureHealth,
  GetProjectStatusOptions,
  LatestValidationStatus,
  PrdStatus,
  ProjectStatusDrift,
  ProjectStatusReport,
  TaskProgressStatus
} from "./project-status.js";
export {
  validateWorkAgainstAgents,
  writeApprovedExceptionJournal
} from "./constitution-validator.js";
export type {
  ApprovedConstitutionException,
  ConstitutionValidationResult,
  ConstitutionViolation,
  ConstitutionViolationSeverity,
  ConstitutionViolationStatus,
  ValidateWorkAgainstAgentsOptions,
  WorkOutput,
  WriteApprovedExceptionJournalOptions,
  WriteApprovedExceptionJournalResult
} from "./constitution-validator.js";
export { reviewProject } from "./review-project.js";
export type {
  ReviewFinding,
  ReviewFindingCategory,
  ReviewFindingSeverity,
  ReviewProjectOptions,
  ReviewProjectResult
} from "./review-project.js";
