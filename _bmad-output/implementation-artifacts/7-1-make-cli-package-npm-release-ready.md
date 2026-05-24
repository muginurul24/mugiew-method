# Story 7.1: Make CLI Package NPM Release Ready

Status: done

## Story

As an AI-native Engineer,
I want `npx mugiew-method install` to work from a published package,
so that Mugiew Method can be installed outside the source workspace.

## Acceptance Criteria

1. Given a release candidate package, when it is packed or published, then package manifest is publishable.
2. Given a published artifact, when `npx mugiew-method install` resolves the binary, then `mugiew-method` bin points to executable built CLI runtime.
3. Given package installation outside the source workspace, when CLI imports internal packages, then internal dependencies resolve without `workspace:*` assumptions in the published artifact.
4. Given package publication, then license metadata and publish file controls are present.
5. Given a packed artifact, when packaging smoke test runs, then `install` succeeds from the packed artifact in a temporary project.

## Tasks / Subtasks

- [x] Choose and document release packaging strategy (AC: 1, 3, 4)
- [x] Make package manifests publishable without private/package metadata blockers (AC: 1, 4)
- [x] Ensure CLI bin resolves from built package artifact (AC: 2)
- [x] Ensure internal runtime dependencies resolve outside workspace (AC: 3)
- [x] Add packaging smoke test for packed artifact install command (AC: 5)
- [x] Add/update docs for release packaging workflow (AC: 1, 4, 5)
- [x] Run validations: focused packaging smoke, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm check` (AC: 1-5)

## Dev Notes

- Product promise requires `npx mugiew-method install` outside this repository.
- Current root and workspace package manifests are marked `private: true`; `_bmad-output/project-context.md` explicitly says package state is not npm-release ready.
- Architecture says deployment means npm package publish, CI must validate package build and command smoke tests before publish.
- Preserve monorepo package boundaries: `packages/cli` remains adapter-only; engines remain framework-independent libraries.
- Preferred conservative strategy: publish root `mugiew-method` CLI package plus internal `@mugiew-method/*` packages at matching versions, with dependency versions that become valid after pack/publish.
- Do not add bundling unless necessary. If bundling is chosen, document why and keep runtime imports deterministic.
- Publish controls should prevent source noise while including required runtime assets: built `dist`, CLI `bin`, package manifests, README, license.
- Smoke test should create a temp directory, pack the release candidate, install or execute from packed artifact, run `mugiew-method install`, and assert `AGENTS.md` plus `_mugiew-method/` are created.
- Avoid real npm publish or network-dependent install in tests.

## Source Context

- `_bmad-output/planning-artifacts/epics.md` Story 7.1: release candidate must have publishable manifest, bin resolution, internal dependency resolution, license metadata, publish file controls, and packaging smoke test.
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24.md` adds FR-1a: release-grade installation path for `npx mugiew-method install` outside source workspace.
- `_bmad-output/planning-artifacts/architecture.md` defines npm package distribution, Node.js 24 LTS, ESM TypeScript, oclif CLI adapter, pnpm workspace, and no dev server.
- `_bmad-output/project-context.md` rules: package manifests are currently private and not release-ready; CLI must stay thin; workspace checks must pass before handoff.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-24: `rtk proxy pnpm install` passed after keeping source deps on `workspace:^`.
- 2026-05-24: `rtk proxy pnpm pack:smoke` passed.
- 2026-05-24: `rtk proxy pnpm typecheck` passed.
- 2026-05-24: `rtk proxy pnpm test` passed: 32 files, 151 tests.
- 2026-05-24: `rtk proxy pnpm build` passed.
- 2026-05-24: `rtk proxy pnpm check` passed.
- 2026-05-24: `rtk proxy pnpm pack:smoke` passed again after script path handling and project context update.
- 2026-05-24: Code review found packaging smoke masked dependency graph by installing every tarball as a direct dependency; patched smoke to install only root package and use internal tarballs as overrides.
- 2026-05-24: `rtk proxy pnpm pack:smoke` passed after review patch.
- 2026-05-24: `rtk proxy pnpm typecheck` passed after review patch.
- 2026-05-24: `rtk proxy pnpm test` passed after review patch: 32 files, 151 tests.
- 2026-05-24: `rtk proxy pnpm build` passed after review patch.
- 2026-05-24: `rtk proxy pnpm check` passed after review patch.

### Completion Notes List

- Story context created.
- Root `mugiew-method` is now a publishable NPX wrapper package with `bin/run.js`.
- Internal runtime packages now have publish metadata, MIT license metadata, file allowlists, dist-based type exports, and prepack build hooks.
- Source workspace dependencies stay on `workspace:^`; packed artifacts rewrite them to concrete semver, verified by tarball inspection and smoke test.
- `pnpm pack:smoke` packs local runtime tarballs, installs them into a temp project offline with internal overrides, runs `mugiew-method install`, and asserts generated Mugiew files.
- Packaging smoke now installs only the root `mugiew-method` tarball directly, so it validates the root package dependency chain.
- Release packaging workflow documented in README, docs index, and package release guide.
- Project context updated so future agents use the new release strategy.
- Brownfield docs updated to remove stale npm-release, review-project, approval, and dependency-graph warnings.
- Code review complete; no remaining patch findings for this story.

### File List

- `LICENSE`
- `_bmad-output/implementation-artifacts/7-1-make-cli-package-npm-release-ready.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/project-context.md`
- `README.md`
- `bin/run.js`
- `docs/index.md`
- `docs/development-guide.md`
- `docs/project-overview.md`
- `docs/package-release.md`
- `package.json`
- `packages/cli/package.json`
- `packages/core/package.json`
- `packages/discovery-engine/package.json`
- `packages/execution-engine/package.json`
- `packages/governance-engine/package.json`
- `pnpm-lock.yaml`
- `scripts/pack-smoke.mjs`

### Change Log

- 2026-05-24: Story context created by BMad create-story workflow.
- 2026-05-24: Implemented npm release readiness and moved story to review.
- 2026-05-24: Patched review finding, completed validation, and marked story done.
- 2026-05-24: Removed stale release-readiness notes from generated project docs.
