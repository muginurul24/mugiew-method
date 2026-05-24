# Story 1.1: Set Up Initial Project from oclif Starter Template

Status: done

## Story

As an AI-native Engineer,
I want the Mugiew Method repository initialized as a TypeScript CLI workspace,
so that future implementation can follow the approved architecture.

## Acceptance Criteria

1. Given a fresh Mugiew Method source repository, when the workspace foundation is created, then the repository uses Node.js 24 LTS, TypeScript, pnpm workspace, and oclif for `packages/cli`.
2. Given the workspace foundation exists, then `packages/core`, `packages/cli`, `packages/discovery-engine`, `packages/governance-engine`, and `packages/execution-engine` exist with package-level `src/index.ts`.
3. Given `packages/cli` exists, then business logic is not placed inside oclif command classes.
4. Given tests are configured, then Vitest can discover package-level tests.

## Tasks / Subtasks

- [x] Create root workspace configuration (AC: 1, 4)
  - [x] Add root `package.json` with workspace scripts for build, test, typecheck, lint, and CLI entry metadata.
  - [x] Add `pnpm-workspace.yaml` covering `packages/*`.
  - [x] Add `tsconfig.base.json` for shared TypeScript options.
  - [x] Add `vitest.config.ts` that discovers tests under all packages.
  - [x] Add `.npmrc` with strict package manager behavior appropriate for pnpm.
- [x] Create package directories and package manifests (AC: 1, 2)
  - [x] Create `packages/core`, `packages/cli`, `packages/discovery-engine`, `packages/governance-engine`, and `packages/execution-engine`.
  - [x] Add each package `package.json`.
  - [x] Add each package `tsconfig.json`.
  - [x] Add each package `src/index.ts`.
- [x] Add oclif-compatible CLI shell without business logic (AC: 1, 3)
  - [x] Add `packages/cli/bin/run.js`.
  - [x] Add `packages/cli/src/commands/index.ts` as a minimal command.
  - [x] Add `packages/cli/src/index.ts` exports/adapters only.
  - [x] Keep command implementation limited to terminal-facing shell behavior.
- [x] Add test discovery proof (AC: 4)
  - [x] Add at least one package-level Vitest test in `packages/core`.
  - [x] Ensure root test script can discover that package-level test.
- [x] Document foundation constraints (AC: 1, 3)
  - [x] Add README section or docs note describing workspace package boundaries.
  - [x] State that `packages/cli` is adapter-only and engines own business logic.

## Dev Notes

- This is a greenfield source repository. Existing tracked application code is absent; current repo contains BMad planning artifacts and agent config only.
- Architecture selects oclif TypeScript CLI starter plus framework-independent core packages. Do not couple business logic to oclif command classes.
- Runtime baseline is Node.js 24 LTS. Use ESM-first TypeScript package structure.
- Package manager is pnpm workspace. Root scripts should orchestrate package-level build/test/typecheck.
- Test runner is Vitest. This story only needs discovery proof, not full product test coverage.
- Do not implement install/discovery/governance/runtime product behavior in this story. That starts in later stories.
- No database, web server, auth, hosted backend, or visual UI belongs in this story.

### Architecture Compliance

- Required package structure:
  - `packages/core`
  - `packages/cli`
  - `packages/discovery-engine`
  - `packages/governance-engine`
  - `packages/execution-engine`
- `packages/cli` may import engines in later stories. Engines must not import `packages/cli`.
- Each package must export public API from `src/index.ts`.
- File names must use kebab-case except conventional config files.
- Tests should be co-located as `*.test.ts`.

### Library / Framework Requirements

- Node.js 24 LTS per official Node.js release schedule.
- oclif for CLI shell. Use package metadata and structure compatible with oclif command loading.
- pnpm workspace for monorepo package management.
- TypeScript for all source packages.
- Vitest for unit test discovery.

### File Structure Requirements

Expected new files include:

```txt
package.json
pnpm-workspace.yaml
tsconfig.base.json
vitest.config.ts
.npmrc
README.md
packages/core/package.json
packages/core/tsconfig.json
packages/core/src/index.ts
packages/core/src/index.test.ts
packages/cli/package.json
packages/cli/tsconfig.json
packages/cli/bin/run.js
packages/cli/src/index.ts
packages/cli/src/commands/index.ts
packages/discovery-engine/package.json
packages/discovery-engine/tsconfig.json
packages/discovery-engine/src/index.ts
packages/governance-engine/package.json
packages/governance-engine/tsconfig.json
packages/governance-engine/src/index.ts
packages/execution-engine/package.json
packages/execution-engine/tsconfig.json
packages/execution-engine/src/index.ts
```

### Testing Requirements

- Add a simple Vitest test proving package tests are discovered.
- Run the test command if dependencies are available.
- If dependencies are not installed and network is unavailable, document the command that could not run and why.

### Project Structure Notes

- Source of truth: [Architecture](../planning-artifacts/architecture.md) sections "Starter Template Evaluation", "Core Architectural Decisions", "Implementation Patterns & Consistency Rules", and "Project Structure & Boundaries".
- Story source: [Epics](../planning-artifacts/epics.md) Story 1.1.
- Readiness source: [Implementation Readiness Report](../planning-artifacts/implementation-readiness-report-2026-05-24.md), status ready with non-blocking notes.

### Latest Technical Information

- Node.js 24 is the selected LTS baseline from official Node release schedule.
- oclif generator is the selected starter direction, but implementation may create the equivalent workspace skeleton directly when network scaffolding is unavailable.
- pnpm workspaces use `pnpm-workspace.yaml` to define included package directories.
- Vitest supports workspace/package test discovery through root config include patterns.

### References

- [PRD](../planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md)
- [Architecture](../planning-artifacts/architecture.md)
- [Epics](../planning-artifacts/epics.md)
- [Readiness Report](../planning-artifacts/implementation-readiness-report-2026-05-24.md)
- Node.js release schedule: https://nodejs.org/en/about/previous-releases
- oclif docs: https://oclif.io/
- pnpm workspace docs: https://pnpm.io/workspaces
- Vitest docs: https://vitest.dev/

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `pnpm install` initially failed in sandbox due npm registry DNS and pnpm store write restriction, then succeeded with approved escalation.
- `pnpm typecheck` passed.
- `pnpm test` passed: 1 test file, 1 test.
- `pnpm build` passed for all workspace packages.
- `pnpm lint` passed; no package-specific lint scripts yet.
- `pnpm check` passed.
- Code review found oclif command discovery, bin executable bit, and test build-output issues; patched command discovery to explicit map, set bin executable bit, and excluded test files from package builds.
- Rebuilt from clean `packages/*/dist` output and verified no test files are emitted to package `dist`.
- `node packages/cli/bin/run.js index` prints `Mugiew Method CLI foundation ready.`

### Completion Notes List

- Initialized Node.js 24 / TypeScript / pnpm workspace foundation.
- Created oclif-compatible CLI shell in `packages/cli` with only terminal-facing command behavior.
- CLI command is oclif-loadable via explicit command discovery map.
- Created five package boundaries: core, cli, discovery-engine, governance-engine, execution-engine.
- Added Vitest root config and a core package test proving package-level test discovery.
- Package builds exclude `*.test.ts` and `*.spec.ts` from `dist`.
- Added README boundary guidance stating `packages/cli` is adapter-only and business logic belongs in engines.
- Added `.gitignore` to exclude dependency/build/test output artifacts.

### File List

- `.gitignore`
- `.npmrc`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `vitest.config.ts`
- `packages/core/package.json`
- `packages/core/tsconfig.json`
- `packages/core/src/index.ts`
- `packages/core/src/index.test.ts`
- `packages/cli/package.json`
- `packages/cli/tsconfig.json`
- `packages/cli/bin/run.js`
- `packages/cli/src/index.ts`
- `packages/cli/src/commands/index.ts`
- `packages/discovery-engine/package.json`
- `packages/discovery-engine/tsconfig.json`
- `packages/discovery-engine/src/index.ts`
- `packages/governance-engine/package.json`
- `packages/governance-engine/tsconfig.json`
- `packages/governance-engine/src/index.ts`
- `packages/execution-engine/package.json`
- `packages/execution-engine/tsconfig.json`
- `packages/execution-engine/src/index.ts`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented workspace foundation, package boundaries, CLI shell, and test discovery proof.
- 2026-05-24: Addressed code review findings for oclif command discovery, executable bin, and build artifact hygiene.

## Senior Developer Review (AI)

### Review Outcome

Approve

### Review Date

2026-05-24

### Review Layers

- Blind Hunter
- Edge Case Hunter
- Acceptance Auditor

### Findings Resolved

- [x] Oclif command was not reachable from `node packages/cli/bin/run.js index`.
- [x] CLI bin file lacked executable bit.
- [x] Package build emitted test files into `dist`.

### Final Verification

- `pnpm build` passed.
- `pnpm check` passed.
- `node packages/cli/bin/run.js index` passed.
- `packages/core/dist` no longer contains `index.test.*` after clean rebuild.
