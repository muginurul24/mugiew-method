# Story 1.4: Implement Install Command

Status: done

## Story

As an AI-native Engineer,
I want to run `npx mugiew-method install`,
so that my repository receives Mugiew Method project structure and initial governance files.

## Acceptance Criteria

1. Given a repository without Mugiew Method installed, when `mugiew-method install` runs, then `_mugiew-method/` is created with required subdirectories.
2. Given root `AGENTS.md` is missing, when install runs, then root `AGENTS.md` is created from a template.
3. Given install runs successfully, then `state/project-state.json` is created with `schemaVersion`, `updatedAt`, install status, and package version.
4. Given install runs successfully, then command output lists created files.
5. Given install runs successfully, then command returns exit code `0`.

## Tasks / Subtasks

- [x] Add install bootstrap service outside CLI adapter (AC: 1-4)
  - [x] Add governance-engine install service that accepts target project root and package version.
  - [x] Create required `_mugiew-method` subdirectories.
  - [x] Create root `AGENTS.md` from template content.
  - [x] Create `_mugiew-method/state/project-state.json`.
  - [x] Return created artifact paths for CLI output.
- [x] Add CLI install command adapter (AC: 4, 5)
  - [x] Add `packages/cli/src/commands/install.ts`.
  - [x] Register `install` in oclif explicit command map.
  - [x] Keep command limited to parsing, invoking service, and formatting output.
  - [x] Add required package dependency from CLI to governance-engine.
- [x] Add tests (AC: 1-4)
  - [x] Test service creates required directories.
  - [x] Test AGENTS template file is created.
  - [x] Test project-state JSON has required fields.
  - [x] Test returned created paths include files/directories for output.
- [x] Validate command behavior (AC: 5)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run CLI install command in a temporary project and verify exit code/output.

## Dev Notes

- Story 1.2 provides core project path contracts.
- Story 1.3 provides `safeWriteFile` and `UnsafeWriteError`.
- Business logic must not live in oclif command classes. Put install behavior in an engine/service and keep CLI as adapter-only.
- Existing-install detection and partial-install reporting are Story 1.5. This story targets fresh install behavior only, but must still use safe writes so existing files are not silently overwritten.
- Project state JSON fields must use camelCase.

### Architecture Compliance

- `packages/cli` owns command parsing, terminal output, flags, and exit codes only.
- Engine package code may depend on `packages/core`; it must not depend on `packages/cli`.
- Core writes files atomically through safe-write helper.
- File names must be kebab-case.
- Tests must be co-located as `*.test.ts`.
- No hosted service, auth, or network behavior belongs here.

### API Guidance

- Prefer service shape similar to:

```ts
installProject({ projectRoot, packageVersion, now?: Date })
```

- Return a typed result with `projectRoot` and `createdPaths`.
- Use `createProjectPaths(projectRoot)` from core instead of reconstructing public path strings.
- Use `safeWriteFile` for files.
- Use `fs.mkdir(..., { recursive: true })` for directories.
- [ASSUMPTION] Initial `project-state.json` can use schema version `1` and install status `"installed"` until full state schemas are expanded in later stories.

### Testing Requirements

- Use temp directories; do not write to repo root during tests.
- Do not add new runtime dependencies unless required.
- CLI exit/output may be verified after build with `node packages/cli/bin/run.js install`.

### Project Structure Notes

- Source of truth: [Architecture](../planning-artifacts/architecture.md) sections "Data Flow", "API & Communication Patterns", "Project Structure & Boundaries", and "Security Decisions".
- Story source: [Epics](../planning-artifacts/epics.md) Story 1.4.
- Previous stories: [Story 1.2](./1-2-define-core-file-contracts-and-project-paths.md), [Story 1.3](./1-3-implement-safe-filesystem-writes.md).

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Readiness Report](../planning-artifacts/implementation-readiness-report-2026-05-24.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm install` passed after adding workspace dependency.
- Initial `rtk proxy pnpm test` failed because Vitest resolved workspace package imports to stale `dist`; patched `vitest.config.ts` aliases to package source entries.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 4 test files, 9 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy node /home/mugiew/project/mugiew-method/packages/cli/bin/run.js install` passed in a temp project with exit code `0` and listed created artifacts.
- `rtk proxy pnpm check` passed.
- Code review found CLI package version was hardcoded; patched command to read `packages/cli/package.json`.
- Post-review typecheck, test, build, CLI temp install, and check passed.

### Completion Notes List

- Added core initial Project State contract helper.
- Added governance-engine `installProject` service that creates required directories, `AGENTS.md`, and `project-state.json`.
- Added CLI `install` command adapter and registered it in oclif explicit command map.
- Added CLI dependency on governance-engine.
- Added Vitest coverage for created directories, AGENTS template, project state JSON, and returned created paths.
- Added Vitest source aliases for workspace package imports.
- Patched CLI version handling to use package metadata instead of hardcoded value.

### File List

- `packages/core/package.json`
- `packages/core/src/contracts/project-state.ts`
- `packages/core/src/index.ts`
- `packages/governance-engine/package.json`
- `packages/governance-engine/src/install-project.ts`
- `packages/governance-engine/src/install-project.test.ts`
- `packages/governance-engine/src/index.ts`
- `packages/cli/package.json`
- `packages/cli/src/commands/install.ts`
- `packages/cli/src/commands/index.ts`
- `vitest.config.ts`
- `pnpm-lock.yaml`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented install service, CLI command, project state contract, and tests.
- 2026-05-24: Addressed review findings for workspace test resolution and package version source.

## Senior Developer Review (AI)

Review completed.

### Findings

- Medium: Vitest resolved workspace package imports to stale `dist`, so fresh source changes could fail or pass incorrectly depending on local build state. Fixed with source aliases in `vitest.config.ts`.
- Low: CLI wrote hardcoded package version to Project State. Fixed by importing version from `packages/cli/package.json`.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 4 test files, 9 tests.
- `rtk proxy pnpm build` passed.
- Temp-project `node packages/cli/bin/run.js install` passed with exit code `0` and listed created artifacts.
- `rtk proxy pnpm check` passed.
