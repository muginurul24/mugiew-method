# Mugiew Method

No implementation before clarity.

Mugiew Method is an AI Governance and Autonomous Execution Framework for AI-assisted software projects. It is built to reduce AI coding chaos by making discovery, requirements, approval gates, task graphs, validation, review, and execution state explicit before autonomous implementation continues.

This repository contains the TypeScript/Node.js CLI implementation.

## Why This Exists

AI coding tools are fast, but they often fail in predictable ways:

- implementation starts before requirements are clear
- architecture decisions drift across long sessions
- future agents lose context
- edge cases and safety gates are skipped
- generated code becomes hard for humans and future AI agents to maintain

Mugiew Method treats software work as a governance and specification problem first, then an implementation problem.

Core principle:

```txt
Clarity before implementation.
Specification before execution.
Understanding before generation.
```

## What It Does

Mugiew Method installs project-local governance files and provides CLI commands for:

- creating/resuming discovery state
- generating and approving PRD/specification artifacts
- enforcing YOLO-RUN readiness gates
- validating approval integrity
- managing task dependency graphs
- detecting dependency cycles
- running bounded validation commands
- scanning project files for governance violations
- writing durable review and runtime journal entries
- reporting machine-readable project status

## Current Implementation Status

Implemented:

- project install flow
- `_mugiew-method/` project artifact structure
- root `AGENTS.md` generation
- discovery bootstrap artifacts
- ambiguity/confidence state contracts
- PRD/spec/rules artifact generation
- approval gate with SHA-256 artifact integrity
- project status reporting
- review-project scanning with path safety
- task graph and cycle detection
- YOLO-RUN gate denial
- runtime task selection primitives
- bounded validation runner
- self-review primitives
- npm release packaging smoke test

Not yet implemented:

- full adaptive conversational discovery runtime
- full end-to-end YOLO-RUN implementation loop
- validation command allowlist policy
- complete public slash-command adapter layer

Important: `create-prd` currently bootstraps discovery artifacts and state. It does not yet run full natural-language adaptive interrogation.

## Project Structure

```txt
packages/
  cli/                 oclif command adapter
  core/                shared contracts, errors, paths, safe writes
  discovery-engine/    discovery bootstrap, ambiguity, confidence
  governance-engine/   install, PRD/spec generation, approval, status, review
  execution-engine/    task graph, YOLO-RUN gates, validation, runtime review

docs/                  generated project documentation
_bmad/                 BMad workflow configuration
_bmad-output/          planning, stories, retrospectives, project context
bin/run.js             published root package entrypoint
scripts/pack-smoke.mjs package release smoke test
```

`packages/cli` must stay thin. Business logic belongs in engine packages.

## Requirements

- Node.js `>=24.0.0`
- pnpm `10.33.2`

## Install From npm

After publication:

```bash
npx mugiew-method install
```

Local development command:

```bash
node packages/cli/bin/run.js install
```

## Basic Workflow

### 1. Install Mugiew Method In A Project

```bash
mugiew-method install
```

Creates project governance files:

```txt
AGENTS.md
_mugiew-method/
  discovery/
  prd/
  tasks/
  journal/
  state/
  rules/
```

If installation already exists, the command reports detected files and does not overwrite them silently.

### 2. Start Discovery / PRD Bootstrap

```bash
mugiew-method create-prd
```

Creates or resumes:

```txt
_mugiew-method/discovery/answers.md
_mugiew-method/discovery/ambiguities.md
_mugiew-method/discovery/assumptions.md
_mugiew-method/discovery/confidence-report.md
_mugiew-method/state/ambiguity-report.json
```

Current phase output:

```txt
Discovery Phase: bootstrap-primitives
Adaptive Interrogation: pending
```

### 3. Approve PRD

```bash
mugiew-method approve-prd
```

Approval succeeds only when readiness gates pass. The approval record stores content hashes for:

- `PRD.md`
- `confidence-report.md`
- `ambiguity-report.json`

If any approved artifact changes later, YOLO-RUN is denied until re-approval.

### 4. Check Project Status

Human-readable:

```bash
mugiew-method project-status
```

Machine-readable:

```bash
mugiew-method project-status --json
```

Status reports approval state, confidence, ambiguity blockers, dependency graph blockers, runtime stop state, drift, and corrupt/missing state files.

### 5. Review Project

Review explicit files:

```bash
mugiew-method review-project --path src/example.ts --path README.md
```

Review changed git files:

```bash
mugiew-method review-project --changed
```

The review scanner:

- keeps reads inside project root
- rejects symlink escapes
- skips binary files
- deduplicates inputs
- reports scanned/skipped counts
- writes review results into `_mugiew-method/journal/`

### 6. Start YOLO-RUN Gate

```bash
mugiew-method yolo-run
```

YOLO-RUN is allowed only when gates pass:

- PRD approved
- approval record valid and fresh
- no blocking ambiguities
- confidence threshold satisfied
- task graph has no blocking cycles

If denied, the command exits with gate failure details and writes a journal entry.

## Development

Install dependencies:

```bash
pnpm install
```

Run checks:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

Run local CLI:

```bash
node packages/cli/bin/run.js
node packages/cli/bin/run.js install
node packages/cli/bin/run.js create-prd
node packages/cli/bin/run.js project-status --json
```

## Package Smoke Test

```bash
pnpm pack:smoke
```

The smoke test:

1. builds workspace packages
2. packs all runtime packages into local tarballs
3. installs only the root `mugiew-method` tarball in a temporary project
4. uses pnpm overrides to resolve internal package tarballs offline
5. runs `mugiew-method install`
6. verifies `AGENTS.md` and `_mugiew-method/` were created

## Publishing

Publish internal packages first, then root wrapper:

```bash
pnpm --filter @mugiew-method/core publish --access public --no-git-checks
pnpm --filter @mugiew-method/discovery-engine publish --access public --no-git-checks
pnpm --filter @mugiew-method/governance-engine publish --access public --no-git-checks
pnpm --filter @mugiew-method/execution-engine publish --access public --no-git-checks
pnpm --filter @mugiew-method/cli publish --access public --no-git-checks
pnpm publish --no-git-checks
```

Before publishing:

```bash
pnpm pack:smoke
pnpm check
pnpm build
```

## Package Strategy

- `mugiew-method` is the public NPX wrapper package.
- `@mugiew-method/cli` owns the oclif runtime.
- `@mugiew-method/core`, `@mugiew-method/discovery-engine`, `@mugiew-method/governance-engine`, and `@mugiew-method/execution-engine` are runtime packages.
- Source manifests use `workspace:^`.
- `pnpm pack` rewrites workspace ranges to concrete semver in packed artifacts.

## Documentation

Useful docs:

- [Project Overview](docs/project-overview.md)
- [Architecture](docs/architecture.md)
- [Development Guide](docs/development-guide.md)
- [Package API Reference](docs/package-api-reference.md)
- [Testing Strategy](docs/testing-strategy.md)
- [Discovery Runtime Scope](docs/discovery-runtime-scope.md)
- [Package Release](docs/package-release.md)

## License

MIT
