# Story 4.2: Generate Granular Tasks

Status: done

## Story

As an AI-native Engineer,
I want approved specifications decomposed into granular Tasks,
so that each implementation unit can be handled by one dev agent.

## Acceptance Criteria

1. Given PRD and Specification Artifacts are approved, when Task generation runs, then generated Tasks preserve `1 task = 1 implementation concern`.
2. Given Tasks are generated, then every Task references at least one PRD ID.
3. Given Tasks are generated, then every Task includes acceptance criteria and validation expectations.
4. Given Task IDs are generated, then generated Task IDs are stable and zero-padded.

## Tasks / Subtasks

- [x] Implement task generator in execution-engine (AC: 1-4)
  - [x] Add `packages/execution-engine/src/task-generator.ts`.
  - [x] Generate one Task per input concern.
  - [x] Generate stable zero-padded Task IDs.
  - [x] Validate generated Tasks through core Task schema.
- [x] Add focused tests (AC: 1-4)
  - [x] Test one concern becomes one Task.
  - [x] Test PRD IDs are required.
  - [x] Test acceptance criteria and validation commands are present.
  - [x] Test stable zero-padded IDs.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 4.1 defines the Task file contract in core.
- Execution engine owns task graph and execution planning behavior.
- Approval artifact enforcement can be integrated later; this story focuses on deterministic task generation.

### API Guidance

- Prefer `generateTasksFromConcerns(input)`.
- [ASSUMPTION] MVP input is structured concern records extracted from approved PRD/spec artifacts.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 4.1](./4-1-define-task-file-contract.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 18 test files, 70 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added execution-engine task generator.
- Generated one validated Task per structured concern.
- Generated stable zero-padded Task IDs.
- Added tests for task count, PRD ID requirement, validation expectations, and stable IDs.
- Added execution-engine source export metadata.

### File List

- `packages/execution-engine/package.json`
- `packages/execution-engine/src/task-generator.ts`
- `packages/execution-engine/src/task-generator.test.ts`
- `packages/execution-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented granular task generator, exports, package source types, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 18 test files, 70 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
