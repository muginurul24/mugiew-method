# Story 3.5: Enforce Approval Gate

Status: done

## Story

As an AI-native Engineer,
I want `/approve-prd` to reject unsafe approval,
so that YOLO-RUN cannot begin from incomplete specifications.

## Acceptance Criteria

1. Given PRD Artifact and confidence report exist, when `/approve-prd` runs, then approval fails if Blocking Ambiguity count is greater than `0`.
2. Given confidence gate threshold is unmet, then approval fails.
3. Given approval fails, then failure output names exact failed condition.
4. Given approval succeeds, then success records approval timestamp and approved artifact versions.

## Tasks / Subtasks

- [x] Implement approval gate evaluator (AC: 1-4)
  - [x] Add `packages/governance-engine/src/approval-gate.ts`.
  - [x] Check blocking ambiguity count.
  - [x] Check confidence threshold.
  - [x] Return exact failed conditions.
  - [x] Produce approval record on success.
- [x] Add approval artifact writer (AC: 4)
  - [x] Write approval state under `_mugiew-method/state`.
  - [x] Include approval timestamp and approved artifact versions.
- [x] Add CLI command adapter (AC: 1-4)
  - [x] Add `packages/cli/src/commands/approve-prd.ts`.
  - [x] Register `approve-prd`.
  - [x] Format exact failed conditions.
- [x] Add focused tests (AC: 1-4)
  - [x] Test blocking ambiguity denial.
  - [x] Test confidence threshold denial.
  - [x] Test exact failed condition output.
  - [x] Test success approval record.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 2.6 provides confidence report model.
- Approval gate is deterministic from explicit state inputs.
- Force mode is out of scope for this story; Story 3.6 handles it.

### API Guidance

- [ASSUMPTION] MVP confidence threshold is `90`.
- [ASSUMPTION] Approval record file is `_mugiew-method/state/prd-approval.json`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Initial implementation had CLI stubbed with hardcoded passing gate; review patch moved real project state reading into `approvePrdProject`.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 15 test files, 59 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.

### Completion Notes List

- Added approval gate evaluator with blocking ambiguity and confidence threshold denial.
- Added approval record structure and writer under `_mugiew-method/state/prd-approval.json`.
- Added project approval service that reads PRD, confidence report, and ambiguity report state.
- Added CLI `approve-prd` adapter and command registration.
- Added tests for denial conditions, exact failed condition output, success record, and project-state approval flow.

### File List

- `packages/governance-engine/src/approval-gate.ts`
- `packages/governance-engine/src/approval-gate.test.ts`
- `packages/governance-engine/src/index.ts`
- `packages/cli/src/commands/approve-prd.ts`
- `packages/cli/src/commands/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented approval gate evaluator, project approval service, CLI command, exports, and tests.
- 2026-05-24: Addressed review finding by replacing stub CLI approval input with real project state reading.

## Senior Developer Review (AI)

Review completed.

### Findings

- Medium: initial CLI adapter used hardcoded passing gate values, so `/approve-prd` could approve without reading project state. Fixed by adding `approvePrdProject`, which reads PRD.md, confidence-report.md, and ambiguity-report.json before evaluating the gate.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 15 test files, 59 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
