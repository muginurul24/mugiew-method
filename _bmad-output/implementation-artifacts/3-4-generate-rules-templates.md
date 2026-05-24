# Story 3.4: Generate Rules Templates

Status: done

## Story

As an Autonomous Project Maintainer,
I want generated rule files under `_mugiew-method/rules`,
so that governance can be inspected and enforced by future agents.

## Acceptance Criteria

1. Given governance generation runs, when rule templates are rendered, then `coding-rules.md`, `architecture-rules.md`, `testing-rules.md`, and `ui-rules.md` exist.
2. Given UI rules are rendered, then UI rules include Uncodixfy-aligned anti-pattern avoidance.
3. Given target projects include UI, then UI rules require loading, empty, error, disabled, responsive, and accessibility states where UI exists.

## Tasks / Subtasks

- [x] Implement rules renderer/writer (AC: 1)
  - [x] Add `packages/governance-engine/src/rules-generator.ts`.
  - [x] Render coding, architecture, testing, and UI rules.
  - [x] Write all files under `_mugiew-method/rules`.
- [x] Add UI rule content (AC: 2-3)
  - [x] Include anti-pattern avoidance aligned with Uncodixfy philosophy.
  - [x] Include required UI states.
- [x] Add focused tests (AC: 1-3)
  - [x] Test all rule files are written.
  - [x] Test UI anti-pattern language exists.
  - [x] Test required UI states exist.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Governance engine owns rules generation.
- Core paths expose `_mugiew-method/rules`.
- Safe writes must prevent silent overwrite.

### API Guidance

- Prefer helper shape:

```ts
renderRuleTemplates()
writeRuleTemplates({ projectRoot })
```

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 14 test files, 53 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added rule template registry.
- Added renderer for coding, architecture, testing, and UI rules.
- Added writer for all files under `_mugiew-method/rules`.
- UI rules include Uncodixfy-aligned anti-pattern avoidance and required UI states.
- Added tests for required files, UI anti-patterns, and UI states.

### File List

- `packages/governance-engine/src/rules-generator.ts`
- `packages/governance-engine/src/rules-generator.test.ts`
- `packages/governance-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented rules template renderer/writer, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 14 test files, 53 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
