# Package API Reference

## `@mugiew-method/core`

Purpose: shared contracts and primitives.

Main exports:

- `createProjectPaths`
- `resolveProjectPaths`
- `detectProjectRoot`
- `safeWriteFile`
- `createInitialProjectState`
- `parseAmbiguityReport`
- `parseTaskFile`
- `parseDependencyGraph`
- domain errors: `ProjectRootNotFoundError`, `MissingInstallationError`, `SchemaVersionError`, `UnsafeWriteError`, `ValidationError`, `GateDeniedError`

Important files:

- `packages/core/src/filesystem/project-paths.ts`
- `packages/core/src/filesystem/workspace-detector.ts`
- `packages/core/src/filesystem/safe-write.ts`
- `packages/core/src/contracts/ambiguity-report.ts`
- `packages/core/src/contracts/task-file.ts`
- `packages/core/src/contracts/dependency-graph.ts`
- `packages/core/src/contracts/project-state.ts`

## `@mugiew-method/discovery-engine`

Purpose: discovery and confidence primitives.

Main exports:

- `startDiscovery`
- `evaluateConcernCoverage`
- `classifyDiscoveryItems`
- `detectContradictionsAndRisks`
- `calculateConfidenceReport`
- `renderConfidenceReport`

Important files:

- `packages/discovery-engine/src/start-discovery.ts`
- `packages/discovery-engine/src/concern-coverage.ts`
- `packages/discovery-engine/src/ambiguity-classifier.ts`
- `packages/discovery-engine/src/contradiction-detector.ts`
- `packages/discovery-engine/src/confidence-calculator.ts`

## `@mugiew-method/governance-engine`

Purpose: generated governance artifacts and approval/status review.

Main exports:

- `installProject`
- `renderPrdArtifact`
- `writePrdArtifact`
- `renderSpecificationArtifact`
- `writeSpecificationArtifacts`
- `renderAgentsConstitution`
- `writeAgentsConstitution`
- `renderRuleTemplates`
- `writeRuleTemplates`
- `evaluateApprovalGate`
- `approvePrdProject`
- `writeApprovalRecord`
- `evaluateForceModePolicy`
- `writeForceModeJournalEntry`
- `getProjectStatus`
- `renderProjectStatusText`
- `validateWorkAgainstAgents`
- `writeApprovedExceptionJournal`
- `reviewProject`

Important files:

- `packages/governance-engine/src/install-project.ts`
- `packages/governance-engine/src/prd-generator.ts`
- `packages/governance-engine/src/specification-generator.ts`
- `packages/governance-engine/src/agents-generator.ts`
- `packages/governance-engine/src/rules-generator.ts`
- `packages/governance-engine/src/approval-gate.ts`
- `packages/governance-engine/src/project-status.ts`
- `packages/governance-engine/src/review-project.ts`

## `@mugiew-method/execution-engine`

Purpose: task graph and runtime execution primitives.

Main exports:

- `generateTasksFromConcerns`
- `createDependencyGraph`
- `selectNextUnblockedTask`
- `selectRuntimeTask`
- `selectRuntimeTaskFromProject`
- `evaluateYoloRunGate`
- `yoloRunProject`
- `runTaskValidation`
- `runSelfReview`
- `stopRuntimeSafely`
- `rebuildTasksSafely`
- `detectArchitectureDrift`
- `writeArchitectureDriftState`
- `writeApprovedDriftJournal`

Important files:

- `packages/execution-engine/src/task-generator.ts`
- `packages/execution-engine/src/dependency-graph.ts`
- `packages/execution-engine/src/task-selection.ts`
- `packages/execution-engine/src/yolo-runtime.ts`
- `packages/execution-engine/src/validation-runner.ts`
- `packages/execution-engine/src/review-engine.ts`
- `packages/execution-engine/src/runtime-stop.ts`
- `packages/execution-engine/src/rebuild-tasks.ts`
- `packages/execution-engine/src/architecture-drift-detector.ts`

## `@mugiew-method/cli`

Purpose: oclif terminal adapter.

Commands:

- `install`
- `create-prd`
- `approve-prd`
- `project-status`
- `review-project`
- `yolo-run`

Important files:

- `packages/cli/bin/run.js`
- `packages/cli/src/commands/index.ts`
- `packages/cli/src/commands/install.ts`
- `packages/cli/src/commands/create-prd.ts`
- `packages/cli/src/commands/approve-prd.ts`
- `packages/cli/src/commands/project-status.ts`
- `packages/cli/src/commands/review-project.ts`
- `packages/cli/src/commands/yolo-run.ts`
