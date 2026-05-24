# Testing Strategy

## Current Test Stack

- Test runner: Vitest
- Test placement: colocated `.test.ts` files beside source files
- Type safety: TypeScript strict mode, `noUncheckedIndexedAccess`

## Current Coverage Shape

Observed tests cover:

- project path contracts
- safe writes
- install behavior
- existing/partial installation detection
- ambiguity report contract
- discovery bootstrap
- concern coverage
- ambiguity classification
- contradiction detection
- confidence scoring
- PRD/spec/AGENTS/rules generation
- approval gate
- force mode policy
- task file contract
- dependency graph contract
- task generation
- runtime task selection
- YOLO-RUN gate denial
- validation runner
- self-review
- runtime stop state
- architecture drift detection
- project status
- review project
- AGENTS.md constitution validation
- task rebuild safety

## Commands

```bash
pnpm test
pnpm test -- --runInBand
pnpm typecheck
pnpm build
pnpm check
```

## Latest Observed Verification

During documentation/checkpoint work:

- `pnpm test -- --runInBand` passed: 30 test files, 122 tests.
- `pnpm build` passed.
- `rtk proxy pnpm typecheck` passed.

## Risk-Based Test Gaps

Recommended future tests:

- npm packaging smoke test for `npx mugiew-method install`
- CLI command tests for all registered commands
- approval freshness check after PRD/spec changes
- corrupted state file status/report behavior
- validation command timeout and output limit
- dependency graph cycle detection
- review-project file scanning through CLI
- structured confidence state instead of Markdown parsing
