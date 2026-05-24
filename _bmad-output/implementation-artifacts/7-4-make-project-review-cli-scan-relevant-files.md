# Story 7.4: Make Project Review CLI Scan Relevant Files

Status: done

## Story

As an Autonomous Project Maintainer,
I want `/review-project` to inspect actual project outputs,
so that AGENTS.md violations are detectable from CLI usage.

## Acceptance Criteria

1. Given project files or task expected files exist, when `/review-project` runs, then CLI can collect review inputs from changed files, explicit paths, or task expected files.
2. Given no files are scanned, when review completes, then output distinguishes no scanned files from no violations.
3. Given files are scanned, when review report is written, then report includes scanned and skipped file counts.
4. Given review findings exist, when CLI output is rendered, then it summarizes finding categories.

## Tasks / Subtasks

- [x] Add scan input support to review engine (AC: 1, 2, 3)
  - [x] Add explicit path input option.
  - [x] Read files into `WorkOutput` safely.
  - [x] Track scanned and skipped file counts.
  - [x] Distinguish no scanned files from no violations.
- [x] Add CLI flags for scan paths (AC: 1, 4)
  - [x] Add repeatable `--path`.
  - [x] Keep CLI adapter-only.
  - [x] Summarize finding categories and scan counts.
- [x] Add tests (AC: 1-4)
  - [x] Explicit path violation detected.
  - [x] Missing/skipped path counted.
  - [x] No scanned files status distinct.
  - [x] CLI or engine summary exposes categories.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Existing `reviewProject` accepts `taskOutputs` programmatically but CLI never supplies them.
- `packages/cli/src/commands/review-project.ts` currently calls `reviewProject({ projectRoot })` only.
- `validateWorkAgainstAgents` already detects forbidden patterns from `WorkOutput[]`.
- Keep source files read-only; review must only write Journal.
- Additive result fields are acceptable.

### Files Likely Touched

- `packages/governance-engine/src/review-project.ts`
- `packages/governance-engine/src/review-project.test.ts`
- `packages/governance-engine/src/index.ts`
- `packages/cli/src/commands/review-project.ts`
- `_bmad-output/implementation-artifacts/7-4-make-project-review-cli-scan-relevant-files.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm test packages/governance-engine/src/review-project.test.ts` passed: 1 file, 6 tests.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 31 files, 146 tests.
- `rtk proxy pnpm build` passed.
- Code review found actionable issues:
  - changed-file scan missing; added `--changed` support.
  - path containment prefix bug; fixed with `path.relative` outside-root guard.
  - symlink escape; fixed with `realpath` containment check.
  - binary files could be scanned as text; now skipped.
  - duplicate scan sources; CLI now dedupes.
  - untracked files missing from changed scan; CLI includes `git ls-files --others --exclude-standard`.
- `rtk proxy pnpm test packages/governance-engine/src/review-project.test.ts` passed after fixes: 1 file, 10 tests.
- `rtk proxy pnpm typecheck` passed after fixes.
- `rtk proxy pnpm test` passed after fixes: 31 files, 150 tests.
- `rtk proxy pnpm build` passed after fixes.

### Completion Notes List

- Story context created for review-project scan behavior.
- Added `scanPaths` engine input and scanned/skipped counts.
- Review report now records scanned files, skipped files, and scan status.
- Review result now exposes finding counts by category.
- CLI now supports repeatable `--path`/`-p` and prints scan counts, scan status, and finding category counts.
- Added tests for explicit path scanning, skipped paths, and no-scan status.
- Added hardened scan path handling for outside paths, symlink escapes, binary files, deduped CLI inputs, and changed/untracked git files.

### File List

- `_bmad-output/implementation-artifacts/7-4-make-project-review-cli-scan-relevant-files.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/governance-engine/src/review-project.ts`
- `packages/governance-engine/src/review-project.test.ts`
- `packages/cli/src/commands/review-project.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented review-project file scanning, scan metrics, CLI flags, category summary, and tests.
- 2026-05-24: Addressed code review findings and marked story done.

## Senior Developer Review (AI)

Review completed. All actionable findings were fixed.

### Findings Resolved

- [x] [High] Changed-file scanning was missing. Added `--changed` support.
- [x] [Medium] Prefix containment check allowed sibling escape. Replaced with relative path guard.
- [x] [High] Symlinks could resolve outside project root. Added `realpath` containment check.
- [x] [Medium] Binary files could be scanned as text. Binary files are skipped.
- [x] [Medium] Duplicate CLI scan sources caused duplicate scans. CLI dedupes paths.
- [x] [Medium] Untracked files were missing from changed scan. CLI includes untracked files.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 31 files, 150 tests.
- `rtk proxy pnpm build` passed.
