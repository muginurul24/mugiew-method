# Story 5.1: Implement Project Status Command

Status: done

## Story

As an AI-native Engineer,
I want `/project-status` to report current readiness and progress,
so that I can understand project state without reading every artifact manually.

## Acceptance Criteria

1. Given Mugiew Method project state exists, when `/project-status` runs, then output includes confidence score, ambiguity count, PRD status, task progress, active blockers, architecture health, and latest validation status.
2. Given `/project-status` runs without flags, then default output is concise human-readable text.
3. Given `/project-status --json` runs, then output returns machine-readable status where supported.
4. Given contradictory Markdown/JSON state exists, then the contradiction is reported as drift.

## Tasks / Subtasks

- [x] Implement project status reader (AC: 1, 4)
  - [x] Add governance-engine status service.
  - [x] Read confidence report, ambiguity report, PRD approval state, dependency graph, and optional execution metrics.
  - [x] Compute task progress and active blockers.
  - [x] Report Markdown/JSON ambiguity count mismatch as drift.
- [x] Implement CLI command (AC: 2, 3)
  - [x] Add `packages/cli/src/commands/project-status.ts`.
  - [x] Register command in explicit oclif command map.
  - [x] Render concise human-readable output by default.
  - [x] Render machine-readable JSON with `--json`.
- [x] Add focused tests (AC: 1, 4)
  - [x] Test status includes required fields.
  - [x] Test task progress and blockers derive from dependency graph.
  - [x] Test contradictory confidence report and ambiguity JSON are reported as drift.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.
  - [x] Run `pnpm check`.

## Dev Notes

- Architecture maps `/project-status` to `packages/cli/src/commands/project-status.ts`.
- Use existing `createProjectPaths`, `parseAmbiguityReport`, and `parseDependencyGraph` contracts.
- Latest validation status can read optional `state/execution-metrics.json`; return `unknown` if absent.
- Architecture health can return `unknown` until Story 5.3 adds drift detector.

### API Guidance

- Prefer `getProjectStatus({ projectRoot })` in governance-engine.
- Prefer `renderProjectStatusText(status)` for CLI text output.
- [ASSUMPTION] `state/prd-approval.json` presence means `prdStatus: approved`; absence means `draft`.
- [ASSUMPTION] `state/execution-metrics.json.latestValidationStatus` is the MVP validation status input.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 4.3](./4-3-maintain-dependency-graph.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 22 test files, 88 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added governance-engine project status reader.
- Added concise text renderer and machine-readable report shape.
- Added `/project-status` CLI command with `--json`.
- Added drift reporting for confidence-report Markdown vs ambiguity-report JSON mismatch.
- Added tests for required fields, task progress/blockers, and drift.

### File List

- `packages/governance-engine/src/project-status.ts`
- `packages/governance-engine/src/project-status.test.ts`
- `packages/governance-engine/src/index.ts`
- `packages/cli/src/commands/project-status.ts`
- `packages/cli/src/commands/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented project status service, CLI command, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 22 test files, 88 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
