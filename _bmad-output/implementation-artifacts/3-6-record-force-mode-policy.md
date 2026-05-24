# Story 3.6: Record Force Mode Policy

Status: done

## Story

As an Autonomous Project Maintainer,
I want force mode policy explicit and logged,
so that risky bypasses are never invisible.

## Acceptance Criteria

1. Given force mode is requested for an otherwise denied gate, when force mode policy is evaluated, then explicit confirmation is required.
2. Given force mode proceeds, then a high-severity Journal entry is written.
3. Given policy does not allow force mode, then force mode is disabled or unavailable.
4. Given tests run, then denied, confirmed, and unavailable force mode paths are covered.

## Tasks / Subtasks

- [x] Implement force mode policy evaluator (AC: 1, 3)
  - [x] Add policy inputs for allowed, requested, confirmed, reason, and actor.
  - [x] Require explicit confirmation and reason.
  - [x] Return unavailable when policy disables force mode.
- [x] Implement force mode journal entry writer (AC: 2)
  - [x] Add high-severity journal entry content.
  - [x] Write under `_mugiew-method/journal`.
- [x] Add focused tests (AC: 1-4)
  - [x] Test denied path when confirmation missing.
  - [x] Test confirmed path writes journal entry.
  - [x] Test unavailable path when policy disallows force mode.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 3.5 approval gate returns denied conditions.
- This story does not enable force by default. It only defines explicit policy behavior.
- Journal entries must make risky bypasses visible to future agents.

### API Guidance

- [ASSUMPTION] Force mode policy lives in governance-engine for approval/specification gates.
- [ASSUMPTION] Journal file name can be timestamp/id derived and Markdown formatted for MVP.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 3.5](./3-5-enforce-approval-gate.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 16 test files, 62 tests before review patch; 63 tests after review patch.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found blank actor/reason could still approve force mode; patched trim validation and added test.

### Completion Notes List

- Added force mode policy evaluator.
- Added high-severity force mode journal entry renderer and writer.
- Force mode now returns unavailable when policy disallows it.
- Explicit confirmation, actor, and non-empty reason are required before approval.
- Added tests for confirmation-required, confirmed journal write, unavailable policy, and blank actor/reason guard.

### File List

- `packages/governance-engine/src/force-mode-policy.ts`
- `packages/governance-engine/src/force-mode-policy.test.ts`
- `packages/governance-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented force mode policy evaluator, high-severity journal writer, exports, and tests.
- 2026-05-24: Addressed review finding for blank actor/reason approval.

## Senior Developer Review (AI)

Review completed.

### Findings

- Medium: confirmed force mode could proceed with blank `actor` or `reason`, weakening explicit confirmation. Fixed by requiring non-empty trimmed actor and reason, plus regression test.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 16 test files, 63 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
