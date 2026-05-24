# Story 6.5: Stop Runtime Safely and Update State

Status: done

## Story

As an AI-native Engineer,
I want YOLO-RUN to stop safely on blockers or completion,
so that future agents know exactly what happened.

## Acceptance Criteria

1. Given runtime reaches blocker, failed validation, pause, or completion, when runtime stops, then Project State marks status as blocked, failed, paused, or complete.
2. Given runtime stops, then Journal records stop reason and next suggested action.
3. Given runtime stops, then runtime does not invent missing approvals.
4. Given runtime stop state exists, then future `/project-status` reflects runtime stop state.

## Tasks / Subtasks

- [x] Implement runtime stop state writer (AC: 1, 3)
  - [x] Add `packages/execution-engine/src/runtime-stop.ts`.
  - [x] Write runtime status, reason, next suggested action, and timestamp into project state.
  - [x] Preserve existing project-state fields and approval records unchanged.
- [x] Implement stop Journal (AC: 2)
  - [x] Write stop reason and next suggested action to Journal.
- [x] Surface runtime stop state in project status (AC: 4)
  - [x] Add runtime stop fields to project status report and text output.
- [x] Add focused tests (AC: 1-4)
  - [x] Test blocked, failed, paused, and complete statuses can be written.
  - [x] Test Journal records stop reason and next action.
  - [x] Test approval is not invented.
  - [x] Test project status reflects runtime stop state.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Initial `project-state.json` currently contains install fields only. Add runtime fields as optional, preserving compatibility.
- Story 6.1 handles gate denial. This story does not create `prd-approval.json`.
- Story 6.4 writes self-review report; this story records final stop state and next action.

### API Guidance

- Prefer `stopRuntimeSafely({ projectRoot, status, reason, nextSuggestedAction, now })`.
- Runtime statuses: `blocked`, `failed`, `paused`, `complete`.
- [ASSUMPTION] Runtime stop state can live inside `state/project-state.json` under `runtime`.
- [ASSUMPTION] Stop Journal filename can be timestamped as `*-runtime-stopped.md`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 6.1](./6-1-enforce-yolo-run-gate-denial.md)
- [Story 6.4](./6-4-run-self-review-before-completion.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 30 test files, 122 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added runtime stop state writer.
- Runtime stop records `blocked`, `failed`, `paused`, or `complete` in `project-state.json`.
- Stop Journal records stop reason and next suggested action.
- Stop flow does not create approval records.
- Project status now reports runtime stop state.
- Added tests for all runtime stop statuses, Journal write, no approval invention, and status reporting.

### File List

- `packages/core/src/contracts/project-state.ts`
- `packages/execution-engine/src/runtime-stop.ts`
- `packages/execution-engine/src/runtime-stop.test.ts`
- `packages/execution-engine/src/index.ts`
- `packages/governance-engine/src/project-status.ts`
- `packages/governance-engine/src/project-status.test.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented runtime stop state, stop Journal, project-status runtime reflection, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 30 test files, 122 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
