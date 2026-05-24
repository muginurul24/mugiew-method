# Story 7.5: Add Dependency Graph Cycle Detection

Status: done

## Story

As an AI-native Engineer,
I want dependency graph rebuild and runtime selection to detect cycles,
so that autonomous execution does not stall on opaque blocked states.

## Acceptance Criteria

1. Given tasks contain cyclic dependencies, when dependency graph is parsed, rebuilt, or selected for runtime, then cycle findings identify involved task IDs.
2. Given dependency graph has cycles, when `/project-status` runs, then cycle blockers are reported.
3. Given dependency graph has cycles, when runtime task selection runs, then it stops safely with cycle reason.
4. Given direct and indirect cycles exist, then tests cover both.

## Tasks / Subtasks

- [x] Add cycle detection primitive (AC: 1, 4)
  - [x] Add deterministic cycle detector in execution-engine/core contract surface.
  - [x] Identify direct self-cycle and indirect multi-task cycle.
  - [x] Return involved task IDs in stable order.
- [x] Enforce cycle findings in graph creation/selection (AC: 1, 3)
  - [x] Ensure `createDependencyGraph` can report cycles through detector.
  - [x] Ensure runtime selection refuses cyclic graphs with explicit rationale.
  - [x] Keep non-cyclic selection behavior unchanged.
- [x] Surface cycle blockers in project status (AC: 2)
  - [x] Add status blocker text for dependency graph cycles.
  - [x] Avoid crashing on valid graphs without cycles.
- [x] Add tests (AC: 1-4)
  - [x] Direct self-cycle.
  - [x] Indirect cycle.
  - [x] Runtime selection stops with cycle reason.
  - [x] Project status reports cycle blocker.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

### Current State

- `packages/execution-engine/src/dependency-graph.ts` marks dependencies as `pending`, `completed`, or `missing`.
- `selectNextUnblockedTask(graph)` returns the first `pending` node and knows nothing about cycles.
- `packages/execution-engine/src/task-selection.ts` returns `No pending task has all dependencies satisfied.` when no pending task is selectable.
- `packages/governance-engine/src/project-status.ts` currently reports blocked task counts but not graph cycles.
- `packages/core/src/contracts/dependency-graph.ts` validates shape and duplicate IDs, but not cycles.

### Architecture Rules

- Keep graph behavior deterministic.
- Keep shared schema contracts in core only when persisted shape changes.
- Prefer pure evaluator functions in execution-engine and filesystem wrappers separately.
- Do not put business logic in CLI.

### Implementation Guidance

- Preferred API:
  - `detectDependencyCycles(graph: DependencyGraph): DependencyCycleFinding[]`
  - `DependencyCycleFinding = { taskIds: string[] }`
- Do not reject persisted graph schema solely because cycles exist unless tests and callers are updated. Runtime/status need inspectable blockers more than parse failure.
- Runtime selection should return `selected: false` with rationale like `Dependency graph contains cycles: TASK-001 -> TASK-002 -> TASK-001`.
- Project status can import a pure detector from execution-engine if needed, or duplicate minimal logic only if package boundaries require it. Avoid dependency cycles between packages.

### Files Likely Touched

- `packages/execution-engine/src/dependency-graph.ts`
- `packages/execution-engine/src/dependency-graph.test.ts`
- `packages/execution-engine/src/task-selection.ts`
- `packages/execution-engine/src/task-selection.test.ts`
- `packages/execution-engine/src/index.ts`
- `packages/governance-engine/src/project-status.ts`
- `packages/governance-engine/src/project-status.test.ts`
- `_bmad-output/implementation-artifacts/7-5-add-dependency-graph-cycle-detection.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Regression Requirements

- Existing dependency status calculation remains unchanged.
- Existing completed task trace validation remains unchanged.
- Existing runtime selection still selects the first unblocked pending task when no cycle exists.
- Existing project status output remains parseable and includes prior blockers.

### References

- `_bmad-output/planning-artifacts/epics.md` - Story 7.5 definition.
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24.md` - launch hardening order.
- `_bmad-output/implementation-artifacts/4-3-maintain-dependency-graph.md`
- `_bmad-output/implementation-artifacts/6-2-select-next-unblocked-task.md`
- `packages/execution-engine/src/dependency-graph.ts`
- `packages/execution-engine/src/task-selection.ts`
- `packages/governance-engine/src/project-status.ts`
- `_bmad-output/project-context.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm test packages/core/src/contracts/dependency-graph.test.ts packages/execution-engine/src/dependency-graph.test.ts packages/execution-engine/src/task-selection.test.ts packages/governance-engine/src/project-status.test.ts` passed: 4 files, 27 tests.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 31 files, 143 tests.
- `rtk proxy pnpm build` passed.
- Code review subagent layers timed out twice and were shut down. Local code review found no actionable finding beyond verification of deterministic cycle formatting.

### Completion Notes List

- Story context created for dependency graph cycle detection.
- Added deterministic dependency cycle detector shared through core.
- Runtime task selection now refuses cyclic graphs with explicit cycle rationale.
- Project status now reports dependency graph cycle blockers.
- Added tests for direct cycles, indirect cycles, runtime selection, and project status blocker output.

### File List

- `_bmad-output/implementation-artifacts/7-5-add-dependency-graph-cycle-detection.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/core/src/contracts/dependency-graph.ts`
- `packages/core/src/contracts/dependency-graph.test.ts`
- `packages/core/src/index.ts`
- `packages/execution-engine/src/dependency-graph.ts`
- `packages/execution-engine/src/task-selection.ts`
- `packages/execution-engine/src/task-selection.test.ts`
- `packages/execution-engine/src/index.ts`
- `packages/governance-engine/src/project-status.ts`
- `packages/governance-engine/src/project-status.test.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented dependency graph cycle detection, runtime stop rationale, status blocker, and tests.
- 2026-05-24: Code review completed with local verification after review layers timed out; story marked done.

## Senior Developer Review (AI)

Review completed with local verification. Parallel review layers timed out twice and were shut down.

### Findings

No actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 31 files, 143 tests.
- `rtk proxy pnpm build` passed.
