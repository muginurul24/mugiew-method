# Story 7.2: Validate Approval Record Integrity Before YOLO-RUN

Status: done

## Story

As an Autonomous Project Maintainer,
I want YOLO-RUN to reject stale or malformed approvals,
so that execution cannot proceed after approved artifacts change.

## Acceptance Criteria

1. Given an approval record exists, when YOLO-RUN evaluates readiness, then the approval record schema is validated.
2. Given an approval record exists, when YOLO-RUN evaluates readiness, then current artifact versions are compared against approved artifact versions.
3. Given approval is stale, malformed, or missing, when YOLO-RUN evaluates readiness, then command returns `YOLO-RUN DENIED` with exact failed condition.
4. Given approval is stale, malformed, or missing, when `/project-status` runs, then it reports the approval state distinctly from normal draft/approved status.

## Tasks / Subtasks

- [x] Define approval record contract in core (AC: 1, 2)
  - [x] Add `packages/core/src/contracts/approval-record.ts`.
  - [x] Validate `schemaVersion`, `approvedAt`, and required artifact version entries.
  - [x] Require approved artifact keys for `PRD`, `confidence-report`, and `ambiguity-report`.
  - [x] Export parser and types from `packages/core/src/index.ts`.
  - [x] Add focused contract tests for valid, malformed, and missing artifact versions.
- [x] Centralize artifact version calculation for approval integrity (AC: 2)
  - [x] Replace local approval-gate version helper with reusable deterministic helper in governance or core.
  - [x] Preserve existing version format compatibility unless tests justify a migration.
  - [x] Compare current `PRD.md`, `confidence-report.md`, and `ambiguity-report.json` against approval record.
- [x] Harden YOLO-RUN gate evaluation (AC: 1, 2, 3)
  - [x] Change `YoloRunGateInput` from boolean approval to structured approval integrity state.
  - [x] Deny missing approval with existing `prdStatus != approved` condition.
  - [x] Deny malformed approval with `approvalRecord invalid`.
  - [x] Deny stale approval with a condition that names stale artifact keys.
  - [x] Keep blocking ambiguity and confidence threshold denial behavior unchanged.
  - [x] Write denial Journal entry with all failed conditions.
- [x] Report approval integrity in project status (AC: 4)
  - [x] Extend `PrdStatus` or add approval integrity field without breaking JSON readability.
  - [x] Report stale approval separately from draft and approved in human output.
  - [x] Include malformed approval as explicit drift or blocker state.
  - [x] Add tests for approved, draft, stale, and malformed approval status.
- [x] Update approval writer path to use shared contract (AC: 1, 2)
  - [x] Make `approvePrdProject` write records that pass the new core parser.
  - [x] Allow explicit approval record overwrite so re-approval can refresh stale approvals.
  - [x] Avoid business logic in CLI command classes.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

### Current State

- `packages/governance-engine/src/approval-gate.ts` already writes `_mugiew-method/state/prd-approval.json` with:
  - `schemaVersion: 1`
  - `approvedAt`
  - `approvedArtifactVersions`
- `approvePrdProject` currently calculates artifact versions for:
  - `_mugiew-method/prd/PRD.md`
  - `_mugiew-method/discovery/confidence-report.md`
  - `_mugiew-method/state/ambiguity-report.json`
- Version format before this story was `mtime:<mtimeMs>:size:<size>`. This story may replace it with content hashing if tests cover fresh/stale approval behavior.
- `packages/execution-engine/src/yolo-runtime.ts` currently treats approval as `await fileExists(prd-approval.json)`. This is the main bug.
- `packages/governance-engine/src/project-status.ts` currently reports `prdStatus: "approved" | "draft"` based only on approval file existence. This causes false confidence for stale or malformed approvals.

### Architecture Rules

- `packages/cli` remains adapter-only. Do not put approval validation logic in `packages/cli/src/commands/yolo-run.ts` or `project-status.ts`.
- Put shared persisted-state schemas in `packages/core/src/contracts`.
- Convert Zod validation failures into `ValidationError`.
- Use ESM local imports with `.js` suffix.
- Keep generated and status output deterministic.
- File writes to user projects must use `safeWriteFile`; status reads may use `fs.readFile`.

### Implementation Guidance

- Preferred core API:
  - `approvalRecordSchema`
  - `parseApprovalRecord(value: unknown): ApprovalRecord`
  - `ApprovalRecord`
- Preferred approval integrity model:
  - `missing`
  - `valid`
  - `malformed`
  - `stale`
- Preferred failed conditions:
  - missing: `prdStatus != approved`
  - malformed: `approvalRecord invalid`
  - stale: `approvalRecord stale: PRD, confidence-report`
- Project status should expose enough machine-readable detail for future agents. Do not hide malformed JSON behind `draft`.
- `readOptionalJson` currently calls `JSON.parse` directly. For malformed approval tests, either catch parse/schema errors in approval-specific reading path or convert them into explicit status instead of crashing.

### Files Likely Touched

- `packages/core/src/contracts/approval-record.ts` (new)
- `packages/core/src/contracts/approval-record.test.ts` (new)
- `packages/core/src/index.ts`
- `packages/governance-engine/src/approval-gate.ts`
- `packages/governance-engine/src/approval-gate.test.ts`
- `packages/governance-engine/src/project-status.ts`
- `packages/governance-engine/src/project-status.test.ts`
- `packages/execution-engine/src/yolo-runtime.ts`
- `packages/execution-engine/src/yolo-runtime.test.ts`
- `packages/governance-engine/src/index.ts` if exported status types change

### Regression Requirements

- Existing missing approval denial remains unchanged.
- Existing blocking ambiguity and confidence denial remain unchanged.
- Existing denial Journal write remains unchanged.
- Existing `approve-prd` success path still writes approval record under `_mugiew-method/state/prd-approval.json`.
- `project-status --json` must remain parseable and stable.

### Testing Requirements

- Contract tests:
  - valid approval record parses.
  - missing `approvedArtifactVersions` fails.
  - missing required artifact key fails.
  - non-object or wrong schema version fails.
- YOLO tests:
  - missing approval denied.
  - malformed approval denied and journaled.
  - stale approval denied and journaled.
  - fresh approval allowed when confidence and ambiguity gates pass.
- Project status tests:
  - draft when approval missing.
  - approved when record valid and current.
  - stale when artifact version differs.
  - malformed when JSON/schema invalid.

### Previous Story Intelligence

- Story 6.1 established `evaluateYoloRunGate(input)` as pure gate logic and `yoloRunProject({ projectRoot, now })` as filesystem entry.
- Story 6.1 maps gate denial to exit code `3` through `GateDeniedError`.
- Story 6.1 writes denial Journal files named `<timestamp>-yolo-run-denied.md`.
- Story 5.1 established `getProjectStatus({ projectRoot })` plus `renderProjectStatusText(status)`.
- Story 3.5 established approval threshold `90` and approval artifact versions.

### Project Context Reference

- Source: `_bmad-output/project-context.md`
- Runtime: Node.js `>=24.0.0`
- Package manager: pnpm `10.33.2`
- TypeScript: `^5.9.0`
- Zod: `4.4.3`
- Vitest: `^4.0.0`
- Critical rule: "YOLO-RUN currently treats approval file existence as approval. If changing launch-grade behavior, validate approval schema and artifact freshness."

### References

- `_bmad-output/planning-artifacts/epics.md` - Story 7.2 definition.
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24.md` - approved launch-hardening rationale and story order.
- `_bmad-output/planning-artifacts/architecture.md` - deterministic gate and schema rules.
- `docs/architecture.md` - current launch gap: approval records include versions, but YOLO-RUN checks existence only.
- `_bmad-output/implementation-artifacts/3-5-enforce-approval-gate.md`
- `_bmad-output/implementation-artifacts/5-1-implement-project-status-command.md`
- `_bmad-output/implementation-artifacts/6-1-enforce-yolo-run-gate-denial.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm test packages/core/src/contracts/approval-record.test.ts` passed: 1 file, 4 tests.
- `rtk proxy pnpm test packages/execution-engine/src/yolo-runtime.test.ts packages/governance-engine/src/project-status.test.ts packages/governance-engine/src/approval-gate.test.ts packages/core/src/contracts/approval-record.test.ts` passed after updating legacy approval fixtures: 4 files, 25 tests.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 31 files, 132 tests.
- `rtk proxy pnpm build` passed.
- Code review found 4 actionable findings:
  - stale detection used metadata only; fixed with SHA-256 artifact versions.
  - existing approval record could not be refreshed; fixed approval overwrite.
  - draft approval had no active blocker in status; fixed blocker output.
  - malformed ambiguity/state JSON could crash runtime/status; fixed controlled denial/status drift.
- `rtk proxy pnpm test packages/execution-engine/src/yolo-runtime.test.ts packages/governance-engine/src/project-status.test.ts packages/governance-engine/src/approval-gate.test.ts packages/core/src/contracts/approval-record.test.ts` passed after review fixes: 4 files, 28 tests.
- `rtk proxy pnpm typecheck` passed after review fixes.
- `rtk proxy pnpm test` passed after review fixes: 31 files, 135 tests.
- `rtk proxy pnpm build` passed after review fixes.

### Completion Notes List

- Story context created with approval-gate, YOLO-RUN, and project-status implementation guardrails.
- Added core approval record schema/parser requiring `PRD`, `confidence-report`, and `ambiguity-report` artifact versions.
- Added reusable SHA-256 file artifact version helper for approval integrity.
- Updated approval writer to validate records through the shared core parser before writing.
- Updated approval writer to overwrite the mutable approval state file during re-approval.
- Updated YOLO-RUN gate to distinguish missing, malformed, stale, and valid approval integrity states.
- Updated project status to report `draft`, `approved`, `stale`, and `malformed` PRD status with explicit blockers for stale/malformed approvals.
- Updated YOLO-RUN and project status handling for malformed ambiguity/state JSON discovered during review.

### File List

- `_bmad-output/implementation-artifacts/7-2-validate-approval-record-integrity-before-yolo-run.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/core/src/contracts/approval-record.ts`
- `packages/core/src/contracts/approval-record.test.ts`
- `packages/core/src/filesystem/artifact-version.ts`
- `packages/core/src/index.ts`
- `packages/governance-engine/src/approval-gate.ts`
- `packages/governance-engine/src/approval-gate.test.ts`
- `packages/governance-engine/src/index.ts`
- `packages/governance-engine/src/project-status.ts`
- `packages/governance-engine/src/project-status.test.ts`
- `packages/execution-engine/src/yolo-runtime.ts`
- `packages/execution-engine/src/yolo-runtime.test.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented approval record integrity validation for YOLO-RUN and project status.
- 2026-05-24: Addressed code review findings and marked story done.

## Senior Developer Review (AI)

Review completed. All actionable findings were fixed.

### Findings Resolved

- [x] [High] Artifact versioning used `mtime:size`, which could miss same-size content changes. Replaced with SHA-256 content hash.
- [x] [High] Re-approval could not refresh existing `prd-approval.json`. Approval record writes now explicitly overwrite the mutable approval state file.
- [x] [Medium] Missing approval rendered no active blocker in project status. Draft status now reports `PRD approval missing`.
- [x] [Medium] Malformed ambiguity/state JSON could crash runtime or status paths. YOLO-RUN now denies with Journal entry for invalid ambiguity state; project status reports invalid state files as blockers and drift.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 31 files, 135 tests.
- `rtk proxy pnpm build` passed.
