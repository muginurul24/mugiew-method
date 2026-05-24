# Mugiew Method

No implementation before clarity.

Mugiew Method is an AI Governance & Autonomous Execution Framework. This repository is organized as a TypeScript + Node.js CLI workspace.

## Workspace Boundaries

- `packages/cli` owns oclif command parsing, terminal output, flags, and exit codes.
- `packages/core` owns shared contracts, domain types, errors, result types, IDs, safe file IO, and project path detection.
- `packages/discovery-engine` owns discovery sessions, concern coverage, ambiguity classification, and confidence calculation inputs.
- `packages/governance-engine` owns generated PRD artifacts, specs, rules, `AGENTS.md`, and approval gates.
- `packages/execution-engine` owns task graph, task selection, YOLO-RUN orchestration, validation runner, review engine, journal writing, and architecture drift detection.

`packages/cli` must remain adapter-only. Business logic belongs in engine packages and shared contracts belong in `packages/core`.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Package Smoke Test

```bash
pnpm pack:smoke
```

The smoke test packs local release artifacts, installs them into a temporary project, runs `mugiew-method install`, and verifies the Mugiew project files are created.
