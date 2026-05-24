# Story 2.5: Detect Contradictions and Risky Decisions

Status: done

## Story

As an AI-native Engineer,
I want the system to challenge contradictions and risky requirements,
so that bad decisions are visible before implementation.

## Acceptance Criteria

1. Given user-provided discovery context contains conflicting or risky statements, when contradiction detection runs, then conflict findings are logged with source and rationale.
2. Given contradictions are unresolved, then unresolved contradictions become Blocking Ambiguities.
3. Given a user override exists, then user overrides are recorded as decision provenance.
4. Given no override is provided, then no override is applied silently.

## Tasks / Subtasks

- [x] Define contradiction/risk finding model (AC: 1, 3, 4)
  - [x] Add finding type for contradiction and risky decision.
  - [x] Include source, rationale, status, and optional override provenance.
  - [x] Ensure override cannot exist without explicit user-provided provenance.
- [x] Implement deterministic detector (AC: 1-4)
  - [x] Add `packages/discovery-engine/src/contradiction-detector.ts`.
  - [x] Detect direct contradictory statements from explicit pair input.
  - [x] Detect risky decisions from known risk labels.
  - [x] Convert unresolved contradictions into Blocking Ambiguities.
  - [x] Preserve override provenance when explicitly supplied.
- [x] Add focused tests (AC: 1-4)
  - [x] Test conflict findings include source and rationale.
  - [x] Test unresolved contradiction creates blocking ambiguity.
  - [x] Test explicit override is recorded.
  - [x] Test no override is applied silently.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 2.4 added `classifyDiscoveryItems`; use it to create blocking ambiguity records where possible.
- This story is deterministic guardrail logic, not LLM semantic reasoning.
- Later discovery sessions can feed structured contradiction pairs into this detector.
- User override must be explicit input data; absence means unresolved.

### API Guidance

- Prefer helper shape:

```ts
detectContradictionsAndRisks({ statements, riskyDecisions })
```

- [ASSUMPTION] MVP receives structured statement pairs with `conflictsWith` rather than inferring all contradictions from raw text.
- [ASSUMPTION] Override provenance fields: `overriddenBy`, `reason`, `recordedAt`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 2.4](./2-4-classify-ambiguities-and-assumptions.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 9 test files, 34 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues.

### Completion Notes List

- Added contradiction/risky decision finding model.
- Added deterministic `detectContradictionsAndRisks` helper.
- Unresolved contradictions now produce blocking ambiguity records.
- Explicit user overrides are preserved as decision provenance.
- Missing override input leaves findings unresolved.
- Added tests for conflict logging, blocking ambiguity conversion, explicit override, and no silent override.

### File List

- `packages/discovery-engine/src/contradiction-detector.ts`
- `packages/discovery-engine/src/contradiction-detector.test.ts`
- `packages/discovery-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented contradiction/risky decision detection, override provenance, blocking ambiguity conversion, exports, and tests.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 9 test files, 34 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
