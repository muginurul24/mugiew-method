# Story 2.3: Track Concern Coverage

Status: done

## Story

As an AI-native Engineer,
I want Discovery Engine to track hidden concern coverage,
so that important product risks are not missed during natural conversation.

## Acceptance Criteria

1. Given discovery answers exist, when concern coverage is evaluated, then applicable concerns are marked `covered`, `not-applicable`, or `unresolved`.
2. Given applicable concerns are unresolved, then unresolved applicable concerns produce Ambiguity entries.
3. Given coverage is evaluated, then coverage includes security, performance, deployment, API, testing, error handling, maintainability, AI readability, observability, accessibility, and scalability where applicable.
4. Given confidence calculation runs later, then concern coverage contributes confidence inputs.

## Tasks / Subtasks

- [x] Define concern coverage domain model (AC: 1, 3, 4)
  - [x] Add required default concern list.
  - [x] Add status union for `covered`, `not-applicable`, and `unresolved`.
  - [x] Add confidence input summary fields.
- [x] Implement coverage evaluator (AC: 1-4)
  - [x] Evaluate covered concerns from answer text and explicit covered input.
  - [x] Evaluate not-applicable concerns from explicit input.
  - [x] Mark remaining concerns unresolved.
  - [x] Generate Ambiguity entries for unresolved applicable concerns.
  - [x] Return confidence inputs based on concern counts.
- [x] Add focused tests (AC: 1-4)
  - [x] Test required concerns are present.
  - [x] Test statuses include covered, not-applicable, and unresolved.
  - [x] Test unresolved concerns produce Ambiguity entries.
  - [x] Test confidence input counts update from coverage.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 2.1 defines Ambiguity type/category.
- This story creates the internal checklist layer behind natural discovery. It does not need user-facing forms.
- Later confidence formula can consume the confidence input summary.
- Keep concern names deterministic and AI-readable.

### API Guidance

- Prefer helper shape:

```ts
evaluateConcernCoverage({ answers, coveredConcerns?, notApplicableConcerns? })
```

- [ASSUMPTION] Text matching can be simple keyword matching for MVP; adaptive discovery later can provide explicit coverage decisions.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 2.1](./2-1-create-discovery-state-contracts.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 7 test files, 26 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added deterministic discovery concern list.
- Added coverage status and confidence input types.
- Added `evaluateConcernCoverage` helper.
- Unresolved applicable concerns now produce blocking Ambiguity entries.
- Added tests for required concerns, statuses, ambiguity generation, and confidence input counts.

### File List

- `packages/discovery-engine/src/concern-coverage.ts`
- `packages/discovery-engine/src/concern-coverage.test.ts`
- `packages/discovery-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented concern coverage evaluator, ambiguity generation, confidence inputs, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 7 test files, 26 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
