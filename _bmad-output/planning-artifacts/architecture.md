---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md
  - _bmad-output/planning-artifacts/prds/prd-mugiew-method-2026-05-24/addendum.md
workflowType: architecture
project_name: mugiew-method
user_name: Mugiew
date: 2026-05-24
lastStep: 8
status: complete
completedAt: 2026-05-24
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Mugiew Method contains 26 functional requirements across installation, command contracts, discovery, ambiguity classification, confidence gating, specification generation, AGENTS.md governance, task graph management, YOLO-RUN execution, self-review, and UI governance. Architecturally, this points to a project-local CLI and file-contract system with deterministic state transitions. The system must treat documentation, state, task planning, and runtime behavior as coordinated artifacts, not separate outputs.

**Non-Functional Requirements:**
The strongest architecture drivers are reliability, AI readability, human readability, portability, traceability, safety, extensibility, performance, accessibility guidance, and observability. Reliability and traceability are the dominant constraints: same Project State must produce same readiness decision, and every implementation step must remain traceable from PRD ID to Task ID to Journal entry.

**Scale & Complexity:**
Mugiew Method is a high-complexity developer tooling product. It has no hosted multi-tenant backend in MVP, but it does have a non-trivial local runtime, state model, schema contracts, validation flow, and governance loop.

- Primary domain: CLI developer tooling / autonomous AI workflow protocol
- Complexity level: high
- Estimated architectural components: CLI, filesystem adapter, schema validator, state store, discovery workflow, ambiguity engine, confidence engine, specification generator, AGENTS.md generator, task engine, dependency graph engine, YOLO-RUN runtime, review engine, journal engine, command registry

### Technical Constraints & Dependencies

- v1 must support `npx mugiew-method install`.
- v1 should use TypeScript + Node.js unless later architecture review rejects it.
- v1 is project-local first and must not require hosted service state.
- Root `AGENTS.md` is mandatory.
- `_mugiew-method/` file structure is a public contract.
- Markdown and JSON artifacts must remain consistent or drift must be reported.
- User files must not be overwritten silently.
- YOLO-RUN must be denied unless readiness gate passes.
- Task generation must preserve `1 task = 1 implementation concern`.

### Cross-Cutting Concerns Identified

- Deterministic Project State and gate evaluation
- File contract versioning and migrations
- Markdown/JSON drift detection
- Safe writes and overwrite policy
- Schema validation for state files
- AI-readable document structure
- Journal and decision provenance
- Validation command orchestration
- Architecture drift detection
- Provider/tool portability
- Extensible package boundaries

## Starter Template Evaluation

### Primary Technology Domain

CLI developer tooling / autonomous AI workflow protocol.

Mugiew Method is not a web app, mobile app, or hosted backend in MVP. The foundation should be a TypeScript + Node.js CLI package that can publish to npm and run through `npx mugiew-method install`.

### Starter Options Considered

#### Option 1: oclif TypeScript CLI starter

oclif is a Node.js/TypeScript CLI framework with generator support, subcommands, hooks, plugins, command testing, and auto-documentation. It fits Mugiew Method because command lifecycle and future extension points matter.

Strengths:
- Good fit for multi-command CLI.
- TypeScript-first generator.
- Built-in command structure.
- Plugin/hook model can support future adapters.
- Mature enough for serious developer tooling.

Risks:
- More framework structure than a tiny CLI needs.
- Some architecture must stay outside oclif so core engines remain framework-independent.

#### Option 2: Commander + custom TypeScript starter

Commander is mature and lightweight. It fits simple CLI parsing, but Mugiew Method needs more than argument parsing: command lifecycle, generated docs, extension boundaries, and future provider adapters.

Strengths:
- Lightweight.
- Mature.
- Easy to reason about.
- Less framework lock-in.

Risks:
- More custom architecture needed.
- Plugin/hook behavior must be designed manually.
- Higher chance of ad hoc command growth.

#### Option 3: CAC + custom TypeScript starter

CAC is small and simple, but less appropriate for launch-grade governance tooling because Mugiew Method benefits from stronger conventions and maintained scaffolding.

Strengths:
- Very lightweight.
- Simple API.

Risks:
- Published history appears older.
- Too little structure for this product's command/runtime needs.

### Selected Starter: oclif TypeScript CLI starter + framework-independent core packages

**Rationale for Selection:**
Use oclif for the CLI shell, but keep Mugiew Method engines in separate packages so the core architecture is not coupled to oclif. This gives v1 a professional CLI foundation while preserving long-term portability.

**Initialization Command:**

```bash
npx oclif generate mugiew-method
```

During implementation, generated structure should be adapted into a workspace layout where `packages/cli` owns oclif integration and core engines live outside it.

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript + Node.js, npm-publishable, NPX-compatible.

**CLI Framework:**
oclif command framework for command parsing, command classes, help output, hooks, and future plugin-style extension.

**Build Tooling:**
Use oclif-generated build setup initially, then align workspace build with package architecture.

**Testing Framework:**
Use oclif command testing where useful, but core engines must have framework-independent unit tests.

**Code Organization:**
CLI command handlers should be thin adapters. Business logic belongs in core packages:
- `packages/core`
- `packages/discovery-engine`
- `packages/governance-engine`
- `packages/execution-engine`
- `packages/cli`

**Development Experience:**
Starter provides command development workflow, generated help, and a known CLI shape. Mugiew Method adds schema validation, state contracts, safe filesystem writes, and deterministic runtime behavior.

**Note:**
Project initialization using this command should be the first implementation story, but architecture must immediately separate CLI adapter code from engine code.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Runtime baseline: Node.js 24 LTS.
- Language: TypeScript.
- CLI framework: oclif for `packages/cli`.
- Package architecture: workspace monorepo with framework-independent engines.
- State validation: Zod schemas in `packages/core`.
- Project persistence: local filesystem under `_mugiew-method/` plus root `AGENTS.md`.
- Write safety: atomic safe-write policy with explicit overwrite rules.
- Gate logic: deterministic Project State evaluation.
- Command execution: thin CLI commands call engine services.

**Important Decisions (Shape Architecture):**
- Package manager: pnpm workspace.
- Test runner: Vitest for core packages and CLI behavior tests.
- Process execution: Execa for validation command orchestration.
- Build: package-level TypeScript builds; starter build can be retained for `packages/cli`.
- Documentation contracts: Markdown generated from typed contract models where possible.
- Migration policy: versioned file contracts with guardrails in MVP, full migration engine after MVP.

**Deferred Decisions (Post-MVP):**
- Hosted dashboard.
- Cloud sync.
- Enterprise RBAC.
- Provider-specific adapters for every AI IDE.
- Plugin marketplace.
- Full visual UI.

### Data Architecture

Mugiew Method uses project-local files as its persistence layer.

**Decision: Local filesystem state store**
- Source files live under `_mugiew-method/`.
- Root `AGENTS.md` lives at repository root.
- JSON files hold deterministic machine state.
- Markdown files hold human/AI-readable context.

**Rationale:**
MVP must work without hosted infrastructure and must remain portable across Codex, Claude, Cursor, and Antigravity.

**State files:**
- `_mugiew-method/state/project-state.json`
- `_mugiew-method/state/ambiguity-report.json`
- `_mugiew-method/state/dependency-graph.json`
- `_mugiew-method/state/execution-metrics.json`

**Validation Strategy:**
Use Zod schemas in `packages/core` for all JSON contracts.

**Migration Strategy:**
Every state file includes `schemaVersion`. MVP blocks unsupported schema versions with clear migration error. Full automatic migrations can be added after MVP.

**Caching Strategy:**
No persistent cache in MVP. Runtime can use in-memory derived state during a command execution, but must write authoritative state back to files.

### Authentication & Security

No user authentication in MVP because product is local CLI tooling.

**Decision: No auth layer for MVP**
- No accounts.
- No hosted identity.
- No RBAC.
- No remote API tokens required for core operation.

**Security Decisions:**
- Safe filesystem writes are mandatory.
- No silent overwrite.
- Destructive operations require explicit confirmation or force flag.
- Shell command execution must be explicit, logged, and task-bound.
- Journal records force mode, overwrite, destructive action, validation failure, and approval exception.

**Data Protection:**
Mugiew Method should avoid storing secrets. If future provider adapters need credentials, they must use environment variables or existing platform credential stores, not `_mugiew-method/`.

### API & Communication Patterns

No network API in MVP.

**Decision: Internal service interfaces, not HTTP APIs**
- CLI commands call application services directly.
- Engine packages expose typed TypeScript APIs.
- Public external contract is CLI + file contract, not REST/GraphQL.

**Command Architecture:**
- `packages/cli`: oclif commands and terminal UX.
- `packages/core`: schemas, domain types, file contracts, safe filesystem primitives.
- `packages/discovery-engine`: discovery workflow, ambiguity classification, confidence inputs.
- `packages/governance-engine`: PRD/spec generation, AGENTS.md/rules generation, approval gates.
- `packages/execution-engine`: task graph, YOLO-RUN orchestration, review checks, journal updates.

**Error Handling Standard:**
Use typed domain errors:
- `InstallError`
- `ValidationError`
- `GateDeniedError`
- `SchemaVersionError`
- `DriftDetectedError`
- `TaskBlockedError`
- `UnsafeWriteError`
- `CommandExecutionError`

CLI maps domain errors to stable exit codes and readable messages.

### Frontend Architecture

No visual frontend in MVP.

**Decision: CLI-first UX**
- Human interaction is command-line output plus generated Markdown.
- Generated UI governance exists as rules for target projects, not Mugiew Method UI.
- Future dashboard must be separate from core engines.

**CLI Output Pattern:**
- Default output: concise human-readable text.
- Optional machine output: `--json` for status-like commands.
- Denials must include exact failed gate condition.

### Infrastructure & Deployment

**Decision: npm package distribution**
- Publish `mugiew-method` package to npm.
- Support `npx mugiew-method install`.

**Runtime Baseline:**
- Node.js 24 LTS.
- ESM-first TypeScript package structure.

**CI/CD:**
- Typecheck, lint, unit tests, CLI integration tests.
- Fixture-based tests for install, status, gate denial, task graph, and state drift.

**Observability:**
- No hosted telemetry in MVP.
- Local journal is the observability mechanism.
- Optional debug logs can be enabled with environment flag.

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize oclif + workspace.
2. Create `packages/core` with schemas, contracts, safe filesystem writes.
3. Implement install command.
4. Implement Project State read/write.
5. Implement Ambiguity and Confidence Gate schemas.
6. Implement command contracts.
7. Implement Task Graph and Journal.
8. Implement YOLO-RUN gate denial before autonomous execution.
9. Add Self-Review Engine hooks.
10. Add drift detection.

**Cross-Component Dependencies:**
- CLI depends on all engines.
- Engines depend on `packages/core`.
- Governance Engine depends on Discovery Engine outputs.
- Execution Engine depends on Governance Engine approval state and Task Graph.
- Self-Review Engine depends on `AGENTS.md`, rules, Task metadata, validation outputs, and Project State.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
Mugiew Method has 12 major areas where AI agents could make incompatible choices:
1. Package boundaries
2. File naming
3. Type/schema ownership
4. JSON field naming
5. Markdown artifact structure
6. Error classes and exit codes
7. Safe write behavior
8. Command handler shape
9. State transition rules
10. Journal entry format
11. Validation command execution
12. Test placement and fixture design

### Naming Patterns

**Database Naming Conventions:**
Not applicable for MVP. Mugiew Method has no database in MVP.

If future hosted mode adds database persistence:
- Tables: plural snake_case, e.g. `project_states`
- Columns: snake_case, e.g. `schema_version`
- Indexes: `idx_<table>_<field>`, e.g. `idx_project_states_project_id`

**API Naming Conventions:**
No REST/GraphQL API in MVP.

Internal TypeScript service APIs use:
- Methods: camelCase verbs, e.g. `evaluateGate`, `writeProjectState`, `loadTaskGraph`
- Types/interfaces: PascalCase nouns, e.g. `ProjectState`, `GateDecision`
- Domain errors: PascalCase ending in `Error`, e.g. `GateDeniedError`

**Code Naming Conventions:**
- Files: kebab-case, e.g. `project-state.ts`, `safe-write.ts`
- Test files: same basename with `.test.ts`, e.g. `project-state.test.ts`
- Types: PascalCase, e.g. `AmbiguityReport`
- Functions: camelCase verb phrases, e.g. `classifyAmbiguity`
- Constants: SCREAMING_SNAKE_CASE only for true constants, e.g. `CURRENT_SCHEMA_VERSION`
- Package names: kebab-case under `packages/`, e.g. `discovery-engine`

### Structure Patterns

**Project Organization:**
- `packages/core`: schemas, domain types, error types, safe filesystem utilities, shared contracts
- `packages/cli`: oclif commands only; no business logic
- `packages/discovery-engine`: answers, ambiguity classification, confidence inputs
- `packages/governance-engine`: PRD/spec generation, `AGENTS.md`, rules, approvals
- `packages/execution-engine`: task graph, YOLO-RUN orchestration, review, journal
- `fixtures/`: integration fixtures for generated project states
- `docs/`: internal project documentation

**File Structure Patterns:**
Within each package:
- `src/index.ts` exports public package API.
- `src/**` contains implementation.
- Tests are co-located with implementation as `*.test.ts`.
- Fixtures live in root `fixtures/` when shared across packages.
- Package-local fixtures live in `packages/<name>/fixtures/`.

**Boundary Rule:**
`packages/cli` may import engines. Engines must not import `packages/cli`.

### Format Patterns

**JSON State Formats:**
All JSON contract files use camelCase fields.

Required common fields:
```json
{
  "schemaVersion": "1.0.0",
  "updatedAt": "2026-05-24T00:00:00.000Z"
}
```

Rules:
- Dates use ISO 8601 strings.
- IDs use uppercase prefixes plus zero-padded numbers where user-facing, e.g. `TASK-001`, `AMB-001`.
- Machine enum values use lowercase kebab-case, e.g. `blocking-ambiguity`, `non-blocking-ambiguity`.

**Markdown Artifact Formats:**
Markdown artifacts use stable headings and IDs:
- Functional requirements: `FR-1`
- Acceptance criteria: `AC-1`
- Architecture decisions: `AD-1`
- Tasks: `TASK-001`
- Ambiguities: `AMB-001`

AI-readable sections must avoid clever prose when structured lists are clearer.

**API Response Formats:**
Not applicable externally in MVP.

Internal command result format:
```ts
type CommandResult<T> = {
  ok: true
  data: T
  warnings: Warning[]
} | {
  ok: false
  error: DomainError
  warnings: Warning[]
}
```

### Communication Patterns

**Event System Patterns:**
No event bus in MVP.

Internal lifecycle names use lowercase kebab-case:
- `install-started`
- `install-completed`
- `gate-denied`
- `task-started`
- `task-completed`
- `task-blocked`
- `review-failed`

Events are written as Journal entries, not emitted to a distributed system.

**State Management Patterns:**
State is immutable per command execution:
1. Read current state.
2. Validate schema.
3. Compute next state.
4. Write atomically.
5. Re-read if verification is required.

No in-place mutation of parsed state objects across service boundaries.

### Process Patterns

**Error Handling Patterns:**
All domain errors include:
- `code`
- `message`
- `details`
- `recoverable`
- `suggestedAction`

Example:
```ts
{
  code: "GATE_DENIED",
  message: "YOLO-RUN denied because PRD is not approved.",
  details: { prdStatus: "draft" },
  recoverable: true,
  suggestedAction: "Run /approve-prd after resolving blocking ambiguities."
}
```

CLI maps errors to exit codes:
- `0`: success
- `1`: generic failure
- `2`: validation failure
- `3`: gate denied
- `4`: unsafe write denied
- `5`: schema version unsupported
- `6`: task blocked

**Loading State Patterns:**
CLI MVP does not need UI loading states. Long-running commands use step-based status lines:
- `Checking project state...`
- `Validating schemas...`
- `Evaluating confidence gate...`
- `Writing journal entry...`

**Journal Patterns:**
Journal entries use Markdown with frontmatter:
```md
---
id: JOURNAL-001
type: gate-denied
createdAt: 2026-05-24T00:00:00.000Z
relatedTask: null
severity: high
---

# YOLO-RUN Denied

## Cause
PRD status is `draft`.

## Suggested Action
Run `/approve-prd` after resolving blocking ambiguities.
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Keep business logic outside `packages/cli`.
- Validate JSON state with Zod before use.
- Use camelCase for JSON fields.
- Use kebab-case for file names.
- Use atomic safe writes for project artifacts.
- Record gate denials, force mode, destructive actions, validation failures, and approved exceptions in Journal.
- Preserve PRD ID to Task ID to Journal traceability.
- Stop instead of guessing when Project State is contradictory.

**Pattern Enforcement:**
- Unit tests enforce schemas and error shapes.
- Fixture tests enforce generated file structures.
- CLI integration tests enforce command outcomes.
- Review Engine flags pattern violations.
- Architecture drift findings are written to Journal.

### Pattern Examples

**Good Examples:**
- `packages/core/src/project-state.ts`
- `packages/core/src/project-state.test.ts`
- `packages/execution-engine/src/evaluate-gate.ts`
- `TASK-001-project-foundation.md`
- `AMB-001-missing-deployment-target`

**Anti-Patterns:**
- Putting install business logic directly inside an oclif command class.
- Writing JSON without schema validation.
- Creating broad tasks like `auth-and-dashboard`.
- Marking task done before self-review.
- Overwriting `AGENTS.md` without conflict detection.
- Using chat memory as source of truth instead of Project State.

## Project Structure & Boundaries

### Complete Project Directory Structure

```txt
mugiew-method/
├── README.md
├── LICENSE
├── AGENTS.md
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.js
├── vitest.config.ts
├── .gitignore
├── .npmrc
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── architecture.md
│   ├── file-contracts.md
│   ├── command-contracts.md
│   └── contributing.md
├── fixtures/
│   ├── empty-project/
│   ├── installed-project/
│   ├── draft-prd-project/
│   ├── approved-prd-project/
│   ├── blocked-task-project/
│   └── drifted-state-project/
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── contracts/
│   │       │   ├── ambiguity-report.ts
│   │       │   ├── dependency-graph.ts
│   │       │   ├── execution-metrics.ts
│   │       │   ├── journal-entry.ts
│   │       │   ├── project-state.ts
│   │       │   └── task-file.ts
│   │       ├── errors/
│   │       │   ├── command-execution-error.ts
│   │       │   ├── drift-detected-error.ts
│   │       │   ├── gate-denied-error.ts
│   │       │   ├── schema-version-error.ts
│   │       │   ├── task-blocked-error.ts
│   │       │   ├── unsafe-write-error.ts
│   │       │   └── validation-error.ts
│   │       ├── filesystem/
│   │       │   ├── project-paths.ts
│   │       │   ├── safe-read.ts
│   │       │   ├── safe-write.ts
│   │       │   └── workspace-detector.ts
│   │       ├── ids/
│   │       │   └── ids.ts
│   │       └── result/
│   │           └── command-result.ts
│   ├── cli/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── bin/
│   │   │   └── run.js
│   │   └── src/
│   │       ├── index.ts
│   │       ├── commands/
│   │       │   ├── install.ts
│   │       │   ├── create-prd.ts
│   │       │   ├── approve-prd.ts
│   │       │   ├── yolo-run.ts
│   │       │   ├── project-status.ts
│   │       │   ├── review-project.ts
│   │       │   └── rebuild-tasks.ts
│   │       ├── output/
│   │       │   ├── format-error.ts
│   │       │   ├── format-json.ts
│   │       │   └── format-status.ts
│   │       └── adapters/
│   │           └── oclif-command-adapter.ts
│   ├── discovery-engine/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── ambiguity-classifier.ts
│   │       ├── confidence-calculator.ts
│   │       ├── concern-coverage.ts
│   │       ├── discovery-session.ts
│   │       └── prompt-contracts.ts
│   ├── governance-engine/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── agents-generator.ts
│   │       ├── approval-gate.ts
│   │       ├── prd-generator.ts
│   │       ├── rules-generator.ts
│   │       ├── specification-generator.ts
│   │       └── template-renderer.ts
│   └── execution-engine/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── architecture-drift-detector.ts
│           ├── dependency-graph.ts
│           ├── journal-writer.ts
│           ├── review-engine.ts
│           ├── task-selector.ts
│           ├── validation-runner.ts
│           └── yolo-runtime.ts
└── templates/
    ├── AGENTS.md
    ├── discovery/
    │   ├── answers.md
    │   ├── ambiguities.md
    │   ├── assumptions.md
    │   └── confidence-report.md
    ├── prd/
    │   ├── PRD.md
    │   ├── architecture.md
    │   ├── technical-spec.md
    │   ├── api-contracts.md
    │   ├── database-schema.md
    │   ├── execution-plan.md
    │   └── testing-strategy.md
    ├── rules/
    │   ├── architecture-rules.md
    │   ├── coding-rules.md
    │   ├── testing-rules.md
    │   └── ui-rules.md
    ├── state/
    │   ├── ambiguity-report.json
    │   ├── dependency-graph.json
    │   ├── execution-metrics.json
    │   └── project-state.json
    └── tasks/
        └── task-template.md
```

### Architectural Boundaries

**CLI Boundary:**
`packages/cli` owns command parsing, terminal output, flags, and exit codes. It must not own product behavior.

**Core Boundary:**
`packages/core` owns contracts shared by every engine: schemas, errors, result types, IDs, safe file IO, and project path detection.

**Discovery Boundary:**
`packages/discovery-engine` owns discovery sessions, concern coverage, ambiguity classification, and confidence calculation inputs.

**Governance Boundary:**
`packages/governance-engine` owns generated PRD artifacts, specs, rules, `AGENTS.md`, and approval gates.

**Execution Boundary:**
`packages/execution-engine` owns task graph, task selection, YOLO-RUN orchestration, validation runner, review engine, journal writing, and architecture drift detection.

**Data Boundary:**
Only `packages/core` should define schemas for `_mugiew-method/state/*.json`. Engines can read/write through core helpers, not custom JSON parsing.

### Requirements to Structure Mapping

**Installation and Bootstrap (FR-1, FR-2):**
- `packages/cli/src/commands/install.ts`
- `packages/core/src/filesystem/*`
- `templates/**`

**Command Interface (FR-3 to FR-8):**
- `packages/cli/src/commands/*`
- `packages/cli/src/output/*`

**Discovery Engine (FR-9 to FR-11):**
- `packages/discovery-engine/src/discovery-session.ts`
- `packages/discovery-engine/src/concern-coverage.ts`

**Ambiguity Classification (FR-12, FR-13):**
- `packages/discovery-engine/src/ambiguity-classifier.ts`
- `packages/core/src/contracts/ambiguity-report.ts`

**Confidence Gate (FR-14, FR-15):**
- `packages/discovery-engine/src/confidence-calculator.ts`
- `packages/governance-engine/src/approval-gate.ts`

**PRD and Specification Generation (FR-16, FR-17):**
- `packages/governance-engine/src/prd-generator.ts`
- `packages/governance-engine/src/specification-generator.ts`
- `packages/governance-engine/src/template-renderer.ts`

**AGENTS.md Constitution (FR-18, FR-19):**
- `packages/governance-engine/src/agents-generator.ts`
- `packages/governance-engine/src/rules-generator.ts`
- `packages/execution-engine/src/architecture-drift-detector.ts`

**Task System and Task Graph (FR-20, FR-21):**
- `packages/core/src/contracts/task-file.ts`
- `packages/core/src/contracts/dependency-graph.ts`
- `packages/execution-engine/src/dependency-graph.ts`
- `packages/execution-engine/src/task-selector.ts`

**YOLO-RUN Runtime (FR-22, FR-23):**
- `packages/execution-engine/src/yolo-runtime.ts`
- `packages/execution-engine/src/validation-runner.ts`
- `packages/execution-engine/src/journal-writer.ts`

**Self-Review Engine (FR-24, FR-25):**
- `packages/execution-engine/src/review-engine.ts`
- `packages/execution-engine/src/architecture-drift-detector.ts`

**UI Governance (FR-26):**
- `templates/rules/ui-rules.md`
- `packages/governance-engine/src/rules-generator.ts`

### Integration Points

**Internal Communication:**
CLI commands call engine service functions. Engines return `CommandResult<T>` and domain errors. Engines do not print to terminal.

**External Integrations:**
No external integrations in MVP. Future AI-tool adapters must depend on engine APIs, not internal CLI command classes.

**Data Flow:**
1. CLI receives command.
2. CLI resolves project root.
3. Core loads and validates state.
4. Engine computes next action/result.
5. Core writes files atomically.
6. Execution Engine writes Journal when action changes governance/execution state.
7. CLI formats result.

### File Organization Patterns

**Configuration Files:**
Root holds workspace configs: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.js`, `vitest.config.ts`.

**Source Organization:**
Package source lives under `packages/<name>/src`. Each package exports public API from `src/index.ts`.

**Test Organization:**
Unit tests are co-located as `*.test.ts`. Shared integration fixtures live under `fixtures/`.

**Asset Organization:**
Generated project templates live under `templates/`. No visual/static assets in MVP.

### Development Workflow Integration

**Development Server Structure:**
No dev server required. Development workflow is CLI execution and tests.

**Build Process Structure:**
Workspace build compiles packages. CLI package produces npm executable.

**Deployment Structure:**
Deployment means npm package publish. CI must validate package build and command smoke tests before publish.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
Architecture coherent. Node.js 24 LTS, TypeScript, oclif, pnpm workspace, Zod, Vitest, and Execa fit the CLI/local-runtime product shape. oclif is isolated to `packages/cli`, so core engines remain portable. Project-local persistence aligns with PRD constraints and avoids hosted SaaS scope creep.

**Pattern Consistency:**
Patterns support decisions. Kebab-case files, camelCase JSON fields, Zod schemas, domain errors, atomic writes, and Journal-first observability all reinforce deterministic execution and AI readability.

**Structure Alignment:**
Project structure supports architecture. `packages/core` owns shared contracts, engines own domain behavior, and `packages/cli` remains adapter-only. `_mugiew-method/` templates map directly to PRD file contracts.

### Requirements Coverage Validation ✅

**Feature Coverage:**
All major feature groups have architectural homes:
- Install/bootstrap → CLI + core filesystem + templates
- Commands → CLI command handlers + engine APIs
- Discovery → discovery-engine
- Ambiguity/confidence → discovery-engine + core contracts
- PRD/spec/rules/AGENTS → governance-engine
- Task graph/runtime/review/journal → execution-engine
- UI governance → templates/rules + governance-engine

**Functional Requirements Coverage:**
FR-1 through FR-26 have structure mapping. No FR is unsupported.

**Non-Functional Requirements Coverage:**
- Reliability → deterministic Project State + gate evaluation
- AI readability → Markdown contracts + stable IDs
- Human readability → generated Markdown artifacts
- Portability → local files + npm CLI
- Traceability → PRD ID → Task ID → Journal
- Safety → safe writes + explicit destructive action policy
- Extensibility → engine packages + CLI adapter boundary
- Performance → no network dependency, in-memory derived state
- Accessibility guidance → UI rules template
- Observability → Journal + status output

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical decisions are documented with versions or version lines where relevant. Exact dependency versions should still be pinned during implementation.

**Structure Completeness:**
Directory tree is specific enough for first implementation. Package boundaries, commands, contracts, templates, fixtures, tests, and CI locations are defined.

**Pattern Completeness:**
Major agent conflict points are covered: naming, structure, JSON shape, Markdown IDs, errors, safe writes, command result shape, Journal format, and test placement.

### Gap Analysis Results

**Critical Gaps:**
None blocking architecture.

**Important Gaps:**
- Exact JSON schemas still need implementation detail in `packages/core`.
- Exact Confidence Gate formula still needs definition.
- Exact force mode policy needs final product decision.
- Exact validation command allowlist/sandbox policy needs definition before full YOLO-RUN implementation.
- Exact package versions should be pinned during implementation.

**Nice-to-Have Gaps:**
- Add diagrams later: package dependency graph, command lifecycle, state transition graph.
- Add `docs/file-contracts.md` before broad implementation.
- Add `docs/command-contracts.md` before command expansion.

### Validation Issues Addressed

No contradictions found. Main architecture risk is YOLO-RUN scope: autonomous execution can become unsafe if validation command execution is too permissive. Mitigation: implement gate denial first, then validation runner with explicit task-bound commands and Journal logging.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** high

**Key Strengths:**
- Strong separation between CLI adapter and core engines.
- File contracts map cleanly to product requirements.
- Deterministic state model supports gate enforcement.
- Architecture explicitly protects against AI-agent inconsistency.
- Project-local design avoids premature SaaS complexity.

**Areas for Future Enhancement:**
- Hosted dashboard.
- Provider-specific adapters.
- Plugin marketplace.
- Full migration engine.
- Visual architecture diagrams.
- External review integration.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect package boundaries.
- Keep business logic out of `packages/cli`.
- Validate state with Zod before use.
- Write Journal entries for governance and execution events.
- Stop on contradictory Project State instead of guessing.

**First Implementation Priority:**
Initialize oclif + pnpm workspace, then create `packages/core` before implementing feature commands.
