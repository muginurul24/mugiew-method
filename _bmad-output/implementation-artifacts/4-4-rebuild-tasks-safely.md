# Story 4.4: Rebuild Tasks Safely

Status: done

## Story

As an AI-native Engineer,
I want `/rebuild-tasks` to regenerate execution planning safely,
so that changed specs can update tasks without destroying completed history.

## Acceptance Criteria

1. Given existing Tasks and dependency graph exist, when `/rebuild-tasks` runs, then manual edits and completed task history are detected.
2. Given regenerated Tasks conflict with completed history, then conflicts are surfaced before overwrite.
3. Given completed Tasks exist, then completed task history is preserved.
4. Given regeneration runs, then regeneration reason is recorded.

## Tasks / Subtasks

- [x] Implement safe rebuild planner in execution-engine (AC: 1-4)
  - [x] Add `packages/execution-engine/src/rebuild-tasks.ts`.
  - [x] Accept existing Tasks, regenerated Tasks, existing dependency graph, regeneration reason, and timestamp.
  - [x] Detect manual task edits by comparing existing and regenerated task payloads.
  - [x] Detect completed task history from existing dependency graph.
  - [x] Surface conflicts for changed completed Tasks before overwrite.
  - [x] Preserve completed Tasks and journal trace in rebuilt dependency graph.
  - [x] Record regeneration reason and timestamp.
- [x] Export rebuild API (AC: 1-4)
  - [x] Export planner and result types from `packages/execution-engine/src/index.ts`.
- [x] Add focused tests (AC: 1-4)
  - [x] Test manual edits are detected.
  - [x] Test completed-task conflicts are surfaced.
  - [x] Test completed history and journal trace are preserved.
  - [x] Test regeneration reason is recorded.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Story 4.2 provides generated `TaskFile[]`.
- Story 4.3 provides `DependencyGraph`, `createDependencyGraph`, and completed-task journal trace validation.
- This story should not implement filesystem writes yet unless existing command wiring demands it. Keep rebuild behavior pure and deterministic so future CLI command can call it safely.
- `/rebuild-tasks` command wiring can be added later once command orchestration patterns are ready.

### API Guidance

- Prefer `rebuildTasksSafely({ existingTasks, regeneratedTasks, existingGraph, regenerationReason, updatedAt })`.
- Return conflicts instead of overwriting completed changed tasks silently.
- Preserve existing completed task payloads in the returned task list.
- [ASSUMPTION] Manual edits are detected by stable JSON comparison of same-ID Task payloads.
- [ASSUMPTION] A completed task whose regenerated payload differs is a conflict and must keep existing payload until human or later policy resolves it.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 4.2](./4-2-generate-granular-tasks.md)
- [Story 4.3](./4-3-maintain-dependency-graph.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` initially failed on `flatMap` literal inference; fixed with explicit loops.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 21 test files, 85 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added safe task rebuild planner.
- Detected manual task changes and removed tasks.
- Detected completed-task conflicts before overwrite.
- Preserved completed task payloads and journal trace when rebuilding dependency graph.
- Recorded regeneration reason and timestamp in result.

### File List

- `packages/execution-engine/src/rebuild-tasks.ts`
- `packages/execution-engine/src/rebuild-tasks.test.ts`
- `packages/execution-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented safe task rebuild planner, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 21 test files, 85 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
