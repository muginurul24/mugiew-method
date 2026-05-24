# Story 1.5: Detect Existing Installation

Status: done

## Story

As an AI-native Engineer,
I want repeated install runs to detect existing Mugiew Method state,
so that reinstall does not corrupt project governance artifacts.

## Acceptance Criteria

1. Given an existing `_mugiew-method/` directory or root `AGENTS.md`, when `mugiew-method install` runs again, then the command reports existing installation state.
2. Given install detects existing artifacts, then no existing file is overwritten silently.
3. Given existing Project State has an unsupported schema version, then install returns `SchemaVersionError`.
4. Given tests run, then fresh install, partial install, and existing install cases are covered.

## Tasks / Subtasks

- [x] Add schema version domain error (AC: 3)
  - [x] Add `SchemaVersionError` under `packages/core/src/errors/`.
  - [x] Include file path, found version, and supported version.
  - [x] Export error from core public API.
- [x] Add existing install detection to install service (AC: 1-3)
  - [x] Detect root `AGENTS.md`, `_mugiew-method/`, and project state file before writing.
  - [x] Return existing/partial installation status instead of writing when markers exist.
  - [x] Validate existing `project-state.json` schema version.
  - [x] Throw `SchemaVersionError` for unsupported schema version.
- [x] Update CLI install output (AC: 1)
  - [x] Report fresh install created artifacts.
  - [x] Report already-installed or partial-installation state without claiming files were created.
- [x] Add focused tests (AC: 1-4)
  - [x] Keep fresh install coverage.
  - [x] Test existing full install does not overwrite `AGENTS.md`.
  - [x] Test partial install detection for only `_mugiew-method/` or `AGENTS.md`.
  - [x] Test unsupported schema version throws `SchemaVersionError`.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run CLI install twice in a temp project and verify second run reports existing state.

## Dev Notes

- Story 1.4 created the install service and CLI command.
- Existing detection must happen before any write that could change user-owned files.
- Reinstall must not rely on `UnsafeWriteError` as normal control flow after partial writes. Preflight first.
- `SchemaVersionError` is a core domain error listed in architecture.
- Full migration behavior is out of scope; MVP blocks unsupported schema versions.

### Architecture Compliance

- Domain errors live under `packages/core/src/errors/`.
- Install behavior remains outside CLI command classes.
- CLI formats service result only.
- JSON state uses camelCase fields.
- No destructive operation or overwrite should happen without explicit future force/confirmation behavior.

### API Guidance

- Extend install result with status, e.g. `"installed"`, `"already-installed"`, or `"partial-installation"`.
- Keep `createdPaths` empty for existing/partial detection.
- [ASSUMPTION] Existing root `AGENTS.md` without `_mugiew-method/` counts as partial installation because it is a protected root governance artifact.

### Testing Requirements

- Use temp directories only.
- Assert existing file content remains unchanged after second install.
- Assert unsupported schema version fails before writes.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 1.4](./1-4-implement-install-command.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 4 test files, 13 tests before review patch; 14 tests after review patch.
- `rtk proxy pnpm build` passed.
- Temp-project CLI install passed twice; second run reported `already-installed` and `No files changed.`
- `rtk proxy pnpm check` passed.
- Code review found status classification treated `project-state.json` presence as full install even without `AGENTS.md`; patched full install to require all markers.
- Post-review typecheck, test, build, CLI double-install, and check passed.

### Completion Notes List

- Added `SchemaVersionError` core domain error.
- Added preflight install detection for `_mugiew-method/`, root `AGENTS.md`, and `state/project-state.json`.
- Existing and partial installs now return status with detected paths and do not write files.
- Existing project-state schema version is validated before reporting install state.
- CLI now reports existing install state separately from fresh created artifacts.
- Added tests for fresh install, full existing install, partial marker cases, unsupported schema version, and project-state-without-AGENTS partial status.

### File List

- `packages/core/src/errors/schema-version-error.ts`
- `packages/core/src/index.ts`
- `packages/governance-engine/src/install-project.ts`
- `packages/governance-engine/src/install-project.test.ts`
- `packages/cli/src/commands/install.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented existing install preflight detection, schema version guard, CLI reporting, and tests.
- 2026-05-24: Addressed review finding for full-vs-partial status classification.

## Senior Developer Review (AI)

Review completed.

### Findings

- Medium: existing detection classified any valid `project-state.json` as `already-installed`, even when `AGENTS.md` was missing. Fixed by requiring `_mugiew-method`, `AGENTS.md`, and `project-state.json` for full install; otherwise status is `partial-installation`.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 4 test files, 14 tests.
- `rtk proxy pnpm build` passed.
- Temp-project CLI double-install passed; second run reported existing install and no files changed.
- `rtk proxy pnpm check` passed.
