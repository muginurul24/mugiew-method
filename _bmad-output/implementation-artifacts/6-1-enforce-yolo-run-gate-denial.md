# Story 6.1: Enforce YOLO-RUN Gate Denial

Status: done

## Story

As an AI-native Engineer,
I want `/yolo-run` denied when readiness is incomplete,
so that autonomous execution cannot start unsafely.

## Acceptance Criteria

1. Given Project State is missing approval, has Blocking Ambiguities, or has insufficient confidence, when `/yolo-run` runs, then command returns `YOLO-RUN DENIED`.
2. Given gate denial occurs, then output names exact failed condition.
3. Given gate denial occurs, then exit code maps to gate denied.
4. Given gate denial occurs, then denial is written to Journal.

## Tasks / Subtasks

- [x] Implement YOLO-RUN gate evaluator (AC: 1, 2)
  - [x] Add execution-engine `yolo-runtime.ts`.
  - [x] Deny when PRD approval is missing.
  - [x] Deny when unresolved blocking ambiguity count is greater than zero.
  - [x] Deny when confidence score is below threshold.
  - [x] Return exact failed conditions.
- [x] Implement project-level YOLO-RUN entry (AC: 1, 4)
  - [x] Read project approval, confidence report, and ambiguity report.
  - [x] Write denial Journal entry.
  - [x] Return denied result without autonomous implementation.
- [x] Implement CLI command (AC: 2, 3)
  - [x] Add `packages/cli/src/commands/yolo-run.ts`.
  - [x] Register command in explicit oclif map.
  - [x] Print `YOLO-RUN DENIED` with failed conditions.
  - [x] Use exit code `3` for gate denied.
- [x] Add focused tests (AC: 1-4)
  - [x] Test missing approval denial.
  - [x] Test blocking ambiguity denial.
  - [x] Test insufficient confidence denial.
  - [x] Test denial Journal is written.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Approval record lives at `_mugiew-method/state/prd-approval.json`.
- Ambiguity report lives at `_mugiew-method/state/ambiguity-report.json`.
- Confidence score is currently parsed from `_mugiew-method/discovery/confidence-report.md`.
- Architecture maps gate denied to exit code `3`.
- This story must not implement autonomous execution after gate pass. Return allowed/ready only.

### API Guidance

- Prefer `evaluateYoloRunGate(input)` for pure gate logic.
- Prefer `yoloRunProject({ projectRoot, now })` for filesystem entry.
- [ASSUMPTION] YOLO-RUN threshold matches approval threshold: `90`.
- [ASSUMPTION] Denial journal filename can be timestamped as `*-yolo-run-denied.md`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 3.5](./3-5-enforce-approval-gate.md)
- [Story 5.1](./5-1-implement-project-status-command.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` initially failed because CLI package lacked execution-engine workspace dependency; added dependency and refreshed pnpm install.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 26 test files, 104 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added `GateDeniedError` with exit code `3`.
- Added YOLO-RUN gate evaluator and project-level gate entry.
- Denial checks PRD approval, blocking ambiguity count, and confidence score.
- Denial writes Journal entry before returning.
- Added `/yolo-run` CLI command and command registration.
- Added tests for missing approval, blocking ambiguity, confidence threshold, and denial Journal.

### File List

- `packages/core/src/errors/gate-denied-error.ts`
- `packages/core/src/index.ts`
- `packages/execution-engine/src/yolo-runtime.ts`
- `packages/execution-engine/src/yolo-runtime.test.ts`
- `packages/execution-engine/src/index.ts`
- `packages/cli/src/commands/yolo-run.ts`
- `packages/cli/src/commands/index.ts`
- `packages/cli/package.json`
- `pnpm-lock.yaml`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented YOLO-RUN gate denial, CLI command, Journal denial logging, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 26 test files, 104 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
