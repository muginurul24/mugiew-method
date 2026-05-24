# Story 5.3: Detect Architecture Drift

Status: done

## Story

As an Autonomous Project Maintainer,
I want architecture drift detected explicitly,
so that codebase consistency does not degrade over time.

## Acceptance Criteria

1. Given implementation output and architecture rules exist, when drift detection runs, then each drift finding includes expected rule, observed change, severity, and remediation.
2. Given approved drift exists, then approved drift requires Journal entry.
3. Given drift state exists, then drifted state appears in `/project-status`.

## Tasks / Subtasks

- [x] Implement drift detector (AC: 1)
  - [x] Add `packages/execution-engine/src/architecture-drift-detector.ts`.
  - [x] Detect rule violations from architecture rules and implementation outputs.
  - [x] Include expected rule, observed change, severity, and remediation per finding.
- [x] Implement approved drift journal support (AC: 2)
  - [x] Render approved drift journal entry.
  - [x] Write approved drift entry to `_mugiew-method/journal`.
- [x] Surface drift state in project status (AC: 3)
  - [x] Read optional `state/architecture-drift.json`.
  - [x] Report `architectureHealth: drifted` when unresolved drift exists.
- [x] Add focused tests (AC: 1-3)
  - [x] Test drift finding shape.
  - [x] Test approved drift writes Journal.
  - [x] Test project status reports drifted architecture health.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Architecture states execution-engine owns architecture drift detection.
- Project status already returns `architectureHealth`; update it from optional drift state.
- Keep detection deterministic for MVP. Future review command can compose this detector with richer analysis.

### API Guidance

- Prefer `detectArchitectureDrift({ rules, outputs, approvedDrift })`.
- Prefer `writeApprovedDriftJournal({ projectRoot, driftResult, approvedDrift, now })`.
- [ASSUMPTION] MVP rules include a deterministic `forbiddenPattern` string for detection.
- [ASSUMPTION] `state/architecture-drift.json` can hold `{ findings: [{ status }] }` for status reporting.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 5.1](./5-1-implement-project-status-command.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 24 test files, 96 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found detector lacked a writer for `state/architecture-drift.json`; patched with `writeArchitectureDriftState`.
- `rtk proxy pnpm typecheck` passed after review fix.
- `rtk proxy pnpm test` passed after review fix: 24 test files, 97 tests.
- `rtk proxy pnpm build` passed after review fix.
- `rtk proxy pnpm check` passed after review fix.

### Completion Notes List

- Added deterministic architecture drift detector.
- Added approved drift journal writer.
- Added architecture drift state writer.
- Project status now reports `architectureHealth: drifted` from unresolved drift state.
- Added tests for finding shape, approved drift journal, drift state writing, and project status integration.

### File List

- `packages/execution-engine/src/architecture-drift-detector.ts`
- `packages/execution-engine/src/architecture-drift-detector.test.ts`
- `packages/execution-engine/src/index.ts`
- `packages/governance-engine/src/project-status.ts`
- `packages/governance-engine/src/project-status.test.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented architecture drift detector, approved drift journal, status integration, and tests.
- 2026-05-24: Addressed code review finding by adding architecture drift state writer.

## Senior Developer Review (AI)

Review completed. One actionable finding patched during review.

### Findings Resolved

- [x] Drift detector had no writer for `state/architecture-drift.json`, so `/project-status` integration depended on external state creation. Added `writeArchitectureDriftState` and regression test.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 24 test files, 97 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
