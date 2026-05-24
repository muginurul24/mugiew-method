# Story 2.1: Create Discovery State Contracts

Status: done

## Story

As an AI-native Engineer,
I want typed discovery and ambiguity contracts,
so that discovery output is consistent across AI sessions and tools.

## Acceptance Criteria

1. Given `packages/core`, when discovery schemas are implemented, then `ambiguity-report.json` validates with Zod.
2. Given an Ambiguity entry exists, then every Ambiguity has ID, category, source, impact, owner, status, and resolution fields.
3. Given categories are validated, then categories include `blocking-ambiguity`, `non-blocking-ambiguity`, and `assumption`.
4. Given invalid ambiguity state is validated, then validation returns `ValidationError`.

## Tasks / Subtasks

- [x] Add validation dependency and domain error (AC: 1, 4)
  - [x] Add Zod to core package dependencies.
  - [x] Add `ValidationError` under `packages/core/src/errors/`.
  - [x] Export validation error from core public API.
- [x] Add ambiguity report contract (AC: 1-3)
  - [x] Add `packages/core/src/contracts/ambiguity-report.ts`.
  - [x] Define category enum with all required categories.
  - [x] Define Ambiguity fields: ID, category, source, impact, owner, status, resolution.
  - [x] Define report fields including `schemaVersion`, `updatedAt`, and `ambiguities`.
  - [x] Export inferred TypeScript types.
- [x] Add validation helper (AC: 1, 4)
  - [x] Parse unknown ambiguity report data through Zod.
  - [x] Return typed report for valid data.
  - [x] Convert Zod failures into `ValidationError`.
- [x] Add focused tests (AC: 1-4)
  - [x] Test valid report parses.
  - [x] Test all required categories parse.
  - [x] Test missing required Ambiguity fields return `ValidationError`.
  - [x] Test invalid category returns `ValidationError`.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Architecture requires Zod schemas in `packages/core` for JSON contracts.
- `ambiguity-report.json` lives at `_mugiew-method/state/ambiguity-report.json`.
- This story only defines core contracts and validation; discovery command behavior starts in Story 2.2.
- Discovery markdown artifacts are out of scope for this story.
- Keep JSON fields camelCase.

### Architecture Compliance

- Contracts live under `packages/core/src/contracts/`.
- Domain errors live under `packages/core/src/errors/`.
- File names must be kebab-case.
- Tests must be co-located as `*.test.ts`.
- No dependency on `packages/cli`.

### API Guidance

- Prefer helper shape:

```ts
parseAmbiguityReport(data: unknown): AmbiguityReport
```

- [ASSUMPTION] MVP ambiguity statuses can be `"open"` and `"resolved"` until later workflows add more lifecycle states.
- [ASSUMPTION] `owner` can be `"user"`, `"ai"`, or `"system"`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm add zod --filter @mugiew-method/core` passed.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 5 test files, 18 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added Zod dependency to core.
- Added `ValidationError` core domain error.
- Added ambiguity report Zod schema with required fields and category enum.
- Added `parseAmbiguityReport` helper converting Zod failures to `ValidationError`.
- Added tests for valid report parsing, category coverage, missing fields, and invalid category.

### File List

- `packages/core/package.json`
- `packages/core/src/contracts/ambiguity-report.ts`
- `packages/core/src/contracts/ambiguity-report.test.ts`
- `packages/core/src/errors/validation-error.ts`
- `packages/core/src/index.ts`
- `pnpm-lock.yaml`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented ambiguity report contract, validation error, Zod validation helper, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 5 test files, 18 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
