# Story 2.2: Implement `/create-prd` Discovery Entry

Status: done

## Story

As an AI-native Engineer,
I want `/create-prd` to start or resume discovery,
so that product understanding is captured before specification.

## Acceptance Criteria

1. Given Mugiew Method is installed, when `/create-prd` is invoked through the CLI command contract, then discovery state is created or resumed.
2. Given discovery markdown files are missing, then `discovery/answers.md`, `discovery/ambiguities.md`, `discovery/assumptions.md`, and `discovery/confidence-report.md` are created.
3. Given `/create-prd` runs, then the command cannot mark PRD approved.
4. Given Mugiew Method is not installed, then missing installation returns a recoverable error with suggested install action.

## Tasks / Subtasks

- [x] Add discovery start/resume service (AC: 1-4)
  - [x] Add service in `packages/discovery-engine`.
  - [x] Verify installation markers before creating discovery state.
  - [x] Create missing discovery markdown files without overwriting existing content.
  - [x] Create missing `state/ambiguity-report.json` with empty ambiguity list.
  - [x] Validate existing ambiguity report through core contract.
  - [x] Return created and existing paths for CLI output.
- [x] Add recoverable missing installation error (AC: 4)
  - [x] Add core domain error or discovery result for missing install.
  - [x] Include suggested `mugiew-method install` action.
- [x] Add CLI command adapter (AC: 1, 4)
  - [x] Add `packages/cli/src/commands/create-prd.ts`.
  - [x] Register `create-prd` in oclif explicit command map.
  - [x] Keep command limited to invoking service and formatting output.
- [x] Add tests (AC: 1-4)
  - [x] Test fresh discovery state creation in installed project.
  - [x] Test existing markdown content is preserved on resume.
  - [x] Test missing installation returns recoverable install suggestion.
  - [x] Test PRD approval state is not created or changed.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 1.4/1.5 implement installation and install detection.
- Story 2.1 implements ambiguity report schema and `parseAmbiguityReport`.
- This story starts/resumes discovery state only; adaptive questioning begins in later stories.
- The command must not approve PRD or write approval status.
- Missing install should be recoverable and instruct user to run `mugiew-method install`.

### Architecture Compliance

- Discovery behavior lives in `packages/discovery-engine`.
- CLI owns command parsing/output only.
- Core owns path contracts, safe writes, schemas, and domain errors.
- No overwrite of user-authored discovery markdown on resume.

### API Guidance

- Prefer service shape:

```ts
startDiscovery({ projectRoot, now?: Date })
```

- Return status `"created"` or `"resumed"` with created/existing paths.
- [ASSUMPTION] Initial confidence report can state score `0`, blocking ambiguity count `0`, and readiness `DISCOVERY_IN_PROGRESS`; formula comes later.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 2.1](./2-1-create-discovery-state-contracts.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Initial `rtk proxy pnpm typecheck` failed because CLI imported core error without direct core dependency; patched CLI package dependency.
- Initial missing-install CLI output duplicated suggested action; patched error message and suggestion separation.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 6 test files, 22 tests.
- `rtk proxy pnpm build` passed.
- Temp-project CLI `create-prd` returned exit code `2` before install with suggested install action.
- Temp-project CLI install then `create-prd` passed; second `create-prd` resumed existing discovery state.
- `rtk proxy pnpm check` passed.

### Completion Notes List

- Added `MissingInstallationError` core domain error.
- Added discovery-engine `startDiscovery` service for create/resume behavior.
- Service creates discovery markdown files and `state/ambiguity-report.json` when missing.
- Service validates existing ambiguity report JSON through core contract.
- Added CLI `create-prd` adapter and command registration.
- Added tests for fresh creation, resume preservation, missing install error, and no PRD approval write.
- Added CLI dependencies and Vitest alias for discovery-engine source.

### File List

- `packages/core/src/errors/missing-installation-error.ts`
- `packages/core/src/index.ts`
- `packages/discovery-engine/package.json`
- `packages/discovery-engine/src/start-discovery.ts`
- `packages/discovery-engine/src/start-discovery.test.ts`
- `packages/discovery-engine/src/index.ts`
- `packages/cli/package.json`
- `packages/cli/src/commands/create-prd.ts`
- `packages/cli/src/commands/index.ts`
- `vitest.config.ts`
- `pnpm-lock.yaml`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented create-prd discovery start/resume service, CLI command, missing installation error, and tests.
- 2026-05-24: Addressed review findings for CLI core dependency and duplicate install suggestion output.

## Senior Developer Review (AI)

Review completed.

### Findings

- Medium: CLI imported `MissingInstallationError` from core without declaring `@mugiew-method/core` dependency, causing package typecheck/build failure. Fixed by adding direct CLI dependency.
- Low: missing-install output duplicated the suggested install action. Fixed by keeping the error message and `suggestedAction` separate.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 6 test files, 22 tests.
- `rtk proxy pnpm build` passed.
- Temp-project `create-prd` before install returned recoverable install guidance.
- Temp-project install plus `create-prd` created discovery files; second `create-prd` resumed state.
- `rtk proxy pnpm check` passed.
