# Story 2.4: Classify Ambiguities and Assumptions

Status: done

## Story

As an AI-native Engineer,
I want unknowns classified by execution risk,
so that only truly blocking issues stop the workflow.

## Acceptance Criteria

1. Given discovery identifies unknowns or contradictions, when ambiguity classification runs, then each item is classified as Blocking Ambiguity, Non-Blocking Ambiguity, or Assumption.
2. Given an item is classified as Blocking Ambiguity, then it includes the reason it blocks approval or execution.
3. Given an item is classified as Non-Blocking Ambiguity, then it includes a default handling strategy.
4. Given an item is classified as Assumption, then it includes confirmation state.

## Tasks / Subtasks

- [x] Extend ambiguity contract details (AC: 2-4)
  - [x] Add optional `blockingReason` field for blocking ambiguities.
  - [x] Add optional `defaultHandlingStrategy` field for non-blocking ambiguities.
  - [x] Add optional `confirmationState` field for assumptions.
  - [x] Validate category-specific detail requirements with Zod.
- [x] Implement ambiguity classifier in discovery-engine (AC: 1-4)
  - [x] Add `packages/discovery-engine/src/ambiguity-classifier.ts`.
  - [x] Accept discovery items with source, text, optional risk level, and optional proposed resolution data.
  - [x] Classify items into required categories deterministically.
  - [x] Preserve source, impact, owner, status, and resolution fields.
  - [x] Generate stable IDs for classified items.
- [x] Add focused tests (AC: 1-4)
  - [x] Test explicit blocking classification includes blocking reason.
  - [x] Test explicit non-blocking classification includes default handling strategy.
  - [x] Test assumption classification includes confirmation state.
  - [x] Test contract rejects category-specific missing details.
- [x] Validate package quality (AC: 1-4)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 2.1 created the base `Ambiguity` and `AmbiguityReport` contracts in `packages/core/src/contracts/ambiguity-report.ts`.
- Story 2.3 created concern coverage and currently generates blocking ambiguities for unresolved concerns.
- Architecture maps FR-12/FR-13 to `packages/discovery-engine/src/ambiguity-classifier.ts` and `packages/core/src/contracts/ambiguity-report.ts`.
- Classification must be deterministic; no LLM call or network dependency belongs in this story.
- Keep data AI-readable and machine-parseable. JSON fields stay camelCase.

### Architecture Compliance

- Core owns shared schema/contracts.
- Discovery engine owns classification behavior.
- CLI must not be touched for this story.
- File names must be kebab-case.
- Tests must be co-located as `*.test.ts`.

### API Guidance

- Prefer classifier shape:

```ts
classifyDiscoveryItems(items, { idPrefix?: string })
```

- [ASSUMPTION] MVP can use explicit `classificationHint` first, then conservative fallback:
  - `contradiction`, `security`, `deployment`, `data-loss`, or `unknown-required-decision` => blocking.
  - `best-practice-default` or `implementation-detail` => non-blocking.
  - `assumption` => assumption.
- [ASSUMPTION] Confirmation state can be `"unconfirmed"` or `"confirmed"`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 2.1](./2-1-create-discovery-state-contracts.md)
- [Story 2.3](./2-3-track-concern-coverage.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Initial `rtk proxy pnpm test` failed because older ambiguity-report fixtures lacked new category-specific detail fields; patched fixtures to match stricter contract.
- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 8 test files, 30 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found no blocking or actionable issues after fixture update.

### Completion Notes List

- Extended ambiguity report contract with discriminated category-specific schemas.
- Added assumption confirmation state enum/schema.
- Updated concern coverage ambiguity generation with required blocking reason.
- Added deterministic `classifyDiscoveryItems` helper.
- Added tests for blocking, non-blocking, assumption, and category-specific validation failure.
- Updated existing ambiguity contract tests for stricter schema.

### File List

- `packages/core/src/contracts/ambiguity-report.ts`
- `packages/core/src/contracts/ambiguity-report.test.ts`
- `packages/core/src/index.ts`
- `packages/discovery-engine/src/ambiguity-classifier.ts`
- `packages/discovery-engine/src/ambiguity-classifier.test.ts`
- `packages/discovery-engine/src/concern-coverage.ts`
- `packages/discovery-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented category-specific ambiguity contract details, deterministic classifier, exports, and tests.
- 2026-05-24: Updated existing tests/concern coverage for stricter ambiguity schema.

## Senior Developer Review (AI)

Review completed. No blocking or actionable findings.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 8 test files, 30 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
