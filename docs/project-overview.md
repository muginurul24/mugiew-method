# Project Overview

## Summary

Mugiew Method is a TypeScript + Node.js CLI workspace for AI-native software engineering governance. It creates and maintains project-local artifacts under `_mugiew-method/` and root `AGENTS.md` so AI agents can move from discovery to specification, approval, task planning, runtime execution, validation, and self-review with deterministic state.

The guiding rule is:

```txt
No implementation before clarity.
```

## Product Role

Mugiew Method is not an IDE wrapper or prompt bundle. It is a local governance and autonomous execution protocol implemented as CLI-accessible engine packages.

Core product capabilities:

- Install Mugiew Method file structure and `AGENTS.md`.
- Start discovery and create required discovery state.
- Classify ambiguity into blocking, non-blocking, and assumptions.
- Calculate confidence and readiness.
- Generate PRD, specification, rule, and constitution artifacts.
- Enforce approval and YOLO-RUN gates.
- Generate task contracts and dependency graphs.
- Select runtime tasks and validate task output.
- Write journals for review, failure, force mode, drift, and runtime stop events.
- Report project status for humans and AI agents.

## Repository Classification

- **Repository type:** monorepo
- **Primary project type:** CLI developer tooling
- **Secondary project type:** TypeScript libraries
- **Package manager:** pnpm workspace
- **Test runner:** Vitest
- **CLI framework:** oclif
- **Schema validation:** Zod
- **Process execution:** Execa for task validation commands

## Implementation State

Implementation artifacts show Epic 1 through Epic 7 complete. Current package state includes install, discovery, governance, task graph, status, review, YOLO-RUN runtime primitives, launch hardening, and npm release packaging support.

Latest observed verification during checkpoint:

- `pnpm test` passed: 32 test files, 151 tests.
- `pnpm build` passed.
- `rtk proxy pnpm typecheck` passed.
- `pnpm pack:smoke` passed.
- `pnpm check` passed.

## Known Launch Gaps

Current launch gaps:

- Product docs promise slash commands and `npx mugiew-method install`; current local CLI exposes kebab oclif commands while release packaging provides the `mugiew-method` bin.
- Full adaptive conversational discovery runtime remains deferred; `/create-prd` currently bootstraps discovery artifacts and state.
