---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/prds/prd-mugiew-method-2026-05-24/addendum.md
workflowType: epics-and-stories
project_name: mugiew-method
user_name: Mugiew
date: 2026-05-24
status: complete
completedAt: 2026-05-24
---

# mugiew-method - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for mugiew-method, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can run `npx mugiew-method install` from a project root to initialize Mugiew Method, creating `_mugiew-method/`, root `AGENTS.md`, and initial Project State without silent overwrite.

FR2: System can detect whether Mugiew Method already exists in a repository and avoid destructive reinstall behavior.

FR3: User can invoke `/create-prd` to start Discovery Engine and PRD Artifact generation.

FR4: User can invoke `/approve-prd` to lock PRD Artifact and enable execution readiness checks.

FR5: User can invoke `/yolo-run` to start YOLO-RUN Runtime only when readiness gates pass.

FR6: User can invoke `/project-status` to inspect Project State, confidence score, ambiguity count, PRD status, task progress, blockers, architecture health, and validation state.

FR7: User can invoke `/review-project` to run review without advancing implementation.

FR8: User can invoke `/rebuild-tasks` to regenerate Task Graph from approved specifications while preserving completed task history and conflict visibility.

FR9: Discovery Engine can ask adaptive natural-language questions based on prior answers.

FR10: Discovery Engine tracks internal concern coverage for security, performance, deployment, database, API, testing, error handling, maintainability, AI readability, observability, accessibility, scalability, and other applicable domains.

FR11: Discovery Engine can challenge contradictions and risky decisions, logging rationale and user overrides.

FR12: System classifies each Ambiguity as Blocking Ambiguity, Non-Blocking Ambiguity, or Assumption.

FR13: System persists Ambiguity state to human-readable Markdown and machine-readable JSON.

FR14: System calculates project understanding confidence based on ambiguity, architecture completeness, edge-case coverage, requirement clarity, dependency clarity, and execution predictability.

FR15: System enforces phase gates between discovery, specification, approval, and execution.

FR16: System generates machine-readable PRD Artifact with stable IDs for FRs, NFRs, ACs, Constraints, Architecture Decisions, Open Questions, and Assumptions.

FR17: System generates Specification Artifacts, including architecture, technical spec, API contracts, database schema, execution plan, and testing strategy where applicable.

FR18: System creates and maintains root `AGENTS.md` as AGENTS.md Constitution.

FR19: System can validate implementation or task output against `AGENTS.md`.

FR20: System generates granular Tasks where `1 task = 1 implementation concern`.

FR21: System maintains dependency graph in `state/dependency-graph.json`.

FR22: YOLO-RUN Runtime can execute unblocked Tasks after Confidence Gate passes.

FR23: YOLO-RUN Runtime stops safely when it cannot proceed.

FR24: System runs self-review before task completion.

FR25: System detects whether implementation diverges from architecture and `AGENTS.md`.

FR26: System includes and enforces UI governance rules in `AGENTS.md` and `rules/ui-rules.md`.

### NonFunctional Requirements

NFR1: Gate logic must be deterministic from Project State; same state must produce same readiness decision.

NFR2: Core artifacts must be parseable by future AI agents without relying on prior chat context.

NFR3: Core artifacts must remain readable by engineers, not only machines.

NFR4: v1 must work across common local repositories without hosted service dependency.

NFR5: PRD IDs, Task IDs, Journal entries, and Project State must preserve trace from intent to execution result.

NFR6: Destructive actions require explicit command contract and Journal entry.

NFR7: Engines should expose boundaries for future provider adapters and tool-specific integrations.

NFR8: CLI operations on typical small-to-medium projects should complete setup/status operations within interactive CLI expectations.

NFR9: Any generated UI guidance must require WCAG-aware behavior for user-facing products.

NFR10: Runtime decisions, gate denials, validation failures, and overrides must be inspectable through Journal and Project State.

### Additional Requirements

- Starter template: oclif TypeScript CLI starter using `npx oclif generate mugiew-method`.
- Runtime baseline: Node.js 24 LTS.
- Language: TypeScript.
- CLI framework: oclif for `packages/cli`.
- Package manager: pnpm workspace.
- State validation: Zod schemas in `packages/core`.
- Test runner: Vitest.
- Validation command orchestration: Execa.
- Project persistence: local filesystem under `_mugiew-method/` plus root `AGENTS.md`.
- Write safety: atomic safe-write policy with explicit overwrite rules.
- Package architecture: framework-independent engines plus thin CLI adapter.
- Required packages: `packages/core`, `packages/cli`, `packages/discovery-engine`, `packages/governance-engine`, `packages/execution-engine`.
- CLI commands must call engine services and must not contain business logic.
- All JSON state files must include `schemaVersion` and `updatedAt`.
- MVP blocks unsupported schema versions with clear migration error.
- No hosted backend, auth, RBAC, database, or external API in MVP.
- Shell command execution must be explicit, logged, and task-bound.
- Domain errors must include code, message, details, recoverable, and suggestedAction.
- CLI exit codes must distinguish success, generic failure, validation failure, gate denied, unsafe write denied, unsupported schema version, and task blocked.
- Journal entries must record gate denials, force mode, destructive actions, validation failures, approved exceptions, task events, and review results.
- Fixture-based tests must cover install, status, gate denial, task graph, and state drift.
- Exact JSON schemas, Confidence Gate formula, force mode policy, validation command allowlist, and package versions remain implementation details to define in stories.

### UX Design Requirements

No UX Design document exists. MVP UX requirements are CLI/docs/AI-command UX only:

UX-DR1: CLI output must be concise, human-readable by default, and provide exact failed gate conditions for denials.

UX-DR2: Status-like commands should support machine-readable JSON output where specified.

UX-DR3: Long-running commands should use step-based status lines such as checking state, validating schemas, evaluating gates, and writing journal entries.

UX-DR4: Generated UI governance rules must discourage excessive glassmorphism, unnecessary gradients, oversized rounded corners, generic dashboard cards, decorative layouts, and fake-modern interfaces.

UX-DR5: Generated UI governance rules must require loading, empty, error, disabled, responsive, and accessibility states when target projects include UI.

### FR Coverage Map

FR1: Epic 1 - install project structure

FR2: Epic 1 - detect existing installation

FR3: Epic 2 - `/create-prd` discovery entry

FR4: Epic 3 - `/approve-prd` approval gate

FR5: Epic 6 - `/yolo-run` runtime entry

FR6: Epic 5 - `/project-status` inspection

FR7: Epic 5 - `/review-project` review

FR8: Epic 4 - `/rebuild-tasks` regeneration

FR9: Epic 2 - conversational discovery

FR10: Epic 2 - concern coverage

FR11: Epic 2 - contradiction/risk challenge

FR12: Epic 2 - ambiguity classification

FR13: Epic 2 - ambiguity persistence

FR14: Epic 2 - confidence calculation

FR15: Epic 3 - phase gate enforcement

FR16: Epic 3 - PRD artifact generation

FR17: Epic 3 - specification artifact generation

FR18: Epic 3 - root `AGENTS.md` generation

FR19: Epic 5 - validate against `AGENTS.md`

FR20: Epic 4 - granular task generation

FR21: Epic 4 - dependency graph maintenance

FR22: Epic 6 - execute unblocked tasks

FR23: Epic 6 - stop safely

FR24: Epic 6 - self-review before completion

FR25: Epic 5 - architecture drift detection

FR26: Epic 3 - UI governance rules

## Epic List

### Epic 1: Project Bootstrap & File Contract Foundation

User can install Mugiew Method into a repository and get a safe, deterministic project-local structure that future commands can trust.

**FRs covered:** FR1, FR2

### Epic 2: Discovery, Ambiguity & Confidence Readiness

User can run discovery flow that captures answers, classifies ambiguity, tracks concern coverage, and calculates readiness confidence before implementation.

**FRs covered:** FR3, FR9, FR10, FR11, FR12, FR13, FR14

### Epic 3: Governance Artifacts & Approval Gates

User can generate PRD/spec/rules/AGENTS artifacts and approve specifications only when readiness gates pass.

**FRs covered:** FR4, FR15, FR16, FR17, FR18, FR26

### Epic 4: Task Graph & Execution Planning

User can generate granular implementation tasks and dependency graph from approved specifications.

**FRs covered:** FR8, FR20, FR21

### Epic 5: Project Status, Review & Drift Detection

User can inspect project health and run review checks for rules, architecture drift, task claims, and validation gaps.

**FRs covered:** FR6, FR7, FR19, FR25

### Epic 6: YOLO-RUN Runtime & Self-Review Enforcement

User can run controlled autonomous execution that selects unblocked tasks, validates work, performs self-review, updates Journal, and stops safely on blockers.

**FRs covered:** FR5, FR22, FR23, FR24

### Epic 7: Launch Hardening & Release Readiness

User can rely on Mugiew Method as a launch-ready CLI package with stronger approval integrity, safer validation execution, richer project review, explicit discovery runtime scope, and release packaging support.

**FRs covered:** FR1, FR3, FR5, FR6, FR7, FR8, FR9, FR15, FR22, NFR1, NFR4, NFR6, NFR10

## Epic 1: Project Bootstrap & File Contract Foundation

User can install Mugiew Method into a repository and get a safe, deterministic project-local structure that future commands can trust.

### Story 1.1: Set Up Initial Project from oclif Starter Template

As an AI-native Engineer,
I want the Mugiew Method repository initialized as a TypeScript CLI workspace,
So that future implementation can follow the approved architecture.

**Acceptance Criteria:**

**Requirements:** FR1, FR2

**Given** a fresh Mugiew Method source repository
**When** the workspace foundation is created
**Then** the repository uses Node.js 24 LTS, TypeScript, pnpm workspace, and oclif for `packages/cli`
**And** `packages/core`, `packages/cli`, `packages/discovery-engine`, `packages/governance-engine`, and `packages/execution-engine` exist with package-level `src/index.ts`
**And** business logic is not placed inside oclif command classes
**And** Vitest can discover package-level tests

### Story 1.2: Define Core File Contracts and Project Paths

As an Autonomous Project Maintainer,
I want core path and file contract definitions,
So that all engines read and write the same project-local structure.

**Acceptance Criteria:**

**Requirements:** FR1, FR2

**Given** `packages/core`
**When** file contract definitions are implemented
**Then** core exposes project paths for root `AGENTS.md`, `_mugiew-method/discovery`, `_mugiew-method/prd`, `_mugiew-method/tasks`, `_mugiew-method/journal`, `_mugiew-method/state`, and `_mugiew-method/rules`
**And** path helpers resolve relative to detected project root
**And** path helpers do not depend on `packages/cli`
**And** tests cover path resolution from nested working directories

### Story 1.3: Implement Safe Filesystem Writes

As an AI-native Engineer,
I want install and generation commands to write files safely,
So that Mugiew Method never silently destroys user-owned work.

**Acceptance Criteria:**

**Requirements:** FR1, FR2

**Given** a target file already exists
**When** a write is attempted without overwrite confirmation
**Then** the write is denied with `UnsafeWriteError`
**And** the original file content remains unchanged
**And** atomic write behavior prevents partial file output
**And** overwrite behavior requires explicit option or confirmed operation

### Story 1.4: Implement Install Command

As an AI-native Engineer,
I want to run `npx mugiew-method install`,
So that my repository receives Mugiew Method project structure and initial governance files.

**Acceptance Criteria:**

**Requirements:** FR1, FR2

**Given** a repository without Mugiew Method installed
**When** `mugiew-method install` runs
**Then** `_mugiew-method/` is created with required subdirectories
**And** root `AGENTS.md` is created from template if missing
**And** `state/project-state.json` is created with `schemaVersion`, `updatedAt`, install status, and package version
**And** command output lists created files
**And** install returns exit code `0`

### Story 1.5: Detect Existing Installation

As an AI-native Engineer,
I want repeated install runs to detect existing Mugiew Method state,
So that reinstall does not corrupt project governance artifacts.

**Acceptance Criteria:**

**Requirements:** FR2

**Given** an existing `_mugiew-method/` directory or root `AGENTS.md`
**When** `mugiew-method install` runs again
**Then** the command reports existing installation state
**And** no existing file is overwritten silently
**And** unsupported schema versions return `SchemaVersionError`
**And** tests cover fresh install, partial install, and existing install cases

## Epic 2: Discovery, Ambiguity & Confidence Readiness

User can run discovery flow that captures answers, classifies ambiguity, tracks concern coverage, and calculates readiness confidence before implementation.

### Story 2.1: Create Discovery State Contracts

As an AI-native Engineer,
I want typed discovery and ambiguity contracts,
So that discovery output is consistent across AI sessions and tools.

**Acceptance Criteria:**

**Requirements:** FR12, FR13

**Given** `packages/core`
**When** discovery schemas are implemented
**Then** `ambiguity-report.json` validates with Zod
**And** every Ambiguity has ID, category, source, impact, owner, status, and resolution fields
**And** categories include `blocking-ambiguity`, `non-blocking-ambiguity`, and `assumption`
**And** invalid ambiguity state returns `ValidationError`

### Story 2.2: Implement `/create-prd` Discovery Entry

As an AI-native Engineer,
I want `/create-prd` to start or resume discovery,
So that product understanding is captured before specification.

**Acceptance Criteria:**

**Requirements:** FR3, FR9, FR13

**Given** Mugiew Method is installed
**When** `/create-prd` is invoked through the CLI command contract
**Then** discovery state is created or resumed
**And** `discovery/answers.md`, `discovery/ambiguities.md`, `discovery/assumptions.md`, and `discovery/confidence-report.md` are created when missing
**And** the command cannot mark PRD approved
**And** missing installation returns a recoverable error with suggested install action

### Story 2.3: Track Concern Coverage

As an AI-native Engineer,
I want Discovery Engine to track hidden concern coverage,
So that important product risks are not missed during natural conversation.

**Acceptance Criteria:**

**Requirements:** FR10, FR12, FR14

**Given** discovery answers exist
**When** concern coverage is evaluated
**Then** applicable concerns are marked `covered`, `not-applicable`, or `unresolved`
**And** unresolved applicable concerns produce Ambiguity entries
**And** coverage includes security, performance, deployment, API, testing, error handling, maintainability, AI readability, observability, accessibility, and scalability where applicable
**And** concern coverage contributes inputs to confidence calculation

### Story 2.4: Classify Ambiguities and Assumptions

As an AI-native Engineer,
I want unknowns classified by execution risk,
So that only truly blocking issues stop the workflow.

**Acceptance Criteria:**

**Requirements:** FR11, FR12

**Given** discovery identifies unknowns or contradictions
**When** ambiguity classification runs
**Then** each item is classified as Blocking Ambiguity, Non-Blocking Ambiguity, or Assumption
**And** Blocking Ambiguity includes reason it blocks approval or execution
**And** Non-Blocking Ambiguity includes default handling strategy
**And** Assumption includes confirmation state

### Story 2.5: Detect Contradictions and Risky Decisions

As an AI-native Engineer,
I want the system to challenge contradictions and risky requirements,
So that bad decisions are visible before implementation.

**Acceptance Criteria:**

**Requirements:** FR11, FR12

**Given** user-provided discovery context contains conflicting or risky statements
**When** contradiction detection runs
**Then** conflict findings are logged with source and rationale
**And** unresolved contradictions become Blocking Ambiguities
**And** user overrides are recorded as decision provenance
**And** no override is applied silently

### Story 2.6: Calculate Confidence Report

As an AI-native Engineer,
I want a confidence score with contributing factors,
So that readiness is measurable instead of conversational.

**Acceptance Criteria:**

**Requirements:** FR14

**Given** ambiguity, concern coverage, architecture completeness, and dependency clarity inputs
**When** confidence calculation runs
**Then** `confidence-report.md` includes numeric score, factor breakdown, blocking count, and readiness state
**And** score changes when Blocking Ambiguity status changes
**And** score cannot report execution-ready while Blocking Ambiguity count is greater than `0`

## Epic 3: Governance Artifacts & Approval Gates

User can generate PRD/spec/rules/AGENTS artifacts and approve specifications only when readiness gates pass.

### Story 3.1: Generate PRD Artifact

As an AI-native Engineer,
I want a machine-readable PRD generated from discovery state,
So that downstream architecture and task planning have stable requirement IDs.

**Acceptance Criteria:**

**Requirements:** FR16

**Given** discovery state exists
**When** PRD generation runs
**Then** `_mugiew-method/prd/PRD.md` is created with stable IDs for FRs, NFRs, ACs, Constraints, Architecture Decisions, Open Questions, and Assumptions
**And** assumptions are indexed
**And** requirements are written as capabilities, not implementation details
**And** generated PRD references source discovery artifacts

### Story 3.2: Generate Specification Artifacts

As an Autonomous Project Maintainer,
I want supporting specification artifacts generated with explicit applicability,
So that future AI agents know which technical contracts exist.

**Acceptance Criteria:**

**Requirements:** FR17

**Given** PRD Artifact exists
**When** specification generation runs
**Then** architecture, technical spec, API contracts, database schema, execution plan, and testing strategy files are generated or marked not applicable
**And** generated artifacts reference PRD IDs
**And** non-applicable artifacts explain why they do not apply

### Story 3.3: Generate AGENTS.md Constitution

As an AI-native Engineer,
I want root `AGENTS.md` generated as AI Constitution,
So that implementation agents follow stable project rules.

**Acceptance Criteria:**

**Requirements:** FR18

**Given** Mugiew Method is installed
**When** governance artifact generation runs
**Then** root `AGENTS.md` includes architecture rules, coding standards, UI rules, maintainability standards, testing requirements, forbidden patterns, stack decisions, and AI execution constraints
**And** it states implementation must not begin before clarity gates pass
**And** it uses common Markdown readable by Codex, Claude, Cursor, and Antigravity

### Story 3.4: Generate Rules Templates

As an Autonomous Project Maintainer,
I want generated rule files under `_mugiew-method/rules`,
So that governance can be inspected and enforced by future agents.

**Acceptance Criteria:**

**Requirements:** FR18, FR26

**Given** governance generation runs
**When** rule templates are rendered
**Then** `coding-rules.md`, `architecture-rules.md`, `testing-rules.md`, and `ui-rules.md` exist
**And** UI rules include Uncodixfy-aligned anti-pattern avoidance
**And** UI rules require loading, empty, error, disabled, responsive, and accessibility states where UI exists

### Story 3.5: Enforce Approval Gate

As an AI-native Engineer,
I want `/approve-prd` to reject unsafe approval,
So that YOLO-RUN cannot begin from incomplete specifications.

**Acceptance Criteria:**

**Requirements:** FR4, FR15

**Given** PRD Artifact and confidence report exist
**When** `/approve-prd` runs
**Then** approval fails if Blocking Ambiguity count is greater than `0`
**And** approval fails if Confidence Gate threshold is unmet
**And** failure output names exact failed condition
**And** success records approval timestamp and approved artifact versions

### Story 3.6: Record Force Mode Policy

As an Autonomous Project Maintainer,
I want force mode policy explicit and logged,
So that risky bypasses are never invisible.

**Acceptance Criteria:**

**Requirements:** FR15

**Given** force mode is requested for an otherwise denied gate
**When** force mode policy is evaluated
**Then** explicit confirmation is required
**And** high-severity Journal entry is written when force proceeds
**And** force mode is disabled or unavailable unless policy allows it
**And** tests cover denied, confirmed, and unavailable force mode paths

## Epic 4: Task Graph & Execution Planning

User can generate granular implementation tasks and dependency graph from approved specifications.

### Story 4.1: Define Task File Contract

As an AI-native Engineer,
I want each Task to have a strict contract,
So that implementation work is traceable, testable, and safe for AI agents.

**Acceptance Criteria:**

**Requirements:** FR20

**Given** `packages/core`
**When** Task schema is implemented
**Then** Task files include ID, title, concern, source PRD IDs, dependencies, acceptance criteria, validation commands, expected files or areas, and rollback notes
**And** broad multi-concern tasks are rejected or flagged
**And** schema validation covers valid and invalid Task examples

### Story 4.2: Generate Granular Tasks

As an AI-native Engineer,
I want approved specifications decomposed into granular Tasks,
So that each implementation unit can be handled by one dev agent.

**Acceptance Criteria:**

**Requirements:** FR20

**Given** PRD and Specification Artifacts are approved
**When** Task generation runs
**Then** generated Tasks preserve `1 task = 1 implementation concern`
**And** every Task references at least one PRD ID
**And** every Task includes acceptance criteria and validation expectations
**And** generated Task IDs are stable and zero-padded

### Story 4.3: Maintain Dependency Graph

As an Autonomous Project Maintainer,
I want a machine-readable Task Graph,
So that autonomous execution only selects safe unblocked work.

**Acceptance Criteria:**

**Requirements:** FR21

**Given** generated Tasks exist
**When** dependency graph generation runs
**Then** `state/dependency-graph.json` records each Task and dependency status
**And** blocked Tasks cannot be selected by runtime helpers
**And** completed Tasks remain traceable to PRD IDs and Journal entries

### Story 4.4: Rebuild Tasks Safely

As an AI-native Engineer,
I want `/rebuild-tasks` to regenerate execution planning safely,
So that changed specs can update tasks without destroying completed history.

**Acceptance Criteria:**

**Requirements:** FR8, FR20, FR21

**Given** existing Tasks and dependency graph exist
**When** `/rebuild-tasks` runs
**Then** manual edits and completed task history are detected
**And** conflicts are surfaced before overwrite
**And** completed task history is preserved
**And** regeneration reason is recorded

## Epic 5: Project Status, Review & Drift Detection

User can inspect project health and run review checks for rules, architecture drift, task claims, and validation gaps.

### Story 5.1: Implement Project Status Command

As an AI-native Engineer,
I want `/project-status` to report current readiness and progress,
So that I can understand project state without reading every artifact manually.

**Acceptance Criteria:**

**Requirements:** FR6

**Given** Mugiew Method project state exists
**When** `/project-status` runs
**Then** output includes confidence score, ambiguity count, PRD status, task progress, active blockers, architecture health, and latest validation status
**And** default output is concise human-readable text
**And** `--json` output returns machine-readable status where supported
**And** contradictory Markdown/JSON state is reported as drift

### Story 5.2: Validate Work Against AGENTS.md

As an Autonomous Project Maintainer,
I want work checked against `AGENTS.md`,
So that implementation does not violate AI Constitution rules.

**Acceptance Criteria:**

**Requirements:** FR19

**Given** `AGENTS.md` and task output exist
**When** constitution validation runs
**Then** violations are reported with rule reference
**And** unresolved critical violations prevent done state
**And** approved exceptions are written to Journal

### Story 5.3: Detect Architecture Drift

As an Autonomous Project Maintainer,
I want architecture drift detected explicitly,
So that codebase consistency does not degrade over time.

**Acceptance Criteria:**

**Requirements:** FR25

**Given** implementation output and architecture rules exist
**When** drift detection runs
**Then** each drift finding includes expected rule, observed change, severity, and remediation
**And** approved drift requires Journal entry
**And** drifted state appears in `/project-status`

### Story 5.4: Implement Review Project Command

As an AI-native Engineer,
I want `/review-project` to run quality review without changing code,
So that I can inspect risk before continuing execution.

**Acceptance Criteria:**

**Requirements:** FR7, FR19, FR25

**Given** project artifacts and optional task output exist
**When** `/review-project` runs
**Then** review checks architecture drift, rule violations, task completion claims, and validation gaps
**And** review writes report to Journal
**And** review does not modify source code unless explicit fix mode is requested

## Epic 6: YOLO-RUN Runtime & Self-Review Enforcement

User can run controlled autonomous execution that selects unblocked tasks, validates work, performs self-review, updates Journal, and stops safely on blockers.

### Story 6.1: Enforce YOLO-RUN Gate Denial

As an AI-native Engineer,
I want `/yolo-run` denied when readiness is incomplete,
So that autonomous execution cannot start unsafely.

**Acceptance Criteria:**

**Requirements:** FR5, FR23

**Given** Project State is missing approval, has Blocking Ambiguities, or has insufficient confidence
**When** `/yolo-run` runs
**Then** command returns `YOLO-RUN DENIED`
**And** output names exact failed condition
**And** exit code maps to gate denied
**And** denial is written to Journal

### Story 6.2: Select Next Unblocked Task

As an Autonomous Project Maintainer,
I want YOLO-RUN to select only unblocked Tasks,
So that runtime execution follows the dependency graph.

**Acceptance Criteria:**

**Requirements:** FR22

**Given** approved Project State and Task Graph exist
**When** runtime selects work
**Then** only Tasks with satisfied dependencies are eligible
**And** selection records chosen Task ID and rationale
**And** no blocked Task can be selected

### Story 6.3: Run Task Validation Commands

As an AI-native Engineer,
I want runtime to run task-bound validation commands,
So that task completion is based on evidence.

**Acceptance Criteria:**

**Requirements:** FR22, FR23

**Given** a selected Task declares validation commands
**When** validation runner executes
**Then** commands run through approved Execa-based execution path
**And** command output and exit status are captured
**And** validation failures stop runtime and write Journal entry
**And** commands are task-bound and not invented by runtime

### Story 6.4: Run Self-Review Before Completion

As an Autonomous Project Maintainer,
I want every Task self-reviewed before done state,
So that code smell, duplication, drift, maintainability, type safety, lint, and tests are checked.

**Acceptance Criteria:**

**Requirements:** FR24

**Given** task implementation and validation output exist
**When** self-review runs
**Then** review report is written before done Journal entry
**And** critical findings prevent Task completion
**And** medium and low findings are tracked with disposition

### Story 6.5: Stop Runtime Safely and Update State

As an AI-native Engineer,
I want YOLO-RUN to stop safely on blockers or completion,
So that future agents know exactly what happened.

**Acceptance Criteria:**

**Requirements:** FR23, FR24

**Given** runtime reaches blocker, failed validation, pause, or completion
**When** runtime stops
**Then** Project State marks status as blocked, failed, paused, or complete
**And** Journal records stop reason and next suggested action
**And** runtime does not invent missing approvals
**And** future `/project-status` reflects runtime stop state

## Epic 7: Launch Hardening & Release Readiness

User can rely on Mugiew Method as a launch-ready CLI package with stronger approval integrity, safer validation execution, richer project review, explicit discovery runtime scope, and release packaging support.

### Story 7.1: Make CLI Package NPM Release Ready

As an AI-native Engineer,
I want `npx mugiew-method install` to work from a published package,
So that Mugiew Method can be installed outside the source workspace.

**Acceptance Criteria:**

**Requirements:** FR1, NFR4

**Given** a release candidate package
**When** it is packed or published
**Then** package manifest is publishable
**And** `mugiew-method` bin resolves from the published artifact
**And** internal dependencies resolve without workspace-only assumptions
**And** package includes license metadata and publish file controls
**And** a packaging smoke test validates `install` from the packed artifact

### Story 7.2: Validate Approval Record Integrity Before YOLO-RUN

As an Autonomous Project Maintainer,
I want YOLO-RUN to reject stale or malformed approvals,
So that execution cannot proceed after approved artifacts change.

**Acceptance Criteria:**

**Requirements:** FR5, FR15, NFR1, NFR10

**Given** an approval record exists
**When** YOLO-RUN evaluates readiness
**Then** approval record schema is validated
**And** current artifact versions are compared against approved artifact versions
**And** stale, malformed, or missing approval produces `YOLO-RUN DENIED`
**And** `/project-status` reports stale approval distinctly

### Story 7.3: Harden Validation Command Execution

As an AI-native Engineer,
I want task validation commands to have execution limits and explicit trust boundaries,
So that YOLO-RUN cannot hang or silently leak sensitive environment data.

**Acceptance Criteria:**

**Requirements:** FR22, FR23, NFR6

**Given** a task declares validation commands
**When** validation runner executes them
**Then** commands support timeout behavior
**And** captured output is bounded or explicitly truncated
**And** failure journals record timeout or output-limit reasons
**And** validation command trust boundary is documented
**And** tests cover success, failure, timeout, and truncation behavior

### Story 7.4: Make Project Review CLI Scan Relevant Files

As an Autonomous Project Maintainer,
I want `/review-project` to inspect actual project outputs,
So that AGENTS.md violations are detectable from CLI usage.

**Acceptance Criteria:**

**Requirements:** FR7, NFR10

**Given** project files or task expected files exist
**When** `/review-project` runs
**Then** CLI can collect review inputs from changed files, explicit paths, or task expected files
**And** review output distinguishes no scanned files from no violations
**And** review report includes scanned and skipped file counts
**And** CLI output summarizes finding categories

### Story 7.5: Add Dependency Graph Cycle Detection

As an AI-native Engineer,
I want dependency graph rebuild and runtime selection to detect cycles,
So that autonomous execution does not stall on opaque blocked states.

**Acceptance Criteria:**

**Requirements:** FR8, FR21, FR22, FR23

**Given** tasks contain cyclic dependencies
**When** dependency graph is parsed, rebuilt, or selected for runtime
**Then** cycle findings identify involved task IDs
**And** project status reports cycle blockers
**And** runtime task selection stops safely with cycle reason
**And** tests cover direct and indirect cycles

### Story 7.6: Clarify Discovery Runtime Scope

As an AI-native Engineer,
I want `/create-prd` behavior to clearly distinguish bootstrap primitives from full conversational discovery,
So that product claims and CLI behavior stay aligned.

**Acceptance Criteria:**

**Requirements:** FR3, FR9

**Given** `/create-prd` starts discovery
**When** current implementation creates or resumes discovery state
**Then** CLI output names the current discovery phase accurately
**And** documentation states whether adaptive interrogation is implemented or pending
**And** if adaptive runtime is deferred, backlog records it explicitly
**And** if implemented, answer provenance updates ambiguity and confidence state
