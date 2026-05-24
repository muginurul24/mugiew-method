# Development Guide

## Prerequisites

- Node.js `>=24.0.0` per root `package.json`
- pnpm `10.33.2` per root `packageManager`

## Install

```bash
pnpm install
```

## Build

```bash
pnpm build
```

Build runs package-level TypeScript compilation across workspace packages.

## Typecheck

```bash
pnpm typecheck
```

If command output is filtered by RTK wrappers, use:

```bash
rtk proxy pnpm typecheck
```

## Test

```bash
pnpm test
```

Focused stable test run:

```bash
pnpm test -- --runInBand
```

## Full Check

```bash
pnpm check
```

This runs typecheck and tests.

## Run CLI Locally

```bash
node packages/cli/bin/run.js install
node packages/cli/bin/run.js create-prd
node packages/cli/bin/run.js approve-prd
node packages/cli/bin/run.js project-status
node packages/cli/bin/run.js project-status --json
node packages/cli/bin/run.js review-project
node packages/cli/bin/run.js yolo-run
```

## Package Boundary Rules

- Keep `packages/cli` adapter-only.
- Put shared schemas and filesystem primitives in `packages/core`.
- Put discovery behavior in `packages/discovery-engine`.
- Put PRD, AGENTS.md, approval, status, and review governance in `packages/governance-engine`.
- Put task graph, validation, review, runtime stop, and YOLO-RUN primitives in `packages/execution-engine`.
- Export public APIs from each package `src/index.ts`.
- Keep JSON contract fields camelCase.
- Keep tests beside implementation files.

## Release Packaging

Current repository has npm release packaging support:

- root `mugiew-method` is the public NPX wrapper package
- internal `@mugiew-method/*` packages publish as runtime dependencies
- source dependencies use `workspace:^`; `pnpm pack` rewrites them to concrete semver
- package manifests declare MIT license metadata, file allowlists, and prepack build hooks
- verify release artifacts with `pnpm pack:smoke`
