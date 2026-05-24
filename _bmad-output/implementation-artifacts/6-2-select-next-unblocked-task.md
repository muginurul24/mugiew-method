# Story 6.2: Select Next Unblocked Task

Status: done

## Story

As an Autonomous Project Maintainer,
I want YOLO-RUN to select only unblocked Tasks,
so that runtime execution follows the dependency graph.

## Acceptance Criteria

1. Given approved Project State and Task Graph exist, when runtime selects work, then only Tasks with satisfied dependencies are eligible.
2. Given runtime selects work, then selection records chosen Task ID and rationale.
3. Given blocked Tasks exist, then no blocked Task can be selected.

## Tasks / Subtasks

- [x] Implement runtime task selection result (AC: 1-3)
  - [x] Add selected-task result with task ID and rationale.
  - [x] Return no-work result when no pending unblocked task exists.
  - [x] Never select blocked tasks.
- [x] Implement project-level selection and journal (AC: 2)
  - [x] Read `state/dependency-graph.json`.
  - [x] Write task selection Journal entry with chosen task and rationale.
  - [x] Preserve existing pure selector behavior.
- [x] Add focused tests (AC: 1-3)
  - [x] Test only pending unblocked tasks are eligible.
  - [x] Test selection rationale is recorded.
  - [x] Test blocked tasks are never selected.
  - [x] Test project-level selection writes Journal.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Story 4.3 already added `selectNextUnblockedTask(graph)`.
- This story adds runtime-facing result shape and journal evidence.
- Do not execute task validation commands yet; Story 6.3 owns command execution.

### API Guidance

- Prefer `selectRuntimeTask(graph)`.
- Prefer `selectRuntimeTaskFromProject({ projectRoot, now })`.
- [ASSUMPTION] Selection order remains dependency graph order for deterministic runtime behavior.
- [ASSUMPTION] No-work state is safe and should not fabricate a task.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 4.3](./4-3-maintain-dependency-graph.md)
- [Story 6.1](./6-1-enforce-yolo-run-gate-denial.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 27 test files, 108 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added runtime task selection result shape.
- Added project-level task selection from `state/dependency-graph.json`.
- Added task selection Journal entry with selected task ID and rationale.
- Preserved existing pure unblocked selector behavior.
- Added tests for unblocked selection, rationale, blocked exclusion, and Journal writing.

### File List

- `packages/execution-engine/src/task-selection.ts`
- `packages/execution-engine/src/task-selection.test.ts`
- `packages/execution-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented runtime task selection wrapper, project-level selection journal, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 27 test files, 108 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
