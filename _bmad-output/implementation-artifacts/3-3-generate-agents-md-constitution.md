# Story 3.3: Generate AGENTS.md Constitution

Status: done

## Story

As an AI-native Engineer,
I want root `AGENTS.md` generated as AI Constitution,
so that implementation agents follow stable project rules.

## Acceptance Criteria

1. Given Mugiew Method is installed, when governance artifact generation runs, then root `AGENTS.md` includes architecture rules, coding standards, UI rules, maintainability standards, testing requirements, forbidden patterns, stack decisions, and AI execution constraints.
2. Given `AGENTS.md` is generated, then it states implementation must not begin before clarity gates pass.
3. Given agents read `AGENTS.md`, then it uses common Markdown readable by Codex, Claude, Cursor, and Antigravity.

## Tasks / Subtasks

- [x] Implement AGENTS.md renderer (AC: 1-3)
  - [x] Add `packages/governance-engine/src/agents-generator.ts`.
  - [x] Render all required governance sections.
  - [x] Include clarity gate rule.
  - [x] Use plain Markdown headings/lists only.
- [x] Add AGENTS.md writer (AC: 1-3)
  - [x] Use core project paths.
  - [x] Use safe write to avoid silent overwrite.
- [x] Add focused tests (AC: 1-3)
  - [x] Test required sections exist.
  - [x] Test clarity gate rule exists.
  - [x] Test output avoids tool-specific metadata.
  - [x] Test writer targets root `AGENTS.md`.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 1.4 creates a minimal starter AGENTS.md during install. This story adds governance-grade generation.
- Do not add tool-specific frontmatter or proprietary syntax.
- Safe write means existing root AGENTS.md will not be overwritten silently.

### API Guidance

- Prefer helper shape:

```ts
renderAgentsConstitution(input)
writeAgentsConstitution({ projectRoot, input })
```

- [ASSUMPTION] MVP accepts arrays of rule strings per required section.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Initial test run failed because Vitest/Chai does not support `toStartWith`; patched to `startsWith`.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 13 test files, 50 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues after test matcher patch.

### Completion Notes List

- Added AGENTS.md constitution renderer with required governance sections.
- Added root AGENTS.md writer using core project paths and safe writes.
- Added clarity gate rule.
- Ensured common Markdown output without tool-specific metadata.
- Added tests for sections, clarity gate, Markdown shape, and root file path.

### File List

- `packages/governance-engine/src/agents-generator.ts`
- `packages/governance-engine/src/agents-generator.test.ts`
- `packages/governance-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented AGENTS.md constitution renderer/writer, exports, and tests.
- 2026-05-24: Addressed test matcher issue found during validation.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 13 test files, 50 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
