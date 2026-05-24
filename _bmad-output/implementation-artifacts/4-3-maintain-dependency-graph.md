# Story 4.3: Maintain Dependency Graph

Status: done

## Story

As an Autonomous Project Maintainer,
I want a machine-readable Task Graph,
so that autonomous execution only selects safe unblocked work.

## Acceptance Criteria

1. Given generated Tasks exist, when dependency graph generation runs, then `state/dependency-graph.json` records each Task and dependency status.
2. Given Tasks have incomplete dependencies, then blocked Tasks cannot be selected by runtime helpers.
3. Given Tasks are completed, then completed Tasks remain traceable to PRD IDs and Journal entries.

## Tasks / Subtasks

- [x] Define dependency graph contract in core (AC: 1, 3)
  - [x] Add `packages/core/src/contracts/dependency-graph.ts`.
  - [x] Include `schemaVersion`, `updatedAt`, task nodes, dependency statuses, PRD trace, and journal trace.
  - [x] Validate graph payloads with `ValidationError` on invalid data.
  - [x] Export contract from `packages/core/src/index.ts`.
- [x] Implement dependency graph generation in execution-engine (AC: 1, 3)
  - [x] Add `packages/execution-engine/src/dependency-graph.ts`.
  - [x] Build one graph node per `TaskFile`.
  - [x] Resolve dependency status from task completion input.
  - [x] Preserve `sourcePrdIds` and journal entries for completed tasks.
- [x] Implement runtime selection helper (AC: 2)
  - [x] Add helper that returns next unblocked pending task.
  - [x] Ensure blocked tasks are never selected while dependencies remain incomplete.
  - [x] Keep selection deterministic by task order.
- [x] Add focused tests (AC: 1-3)
  - [x] Test graph generation records all tasks and dependency statuses.
  - [x] Test blocked tasks cannot be selected.
  - [x] Test completed tasks retain PRD and journal trace.
  - [x] Test invalid dependency graph throws `ValidationError`.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Story 4.1 defines the strict Task file contract in core.
- Story 4.2 generates granular `TaskFile[]` from structured concerns.
- Architecture names expected modules:
  - `packages/core/src/contracts/dependency-graph.ts`
  - `packages/execution-engine/src/dependency-graph.ts`
  - `packages/execution-engine/src/task-selector.ts`
- Keep engine functions pure for now. Filesystem write to `_mugiew-method/state/dependency-graph.json` can be wired into CLI/runtime later.

### API Guidance

- Prefer `createDependencyGraph({ tasks, completedTaskIds, journalEntries, updatedAt })`.
- Prefer `selectNextUnblockedTask(graph)` for deterministic runtime selection.
- [ASSUMPTION] MVP task status values are `pending`, `blocked`, and `completed`.
- [ASSUMPTION] Journal trace can be supplied as a record keyed by Task ID until journal writer exists in Epic 6.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 4.1](./4-1-define-task-file-contract.md)
- [Story 4.2](./4-2-generate-granular-tasks.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 20 test files, 77 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found completed tasks could be emitted without journal trace; patched with schema validation and tests.
- Code review found duplicate Task IDs were not rejected; patched with schema validation and tests.
- `rtk proxy pnpm typecheck` passed after review fixes.
- `rtk proxy pnpm test` passed after review fixes: 20 test files, 80 tests.
- `rtk proxy pnpm build` passed after review fixes.
- `rtk proxy pnpm check` passed after review fixes.

### Completion Notes List

- Added strict dependency graph contract in core.
- Added execution-engine graph builder with dependency status resolution.
- Added deterministic next-unblocked-task selector.
- Preserved PRD trace and journal trace on graph nodes.
- Added tests for graph recording, blocked selection behavior, completed trace, missing dependencies, and invalid graph payloads.
- Added review hardening for duplicate Task IDs and mandatory journal trace on completed tasks.

### File List

- `packages/core/src/contracts/dependency-graph.ts`
- `packages/core/src/contracts/dependency-graph.test.ts`
- `packages/core/src/index.ts`
- `packages/execution-engine/src/dependency-graph.ts`
- `packages/execution-engine/src/dependency-graph.test.ts`
- `packages/execution-engine/src/task-selector.ts`
- `packages/execution-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented dependency graph contract, graph builder, selector helper, exports, and tests.
- 2026-05-24: Addressed code review findings for duplicate task IDs and missing completed-task journal trace.

## Senior Developer Review (AI)

Review completed. Two actionable findings patched during review.

### Findings Resolved

- [x] Completed graph tasks could be created without journal trace, violating AC-3. Added conditional schema validation and tests.
- [x] Duplicate graph task IDs were accepted, making dependency resolution ambiguous. Added uniqueness validation and tests.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 20 test files, 80 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
