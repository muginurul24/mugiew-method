# Story 6.4: Run Self-Review Before Completion

Status: done

## Story

As an Autonomous Project Maintainer,
I want every Task self-reviewed before done state,
so that code smell, duplication, drift, maintainability, type safety, lint, and tests are checked.

## Acceptance Criteria

1. Given task implementation and validation output exist, when self-review runs, then review report is written before done Journal entry.
2. Given critical findings exist, then critical findings prevent Task completion.
3. Given medium and low findings exist, then findings are tracked with disposition.

## Tasks / Subtasks

- [x] Implement self-review engine (AC: 1-3)
  - [x] Add `packages/execution-engine/src/review-engine.ts`.
  - [x] Create findings from validation output and supplied review checks.
  - [x] Mark critical findings as completion blockers.
  - [x] Track medium and low findings with disposition.
- [x] Implement self-review journal (AC: 1)
  - [x] Write self-review report to `_mugiew-method/journal`.
  - [x] Return journal path for later done-state sequencing.
- [x] Add focused tests (AC: 1-3)
  - [x] Test review report is written.
  - [x] Test critical finding prevents completion.
  - [x] Test medium and low findings are tracked with disposition.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Story 6.3 provides validation result shape.
- Story 5.2 and Story 5.3 provide rule/drift concepts; this story accepts review findings as inputs rather than rerunning all validators.
- Story 6.5 will enforce final stop/state update and done Journal ordering.

### API Guidance

- Prefer `runSelfReview({ projectRoot, taskId, validationResult, checks, now })`.
- Disposition values: `blocks-completion`, `tracked`, `resolved`, `approved-exception`.
- [ASSUMPTION] Failed validation is a critical self-review finding.
- [ASSUMPTION] Medium/low findings default to `tracked`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 6.3](./6-3-run-task-validation-commands.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 29 test files, 115 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added self-review engine.
- Failed validation becomes critical self-review finding and blocks completion.
- Medium and low findings default to tracked disposition.
- Self-review report writes to Journal before later done-state handling.
- Added tests for journal report, critical blocker, and medium/low disposition tracking.

### File List

- `packages/execution-engine/src/review-engine.ts`
- `packages/execution-engine/src/review-engine.test.ts`
- `packages/execution-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented self-review engine, Journal report, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 29 test files, 115 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
