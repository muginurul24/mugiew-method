# Story 7.6: Clarify Discovery Runtime Scope

Status: done

## Story

As an AI-native Engineer,
I want `/create-prd` behavior to clearly distinguish bootstrap primitives from full conversational discovery,
so that product claims and CLI behavior stay aligned.

## Acceptance Criteria

1. Given `/create-prd` starts discovery, when current implementation creates or resumes discovery state, then CLI output names the current discovery phase accurately.
2. Given adaptive interrogation is not implemented, then documentation states it is pending.
3. Given adaptive runtime is deferred, then backlog records full adaptive runtime explicitly.

## Tasks / Subtasks

- [x] Add discovery scope fields to start result (AC: 1)
- [x] Update CLI output to name bootstrap phase (AC: 1)
- [x] Document current discovery runtime scope (AC: 2)
- [x] Record adaptive runtime backlog item (AC: 3)
- [x] Add/update tests and run validations (AC: 1-3)

## Dev Notes

- Current `startDiscovery` creates/resumes artifacts only.
- Project context says discovery engine has primitives/bootstrap, not full adaptive runtime.
- Keep CLI adapter thin; source of scope truth belongs in discovery-engine.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-24: `rtk proxy pnpm test packages/discovery-engine/src/start-discovery.test.ts` passed.
- 2026-05-24: `rtk proxy pnpm typecheck` passed.
- 2026-05-24: `rtk proxy pnpm test` passed: 31 files, 150 tests.
- 2026-05-24: `rtk proxy pnpm build` passed.
- 2026-05-24: Code review found missing direct CLI output regression coverage; patched with `formatCreatePrdResult` test.
- 2026-05-24: `rtk proxy pnpm test packages/cli/src/commands/create-prd.test.ts packages/discovery-engine/src/start-discovery.test.ts` passed: 2 files, 5 tests.
- 2026-05-24: `rtk proxy pnpm typecheck` passed after review patch.
- 2026-05-24: `rtk proxy pnpm build` passed after review patch.
- 2026-05-24: `rtk proxy pnpm test` passed after review patch: 32 files, 151 tests.

### Completion Notes List

- Story context created.
- `startDiscovery` now returns explicit discovery scope metadata: `phase`, `adaptiveInterrogation`, and `scopeNote`.
- `/create-prd` CLI output now names bootstrap primitive scope and pending adaptive interrogation.
- Current discovery runtime scope is documented separately from full adaptive runtime claims.
- Deferred adaptive runtime backlog captures required capabilities and reason for deferral.
- CLI output regression test now verifies phase, adaptive interrogation state, scope note, and created/existing path sections.
- Code review complete; no remaining patch findings for this story.

### File List

- `_bmad-output/implementation-artifacts/7-6-clarify-discovery-runtime-scope.md`
- `_bmad-output/planning-artifacts/adaptive-discovery-runtime-backlog.md`
- `docs/discovery-runtime-scope.md`
- `docs/index.md`
- `packages/cli/src/commands/create-prd.test.ts`
- `packages/cli/src/commands/create-prd.ts`
- `packages/discovery-engine/src/start-discovery.test.ts`
- `packages/discovery-engine/src/start-discovery.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented discovery runtime scope clarification and moved story to review.
- 2026-05-24: Patched review finding, completed validation, and marked story done.
