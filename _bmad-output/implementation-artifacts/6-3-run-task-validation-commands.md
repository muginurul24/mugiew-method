# Story 6.3: Run Task Validation Commands

Status: done

## Story

As an AI-native Engineer,
I want runtime to run task-bound validation commands,
so that task completion is based on evidence.

## Acceptance Criteria

1. Given a selected Task declares validation commands, when validation runner executes, then commands run through approved Execa-based execution path.
2. Given validation commands run, then command output and exit status are captured.
3. Given validation fails, then runtime stops and writes Journal entry.
4. Given runtime runs validation, then commands are task-bound and not invented by runtime.

## Tasks / Subtasks

- [x] Add Execa dependency to execution-engine (AC: 1)
  - [x] Add current Execa dependency.
  - [x] Keep command execution scoped to validation runner.
- [x] Implement validation runner (AC: 1-4)
  - [x] Add `packages/execution-engine/src/validation-runner.ts`.
  - [x] Execute only commands declared on selected `TaskFile`.
  - [x] Capture stdout, stderr, and exit status.
  - [x] Stop on first failed command.
  - [x] Write validation failure Journal entry.
- [x] Add focused tests (AC: 1-4)
  - [x] Test command output and exit status capture.
  - [x] Test failure stops remaining commands.
  - [x] Test failure writes Journal.
  - [x] Test runner uses task-bound commands only.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Story 4.1 Task contract includes `validationCommands`.
- Story 6.2 selects task; this story only runs validation for provided task.
- Do not invent validation commands. Empty command list is impossible for valid `TaskFile`.
- Use Execa as approved command execution path.

### API Guidance

- Prefer `runTaskValidation({ projectRoot, task, now })`.
- Return per-command results with `command`, `exitCode`, `stdout`, `stderr`.
- [ASSUMPTION] MVP command strings can be split with shell-like parsing disabled by passing through Execa shell mode only when necessary.
- [ASSUMPTION] Validation runner runs in `projectRoot`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 4.1](./4-1-define-task-file-contract.md)
- [Story 6.2](./6-2-select-next-unblocked-task.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk npm view execa version` returned `9.6.1`.
- `rtk proxy pnpm add execa@9.6.1 --filter @mugiew-method/execution-engine` succeeded.
- Initial validation runner tests failed because Execa command-string execution needed shell mode for task-declared command strings; patched to `shell: true`.
- `rtk proxy pnpm test -- packages/execution-engine/src/validation-runner.test.ts` passed.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 28 test files, 112 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added Execa-based validation runner.
- Runner executes only `TaskFile.validationCommands`.
- Captures command, exit code, stdout, and stderr.
- Stops on first failed validation command.
- Writes validation failure Journal entry.
- Added tests for output capture, failure stop, Journal write, and task-bound command execution.

### File List

- `packages/execution-engine/package.json`
- `packages/execution-engine/src/validation-runner.ts`
- `packages/execution-engine/src/validation-runner.test.ts`
- `packages/execution-engine/src/index.ts`
- `pnpm-lock.yaml`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented Execa validation runner, failure Journal, exports, dependency, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 28 test files, 112 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
