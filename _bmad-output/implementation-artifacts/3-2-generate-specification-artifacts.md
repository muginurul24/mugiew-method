# Story 3.2: Generate Specification Artifacts

Status: done

## Story

As an Autonomous Project Maintainer,
I want supporting specification artifacts generated with explicit applicability,
so that future AI agents know which technical contracts exist.

## Acceptance Criteria

1. Given PRD Artifact exists, when specification generation runs, then architecture, technical spec, API contracts, database schema, execution plan, and testing strategy files are generated or marked not applicable.
2. Given artifacts are generated, then generated artifacts reference PRD IDs.
3. Given artifacts are not applicable, then non-applicable artifacts explain why they do not apply.

## Tasks / Subtasks

- [x] Define specification artifact model (AC: 1-3)
  - [x] Add artifact kinds for architecture, technical spec, API contracts, database schema, execution plan, testing strategy.
  - [x] Add applicability state and explanation fields.
  - [x] Add PRD ID references.
- [x] Implement specification renderer/writer (AC: 1-3)
  - [x] Add `packages/governance-engine/src/specification-generator.ts`.
  - [x] Render applicable artifacts with PRD references.
  - [x] Render not-applicable artifacts with explicit rationale.
  - [x] Write files under `_mugiew-method/prd/`.
- [x] Add focused tests (AC: 1-3)
  - [x] Test all required artifact files are produced.
  - [x] Test applicable artifacts reference PRD IDs.
  - [x] Test not-applicable artifacts explain non-applicability.
- [x] Validate package quality (AC: 1-3)
  - [x] Run `pnpm typecheck`.
  - [x] Run `pnpm test`.
  - [x] Run `pnpm build`.

## Dev Notes

- Story 3.1 writes `_mugiew-method/prd/PRD.md`.
- This story writes supporting artifacts in the same PRD folder.
- Safe writes must prevent silent overwrite.
- Non-applicable artifacts should still exist so future AI agents know absence is intentional.

### API Guidance

- [ASSUMPTION] File names are `architecture.md`, `technical-spec.md`, `api-contracts.md`, `database-schema.md`, `execution-plan.md`, and `testing-strategy.md`.
- [ASSUMPTION] Artifact applicability states are `applicable` and `not-applicable`.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Story 3.1](./3-1-generate-prd-artifact.md)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 12 test files, 45 tests before review patch; 46 tests after review patch.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
- Code review found writer did not verify PRD.md existed despite AC precondition; patched guard and added test.

### Completion Notes List

- Added specification artifact model and required artifact registry.
- Added renderer for applicable and not-applicable artifacts.
- Added writer for all supporting specification files under `_mugiew-method/prd/`.
- Added PRD.md existence guard before supporting specs are written.
- Added tests for required files, PRD references, not-applicable rationale, and missing PRD guard.

### File List

- `packages/governance-engine/src/specification-generator.ts`
- `packages/governance-engine/src/specification-generator.test.ts`
- `packages/governance-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented specification artifact renderer/writer, exports, and tests.
- 2026-05-24: Addressed review finding for missing PRD.md guard.

## Senior Developer Review (AI)

Review completed.

### Findings

- Medium: `writeSpecificationArtifacts` did not verify `_mugiew-method/prd/PRD.md` existed even though the story precondition requires a PRD Artifact. Fixed by adding a PRD.md access guard and regression test.

### Verification

- `rtk proxy pnpm typecheck` passed.
- `rtk proxy pnpm test` passed: 12 test files, 46 tests.
- `rtk proxy pnpm build` passed.
- `rtk proxy pnpm check` passed.
