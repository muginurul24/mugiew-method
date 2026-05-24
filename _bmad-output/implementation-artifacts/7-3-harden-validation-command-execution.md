# Story 7.3: Harden Validation Command Execution

Status: done

## Story

As an AI-native Engineer,
I want task validation commands to have execution limits and explicit trust boundaries,
so that YOLO-RUN cannot hang or silently leak sensitive environment data.

## Acceptance Criteria

1. Given a task declares validation commands, when validation runner executes them, then commands support timeout behavior.
2. Given validation commands produce large stdout/stderr, when results are captured, then output is bounded or explicitly truncated.
3. Given validation fails because of timeout or output limits, when failure Journal is written, then it records timeout or output-limit reason.
4. Given validation command execution exists, then trusted project-local command boundary is documented.
5. Given validation runner behavior changes, then tests cover success, failure, timeout, and truncation behavior.

## Tasks / Subtasks

- [x] Add validation execution policy constants/types (AC: 1, 2, 4)
  - [x] Define default timeout.
  - [x] Define default output limit.
  - [x] Add result fields for timed out/truncated output.
  - [x] Document trusted project-local command model in code-facing exported constant or Markdown artifact.
- [x] Harden Execa execution path (AC: 1, 2)
  - [x] Pass timeout option to Execa.
  - [x] Bound stdout/stderr stored in memory and Journal.
  - [x] Preserve command, exit code, stdout, stderr behavior for normal success/failure.
- [x] Improve failure Journal evidence (AC: 3)
  - [x] Include failure reason.
  - [x] Include timeout flag when command timed out.
  - [x] Include truncation markers when stdout/stderr are truncated.
- [x] Add tests (AC: 1, 2, 3, 5)
  - [x] Existing success behavior still passes.
  - [x] Existing non-zero failure behavior still passes.
  - [x] Timeout is reported as validation failure and journaled.
  - [x] Long stdout/stderr is truncated and marked.
- [x] Validate package quality (AC: 1-5)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

### Current State

- `packages/execution-engine/src/validation-runner.ts` executes task-declared strings through `execaCommand(command, { cwd, reject: false, shell: true })`.
- Current results contain only `command`, `exitCode`, `stdout`, and `stderr`.
- Current runner can hang indefinitely and can store unbounded command output in memory and Journal.
- Current Journal writes full stdout/stderr into `_mugiew-method/journal/*-validation-failed-<task>.md`.

### Architecture Rules

- Validation commands are trusted project-local commands, not untrusted external input.
- Shell execution remains task-bound: runner must execute only `TaskFile.validationCommands`.
- Keep execution logic inside `packages/execution-engine`; do not move business logic into CLI.
- Use Execa as approved execution wrapper.
- Preserve deterministic result shape; additive fields are allowed.

### Implementation Guidance

- Suggested defaults:
  - `DEFAULT_VALIDATION_TIMEOUT_MS = 120_000`
  - `DEFAULT_VALIDATION_OUTPUT_LIMIT_BYTES = 64_000`
- Suggested result additions:
  - `timedOut: boolean`
  - `stdoutTruncated: boolean`
  - `stderrTruncated: boolean`
  - `failureReason?: "exit-code" | "timeout" | "output-truncated"`
- If Execa exposes timeout failure with a signal or timedOut property, normalize it instead of leaking raw Execa internals.
- Truncation should preserve beginning of output plus clear marker such as `[truncated to 64000 bytes]`.
- Output-limit behavior may truncate and continue; if command exits non-zero, Journal reason should include both exit code and truncation flags.

### Files Likely Touched

- `packages/execution-engine/src/validation-runner.ts`
- `packages/execution-engine/src/validation-runner.test.ts`
- `packages/execution-engine/src/index.ts` if new constants/types are exported
- `_bmad-output/implementation-artifacts/7-3-harden-validation-command-execution.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Regression Requirements

- Existing success command output test still passes.
- Existing first failure stop behavior still passes.
- Existing validation failure Journal test still passes.
- Existing task-bound command behavior still passes.
- No new dependency unless clearly necessary.

### References

- `_bmad-output/planning-artifacts/epics.md` - Story 7.3 definition.
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24.md` - validation runner launch gap and trust boundary.
- `_bmad-output/implementation-artifacts/6-3-run-task-validation-commands.md`
- `packages/execution-engine/src/validation-runner.ts`
- `packages/execution-engine/src/validation-runner.test.ts`
- `_bmad-output/project-context.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm test packages/execution-engine/src/validation-runner.test.ts` passed: 1 file, 6 tests.
- `rtk proxy pnpm test` passed: 31 files, 137 tests.
- `rtk proxy pnpm typecheck` initially failed due literal type widening for `failureReason`; fixed by typing `ValidationCommandResult`.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm build` passed.
- Code review found 4 actionable findings:
  - output was truncated after capture; fixed with Execa `maxBuffer` plus truncation flags.
  - output-limit failure reason absent; added `output-limit` normalization where Execa reports max buffer.
  - raw task ID was used in Journal filename; added filename segment sanitization.
  - same task/timestamp Journal collisions could throw; added high-resolution suffix.
- `rtk proxy pnpm test packages/execution-engine/src/validation-runner.test.ts` passed after review fixes: 1 file, 8 tests.
- `rtk proxy pnpm typecheck` passed after review fixes.
- `rtk proxy pnpm test` passed after review fixes: 31 files, 139 tests.
- `rtk proxy pnpm build` passed after review fixes.
- Edge Case Hunter layer timed out and was shut down after local/full validation; Blind Hunter and Acceptance Auditor findings were resolved.

### Completion Notes List

- Story context created for validation command hardening.
- Added default validation timeout and output-limit constants.
- Added exported trust-boundary constant for project-local task commands.
- Validation results now include timeout/truncation flags and failure reason.
- Validation runner passes timeout to Execa and truncates captured stdout/stderr before storing results or Journal output.
- Failure Journal now records failure reason, timeout status, truncation flags, and trust boundary.
- Added tests for timeout and truncation while preserving success/failure behavior.
- Added output-limit normalization, task ID filename sanitization, and collision-resistant validation failure Journal names after code review.

### File List

- `_bmad-output/implementation-artifacts/7-3-harden-validation-command-execution.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/execution-engine/src/validation-runner.ts`
- `packages/execution-engine/src/validation-runner.test.ts`
- `packages/execution-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented validation command timeout, bounded output capture, Journal evidence, trust-boundary export, and tests.
- 2026-05-24: Addressed code review findings and marked story done.

## Senior Developer Review (AI)

Review completed. All actionable findings from completed layers were fixed. Edge Case Hunter layer timed out and was shut down after repeated waits.

### Findings Resolved

- [x] [High] Output was bounded only after Execa materialized stdout/stderr. Added `maxBuffer` and output-limit markers.
- [x] [Medium] Journal could not record output-limit reason. Added `output-limit` failure reason normalization.
- [x] [High] Raw task ID in Journal filename could allow path reshaping. Added sanitized filename segment.
- [x] [Low] Same timestamp/task failure could collide. Added high-resolution suffix.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 31 files, 139 tests.
- `rtk proxy pnpm build` passed.
