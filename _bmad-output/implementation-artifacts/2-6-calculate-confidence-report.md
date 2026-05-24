# Story 2.6: Calculate Confidence Report

Status: done

## Story

As an AI-native Engineer,
I want a confidence score with contributing factors,
so that readiness is measurable instead of conversational.

## Acceptance Criteria

1. Given ambiguity, concern coverage, architecture completeness, and dependency clarity inputs, when confidence calculation runs, then `confidence-report.md` includes numeric score, factor breakdown, blocking count, and readiness state.
2. Given Blocking Ambiguity status changes, then the score changes.
3. Given Blocking Ambiguity count is greater than `0`, then score cannot report execution-ready.

## Tasks / Subtasks

- [x] Define confidence calculation model (AC: 1-3)
  - [x] Add factor inputs for ambiguity, concern coverage, architecture completeness, dependency clarity, edge-case coverage, requirement clarity, and execution predictability.
  - [x] Add readiness state union.
  - [x] Add score and blocking count output.
- [x] Implement confidence calculator (AC: 1-3)
  - [x] Add `packages/discovery-engine/src/confidence-calculator.ts`.
  - [x] Count unresolved blocking ambiguities.
  - [x] Calculate deterministic numeric score.
  - [x] Prevent execution-ready state while blocking count is greater than `0`.
- [x] Implement markdown renderer (AC: 1)
  - [x] Render numeric score.
  - [x] Render factor breakdown.
  - [x] Render blocking count and readiness state.
- [x] Add focused tests (AC: 1-3)
  - [x] Test report content includes score, factors, blocking count, readiness.
  - [x] Test score changes when blocking ambiguity status changes.
  - [x] Test readiness cannot be execution-ready with blocking ambiguities.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 2.1/2.4 define ambiguity contracts and blocking category detail.
- Story 2.3 provides concern coverage confidence inputs.
- This story calculates and renders report content only; approval gate enforcement comes later.
- Determinism matters more than perfect scoring model.

### API Guidance

- Prefer helper shape:

```ts
calculateConfidenceReport(inputs)
renderConfidenceReport(report)
```

- [ASSUMPTION] MVP readiness states: `DISCOVERY_IN_PROGRESS`, `READY_FOR_APPROVAL`, `EXECUTION_READY_BLOCKED`.
- [ASSUMPTION] Score can be capped below execution-ready threshold when blocking ambiguity count is greater than `0`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 2.3](./2-3-track-concern-coverage.md)
- [Story 2.4](./2-4-classify-ambiguities-and-assumptions.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 10 test files, 37 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added deterministic confidence calculator.
- Added readiness state and factor input/output types.
- Added markdown renderer for `confidence-report.md` content.
- Blocking ambiguity count now caps score below ready threshold and returns blocked readiness state.
- Added tests for report content, score change on blocking status change, and blocker readiness guard.

### File List

- `packages/discovery-engine/src/confidence-calculator.ts`
- `packages/discovery-engine/src/confidence-calculator.test.ts`
- `packages/discovery-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented confidence calculator, markdown renderer, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 10 test files, 37 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
