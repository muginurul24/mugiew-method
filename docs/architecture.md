# Architecture

## Architecture Summary

Mugiew Method uses a layered monorepo architecture:

```txt
packages/cli
  -> governance-engine
  -> discovery-engine
  -> execution-engine
  -> core
```

`packages/cli` is intentionally thin. It parses commands, formats terminal output, maps known domain errors to exit codes, and delegates business logic to engine packages.

`packages/core` owns shared state contracts and primitives. Engine packages depend on `core`; `core` must not depend on engines.

## Package Responsibilities

### `packages/cli`

Owns:

- oclif command classes
- CLI command registry
- flags and terminal output
- exit behavior

Commands:

- `install`
- `create-prd`
- `approve-prd`
- `project-status`
- `review-project`
- `yolo-run`

### `packages/core`

Owns:

- canonical project paths
- project root detection
- safe file writes
- shared domain errors
- JSON contract parsers
- Zod schemas for state artifacts

Important contracts:

- `ProjectState`
- `AmbiguityReport`
- `TaskFile`
- `DependencyGraph`

### `packages/discovery-engine`

Owns:

- discovery artifact bootstrap
- mandatory concern coverage
- ambiguity classification
- contradiction/risk finding primitives
- confidence scoring
- confidence report rendering

It creates/uses:

- `_mugiew-method/discovery/answers.md`
- `_mugiew-method/discovery/ambiguities.md`
- `_mugiew-method/discovery/assumptions.md`
- `_mugiew-method/discovery/confidence-report.md`
- `_mugiew-method/state/ambiguity-report.json`

### `packages/governance-engine`

Owns:

- installation
- PRD rendering
- specification artifact rendering
- root `AGENTS.md` constitution rendering
- rule template rendering
- approval gate
- force mode policy
- project status
- AGENTS.md validation
- project review aggregation

It writes governance artifacts under:

- root `AGENTS.md`
- `_mugiew-method/prd/`
- `_mugiew-method/rules/`
- `_mugiew-method/state/`
- `_mugiew-method/journal/`

### `packages/execution-engine`

Owns:

- task generation
- dependency graph creation
- runtime task selection
- YOLO-RUN gate evaluation
- validation command execution
- self-review
- architecture drift detection
- runtime stop state
- safe rebuild planning

It owns the runtime side of autonomous execution, but current MVP does not yet implement full continuous task execution loop.

## State Architecture

Mugiew Method persists state locally in user repositories:

```txt
_mugiew-method/
├── discovery/
├── prd/
├── tasks/
├── journal/
├── state/
└── rules/
AGENTS.md
```

Machine-readable state lives in JSON files under `_mugiew-method/state/`. Human and AI-readable artifacts live mostly in Markdown.

## Gate Architecture

Approval gate conditions:

- blocking ambiguity count must be `0`
- confidence score must be at least `90`

YOLO-RUN gate conditions:

- PRD approval record must exist
- blocking ambiguity count must be `0`
- confidence score must be at least `90`

Current implementation reads confidence from Markdown and ambiguity count from `ambiguity-report.json`. Approval records include artifact version metadata, but YOLO-RUN currently checks approval existence only.

## Write Safety

All project artifact writes should go through `safeWriteFile`. Default behavior denies overwriting existing files. Explicit overwrite is used only where state updates are expected.

## Runtime Observability

Runtime and governance events are written to `_mugiew-method/journal/`, including:

- validation failure
- self-review
- runtime stop
- YOLO-RUN denial
- task selection
- approved drift
- project review
- force mode usage

## Architecture Risks

- Approval freshness is not enforced by YOLO-RUN yet.
- Validation command execution uses shell command strings and must be treated as trusted project-local execution.
- Discovery has contract/scoring primitives, not a full adaptive conversational interrogation loop.
- CLI packaging is workspace-ready but not npm-ready.
