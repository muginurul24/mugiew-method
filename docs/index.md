# Project Documentation Index

Generated: 2026-05-24T12:22:11+07:00

## Project Overview

- **Project:** Mugiew Method
- **Type:** monorepo developer tooling project
- **Primary Language:** TypeScript
- **Runtime:** Node.js
- **Architecture:** oclif CLI adapter plus framework-independent engine packages
- **Purpose:** AI Governance & Autonomous Execution Framework for project-local discovery, specification, task graph, runtime gate, validation, and self-review workflows.

## Quick Reference

### Packages

| Package | Type | Role |
| --- | --- | --- |
| `packages/cli` | CLI | oclif command adapter and terminal boundary |
| `packages/core` | library | shared contracts, errors, filesystem paths, safe writes |
| `packages/discovery-engine` | library | discovery artifacts, concern coverage, ambiguities, confidence |
| `packages/governance-engine` | library | install, PRD/spec generation, AGENTS.md, approval, status, review |
| `packages/execution-engine` | library | tasks, dependency graph, YOLO-RUN gate, validation, review, runtime stop |

### Commands

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
node packages/cli/bin/run.js install
node packages/cli/bin/run.js create-prd
node packages/cli/bin/run.js approve-prd
node packages/cli/bin/run.js project-status --json
node packages/cli/bin/run.js review-project
node packages/cli/bin/run.js yolo-run
```

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Development Guide](./development-guide.md)
- [Package API Reference](./package-api-reference.md)
- [Testing Strategy](./testing-strategy.md)
- [Discovery Runtime Scope](./discovery-runtime-scope.md)
- [Package Release](./package-release.md)
- [Project Parts Metadata](./project-parts.json)

## Existing Documentation

- [README](../README.md) - concise project identity, package boundaries, and development commands.
- [Planning Architecture](../_bmad-output/planning-artifacts/architecture.md) - BMad architecture source for implementation direction.
- [Sprint Status](../_bmad-output/implementation-artifacts/sprint-status.yaml) - implementation completion tracking.
- [Epic 6 Retrospective](../_bmad-output/implementation-artifacts/epic-6-retro-2026-05-24.md) - final YOLO-RUN runtime retrospective.

## Getting Started

Start with [Project Overview](./project-overview.md), then read [Architecture](./architecture.md) for package responsibilities. Use [Package API Reference](./package-api-reference.md) when building features or reviewing public engine contracts.

For future AI-assisted work, provide this file as the brownfield context entry point.
