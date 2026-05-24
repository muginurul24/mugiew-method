# Story 5.4: Implement Review Project Command

Status: done

## Story

As an AI-native Engineer,
I want `/review-project` to run quality review without changing code,
so that I can inspect risk before continuing execution.

## Acceptance Criteria

1. Given project artifacts and optional task output exist, when `/review-project` runs, then review checks architecture drift, rule violations, task completion claims, and validation gaps.
2. Given review runs, then review writes report to Journal.
3. Given review runs without explicit fix mode, then review does not modify source code.

## Tasks / Subtasks

- [x] Implement review project service (AC: 1-3)
  - [x] Add governance-engine review service.
  - [x] Read architecture drift state, AGENTS.md, optional task output, dependency graph, and execution metrics.
  - [x] Report architecture drift, rule violations, task completion claim gaps, and validation gaps.
  - [x] Write review report to `_mugiew-method/journal`.
- [x] Implement CLI command (AC: 1-3)
  - [x] Add `packages/cli/src/commands/review-project.ts`.
  - [x] Register command in explicit oclif command map.
  - [x] Ensure command does not mutate source files.
- [x] Add focused tests (AC: 1-3)
  - [x] Test review findings include required categories.
  - [x] Test Journal report is written.
  - [x] Test source files are not modified.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Reuse Story 5.2 constitution validator for rule violations.
- Reuse Story 5.3 architecture drift state for drift findings.
- Keep fix mode out of scope. This story is read-only for source files and only writes Journal.

### API Guidance

- Prefer `reviewProject({ projectRoot, taskOutputs, now })`.
- Report categories: `architecture-drift`, `rule-violation`, `task-claim`, `validation-gap`.
- [ASSUMPTION] Task completion claim gap means completed graph task lacks journal trace or graph parsing fails.
- [ASSUMPTION] Validation gap means `execution-metrics.latestValidationStatus !== "passed"`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 5.2](./5-2-validate-work-against-agents-md.md)
- [Story 5.3](./5-3-detect-architecture-drift.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 25 test files, 100 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added governance-engine `reviewProject` service.
- Review checks architecture drift, rule violations, task claim gaps, and validation gaps.
- Review writes report to `_mugiew-method/journal`.
- Added `/review-project` CLI command.
- Added tests for finding categories, journal report, and no source mutation.

### File List

- `packages/governance-engine/src/review-project.ts`
- `packages/governance-engine/src/review-project.test.ts`
- `packages/governance-engine/src/index.ts`
- `packages/cli/src/commands/review-project.ts`
- `packages/cli/src/commands/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented review project service, CLI command, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 25 test files, 100 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
