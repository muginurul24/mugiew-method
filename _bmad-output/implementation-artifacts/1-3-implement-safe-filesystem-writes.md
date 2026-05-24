# Story 1.3: Implement Safe Filesystem Writes

Status: done

## Story

As an AI-native Engineer,
I want install and generation commands to write files safely,
so that Mugiew Method never silently destroys user-owned work.

## Acceptance Criteria

1. Given a target file already exists, when a write is attempted without overwrite confirmation, then the write is denied with `UnsafeWriteError`.
2. Given a write is denied, then the original file content remains unchanged.
3. Given content is written, then atomic write behavior prevents partial file output.
4. Given overwrite is required, then overwrite behavior requires an explicit option or confirmed operation.

## Tasks / Subtasks

- [x] Add safe write domain error (AC: 1, 4)
  - [x] Add `UnsafeWriteError` under `packages/core/src/errors/`.
  - [x] Include target path and clear message for denied overwrite.
  - [x] Export error from core public API.
- [x] Implement safe filesystem write primitive (AC: 1-4)
  - [x] Add `packages/core/src/filesystem/safe-write.ts`.
  - [x] Deny writes to existing files unless overwrite is explicit.
  - [x] Preserve existing file content on denied writes.
  - [x] Write through a temporary file in the same directory before finalizing.
  - [x] Clean up temporary files after success or failure.
  - [x] Support parent directory creation for future install/generation commands.
- [x] Add focused Vitest coverage (AC: 1-4)
  - [x] Test denial with `UnsafeWriteError`.
  - [x] Test original content remains unchanged after denied write.
  - [x] Test explicit overwrite changes content.
  - [x] Test fresh write creates parent directories and final content.
  - [x] Test no temporary write artifact remains after success.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 1.2 added project path contracts and project root detection in `packages/core`.
- `packages/core` owns safe filesystem primitives. Do not implement write safety inside `packages/cli`.
- Architecture requires safe filesystem writes, no silent overwrite, explicit overwrite/force behavior, and atomic writes for project artifacts.
- This story should not implement the install command. It only creates reusable core primitives that later commands will call.
- Journal entries for destructive actions are later runtime/governance concerns; do not add journal behavior here.

### Architecture Compliance

- Add domain error files under `packages/core/src/errors/`.
- Add filesystem utility files under `packages/core/src/filesystem/`.
- File names must be kebab-case.
- Tests must be co-located as `*.test.ts`.
- TypeScript modules must stay ESM-compatible with NodeNext resolution.
- No dependency on `packages/cli`.

### API Guidance

- Prefer API shape similar to:

```ts
safeWriteFile(path, content, { overwrite?: boolean; createParentDirectories?: boolean })
```

- `overwrite` must default to `false`.
- `createParentDirectories` may default to `true` because install/generation commands write nested artifact paths.
- Atomic behavior should use a temporary file in the same directory, then a final filesystem operation.
- [ASSUMPTION] MVP accepts string or `Uint8Array` content; streaming writes can be added later if large artifacts require it.

### Testing Requirements

- Use temporary directories via Node `fs/promises`, `os.tmpdir`, and `path`.
- Do not add new dependencies.
- Tests should assert content, errors, and cleanup, not only command success.

### Project Structure Notes

- Source of truth: [Architecture](../planning-artifacts/architecture.md) sections "Authentication & Security", "State Management Patterns", "Implementation Patterns & Consistency Rules", and "Project Structure & Boundaries".
- Story source: [Epics](../planning-artifacts/epics.md) Story 1.3.
- Previous story: [Story 1.2](./1-2-define-core-file-contracts-and-project-paths.md).

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Readiness Report](../planning-artifacts/implementation-readiness-report-2026-05-24.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 3 test files, 8 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found cleanup could mask the original write failure; patched cleanup to preserve original error.
- Post-review `rtk proxy pnpm typecheck`, `rtk proxy pnpm test`, `rtk proxy pnpm build`, and `rtk proxy pnpm check` passed.

### Completion Notes List

- Added `UnsafeWriteError` with target path metadata.
- Added `safeWriteFile` core primitive with overwrite denial by default.
- Implemented temp-file based finalization in the target directory.
- Added explicit overwrite support and parent directory creation.
- Added tests for denial, content preservation, explicit overwrite, nested fresh writes, and temp artifact cleanup.
- Patched failure cleanup so cleanup failures do not mask the original write error.

### File List

- `packages/core/src/errors/unsafe-write-error.ts`
- `packages/core/src/filesystem/safe-write.ts`
- `packages/core/src/filesystem/safe-write.test.ts`
- `packages/core/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented safe filesystem write primitive, unsafe overwrite error, exports, and tests.
- 2026-05-24: Addressed code review finding for cleanup error masking.

## Senior Developer Review (AI)

Review completed.

### Findings

- Low: failure-path cleanup could mask the original write failure if temporary file cleanup also failed. Fixed by making cleanup best-effort so callers receive the root write error.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 3 test files, 8 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
