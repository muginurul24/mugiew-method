# Story 1.2: Define Core File Contracts and Project Paths

Status: done

## Story

As an Autonomous Project Maintainer,
I want core path and file contract definitions,
so that all engines read and write the same project-local structure.

## Acceptance Criteria

1. Given `packages/core`, when file contract definitions are implemented, then core exposes project paths for root `AGENTS.md`, `_mugiew-method/discovery`, `_mugiew-method/prd`, `_mugiew-method/tasks`, `_mugiew-method/journal`, `_mugiew-method/state`, and `_mugiew-method/rules`.
2. Given path helpers are called from a nested working directory, then helpers resolve relative to the detected project root.
3. Given core path helpers exist, then they do not depend on `packages/cli`.
4. Given tests run, then path resolution from nested working directories is covered.

## Tasks / Subtasks

- [x] Define project file contract constants in `packages/core` (AC: 1, 3)
  - [x] Add canonical Mugiew directory name and managed directory keys.
  - [x] Add root `AGENTS.md` contract.
  - [x] Add deterministic relative path map for all MVP directories.
- [x] Implement project root detection in `packages/core` (AC: 2, 3)
  - [x] Add helper that walks upward from a supplied start directory.
  - [x] Detect root using repository/project markers without importing CLI code.
  - [x] Throw a typed domain error when no project root can be detected.
- [x] Implement project path helpers in `packages/core` (AC: 1, 2, 3)
  - [x] Add helper that resolves all public Mugiew paths from an explicit root.
  - [x] Add helper that detects root from a supplied start directory and returns resolved paths.
  - [x] Export helpers and types from `packages/core/src/index.ts`.
- [x] Cover nested directory resolution with Vitest (AC: 2, 4)
  - [x] Create a temporary project fixture with nested subdirectories.
  - [x] Assert root detection returns the fixture root.
  - [x] Assert resolved paths point at the fixture root, not the nested directory.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 1.1 established the pnpm workspace, TypeScript package boundaries, and oclif-compatible CLI shell. Do not move business logic into `packages/cli`.
- `packages/core` owns contracts shared by every engine: schemas, errors, result types, safe file IO, and project path detection.
- Architecture public file contract:
  - root `AGENTS.md`
  - `_mugiew-method/discovery`
  - `_mugiew-method/prd`
  - `_mugiew-method/tasks`
  - `_mugiew-method/journal`
  - `_mugiew-method/state`
  - `_mugiew-method/rules`
- Project-local persistence uses `_mugiew-method/` plus root `AGENTS.md`; future state JSON schemas will live in `packages/core`.
- Keep this story scoped to contracts and paths only. Safe writes, install behavior, generated templates, state JSON, and overwrite handling belong to later stories.

### Architecture Compliance

- Add files under `packages/core/src/filesystem/`.
- File names must be kebab-case.
- Tests must be co-located as `*.test.ts`.
- `packages/core` must not import `packages/cli`.
- TypeScript modules must stay ESM-compatible with NodeNext resolution.

### API Guidance

- Prefer explicit-root helper for deterministic tests and engine usage.
- Provide a detect-and-resolve helper for CLI entrypoints and future engines.
- Returned paths should include both root-level `agentsFile` and directory paths for `discovery`, `prd`, `tasks`, `journal`, `state`, and `rules`.
- Root detection should accept an optional `startDirectory` so tests do not mutate process global cwd.
- [ASSUMPTION] Project root markers for MVP can include `package.json`, `.git`, `pnpm-workspace.yaml`, `_mugiew-method`, or `AGENTS.md`, with the nearest ancestor selected.

### Testing Requirements

- Use Node `fs/promises`, `os.tmpdir`, and `path` for temporary fixtures.
- Do not add new dependencies.
- Ensure package build still excludes tests from `dist`.

### Project Structure Notes

- Source of truth: [Architecture](../planning-artifacts/architecture.md) sections "Data Architecture", "API & Communication Patterns", "Implementation Patterns & Consistency Rules", and "Project Structure & Boundaries".
- Story source: [Epics](../planning-artifacts/epics.md) Story 1.2.
- Previous story: [Story 1.1](./1-1-set-up-initial-project-from-oclif-starter-template.md).

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Readiness Report](../planning-artifacts/implementation-readiness-report-2026-05-24.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed for all workspace packages.
- `rtk pnpm test` passed: 2 test files, 3 tests.
- `rtk pnpm build` passed for all workspace packages.
- `rtk proxy pnpm check` passed.
- Direct `rtk pnpm typecheck` incorrectly invoked TypeScript help through RTK filtering; reran with `rtk proxy pnpm typecheck` successfully.
- Code review found `ProjectRootNotFoundError` belonged under core errors and nested package root selection needed explicit coverage.
- Post-review `rtk proxy pnpm typecheck`, `rtk proxy pnpm test`, `rtk proxy pnpm build`, and `rtk proxy pnpm check` passed; tests now 2 files, 4 tests.

### Completion Notes List

- Added canonical Mugiew file contract constants in `packages/core`.
- Added project root detection that walks upward from an optional start directory.
- Added deterministic path resolution for root `AGENTS.md` and all MVP `_mugiew-method/*` directories.
- Added nested-directory Vitest coverage using temporary project fixtures.
- Added monorepo nested-package root detection coverage.
- Moved `ProjectRootNotFoundError` into core errors boundary.
- Exported contracts, helpers, and types through the core public API.

### File List

- `packages/core/src/errors/project-root-not-found-error.ts`
- `packages/core/src/filesystem/project-paths.ts`
- `packages/core/src/filesystem/workspace-detector.ts`
- `packages/core/src/filesystem/project-paths.test.ts`
- `packages/core/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented core file contracts, project root detection, path helpers, and nested resolution tests.
- 2026-05-24: Addressed code review findings for error boundary placement and nested package root detection coverage.

## Senior Developer Review (AI)

Review completed.

### Findings

- Medium: `ProjectRootNotFoundError` was initially defined in `packages/core/src/filesystem/workspace-detector.ts`, drifting from the architecture pattern that keeps domain errors under `packages/core/src/errors`. Fixed by moving it to `packages/core/src/errors/project-root-not-found-error.ts`.
- Low: root detection handled nested package directories, but tests did not prove workspace root markers outrank nested `package.json` files. Fixed with monorepo-style nested package coverage.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 2 test files, 4 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
