# Story 4.1: Define Task File Contract

Status: done

## Story

As an AI-native Engineer,
I want each Task to have a strict contract,
so that implementation work is traceable, testable, and safe for AI agents.

## Acceptance Criteria

1. Given `packages/core`, when Task schema is implemented, then Task files include ID, title, concern, source PRD IDs, dependencies, acceptance criteria, validation commands, expected files or areas, and rollback notes.
2. Given broad multi-concern tasks exist, then broad multi-concern tasks are rejected or flagged.
3. Given schema validation runs, then schema validation covers valid and invalid Task examples.

## Tasks / Subtasks

- [x] Add Task file contract in core (AC: 1-3)
  - [x] Add `packages/core/src/contracts/task-file.ts`.
  - [x] Define required fields.
  - [x] Use Zod validation.
  - [x] Reject or flag multi-concern tasks.
- [x] Add parse helper (AC: 3)
  - [x] Return typed Task for valid data.
  - [x] Convert invalid state to `ValidationError`.
- [x] Add focused tests (AC: 1-3)
  - [x] Test valid Task parses.
  - [x] Test missing required fields fail.
  - [x] Test multi-concern tasks fail or are flagged.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Core owns shared contracts.
- Task generation occurs later. This story only defines schema and validation.
- JSON fields should be camelCase.

### API Guidance

- Prefer `parseTaskFile(data: unknown): TaskFile`.
- [ASSUMPTION] `concern` is a single non-empty string and `additionalConcerns` is forbidden in MVP to enforce one concern per task.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 17 test files, 66 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added strict Zod Task file schema in core.
- Required task fields include ID, title, concern, source PRD IDs, dependencies, acceptance criteria, validation commands, expected files/areas, and rollback notes.
- Added `parseTaskFile` helper converting invalid schema to `ValidationError`.
- Strict schema rejects extra broad multi-concern fields such as `additionalConcerns`.
- Added tests for valid task, missing required field, and multi-concern rejection.

### File List

- `packages/core/src/contracts/task-file.ts`
- `packages/core/src/contracts/task-file.test.ts`
- `packages/core/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented Task file contract, parser, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 17 test files, 66 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
