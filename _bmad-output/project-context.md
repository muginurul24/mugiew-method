---
project_name: "mugiew-method"
user_name: "Mugiew"
date: "2026-05-24"
sections_completed: ["technology_stack", "language_rules", "framework_rules", "testing_rules", "quality_rules", "workflow_rules", "anti_patterns"]
status: "complete"
existing_patterns_found: 12
rule_count: 57
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Runtime: Node.js `>=24.0.0`
- Package manager: pnpm `10.33.2`
- Language: TypeScript `^5.9.0`
- Module system: ESM with `NodeNext` module/moduleResolution
- Test runner: Vitest `^4.0.0`
- CLI framework: oclif `^4.0.0`
- Schema validation: Zod `4.4.3`
- Process execution: Execa `9.6.1`
- Workspace dependencies: `workspace:^` across internal packages; pack rewrites them to concrete semver.
- Package state: root `mugiew-method` is the publishable NPX wrapper; internal `@mugiew-method/*` packages publish as runtime dependencies at matching versions.

## Critical Implementation Rules

### Language-Specific Rules

- Use strict TypeScript patterns already enforced by `tsconfig.base.json`: `strict`, `isolatedModules`, `noUncheckedIndexedAccess`, `NodeNext`.
- Use ESM imports with `.js` suffix for local TypeScript source imports that compile to NodeNext output.
- Keep public package exports centralized in each package `src/index.ts`.
- Put shared JSON/state contracts in `packages/core/src/contracts`; engines must use core parsers instead of ad hoc validation.
- Convert Zod failures into `ValidationError` with path/message issues.
- Use domain errors from `packages/core/src/errors` for recoverable CLI-facing failures.
- Do not introduce framework-specific logic into `packages/core`.
- Avoid broad `unknown as` casting around parsed state; validate with existing parser functions.

### Framework-Specific Rules

- `packages/cli` is adapter-only: command classes parse flags, format output, map known errors to exits, then call engine services.
- Do not put business logic in oclif command classes.
- Keep `packages/core` dependency-free from engines; engines may depend on core.
- Package boundaries:
  - `discovery-engine`: discovery state, concern coverage, ambiguity, contradiction, confidence.
  - `governance-engine`: install, PRD/spec/rules/AGENTS generation, approval, force mode, status, review.
  - `execution-engine`: task graph, task selection, YOLO-RUN gate, validation, self-review, runtime stop, drift, rebuild.
- All project-local artifact paths must come from `createProjectPaths` or `resolveProjectPaths`.
- File writes to user projects must go through `safeWriteFile`.
- Root `AGENTS.md` and `_mugiew-method/` structure are public product contracts; do not rename casually.

### Testing Rules

- Tests live beside source files as `*.test.ts`.
- Use Vitest; root config includes `packages/**/*.test.ts`.
- Add or update focused tests for every behavior contract change, especially state schemas, gate decisions, safe writes, and journal output.
- For filesystem behavior, use temp directories and clean them in `afterEach`.
- Test both pure evaluators and filesystem service wrappers when behavior has both.
- For CLI-facing domain errors, test the engine/service result first; add CLI tests only when command behavior changes.
- Required verification before handoff: `pnpm typecheck`, `pnpm test`, and `pnpm build` when build/runtime boundaries changed.
- Use `rtk proxy pnpm typecheck` if RTK output filtering reports odd exit behavior.

### Code Quality & Style Rules

- Keep files kebab-case, matching existing source style.
- Prefer small pure functions for gate/evaluator logic; wrap filesystem orchestration separately.
- Preserve deterministic output ordering for generated IDs, reports, tasks, and journals.
- Do not silently overwrite user files. Use explicit `overwrite: true` only for known mutable state files.
- Keep comments sparse; add comments only where failure handling or atomicity is non-obvious.
- Markdown artifacts should be stable and AI-readable: predictable headings, explicit IDs, no decorative prose.
- JSON contract fields use camelCase and include `schemaVersion` where they are persisted state.
- Do not add new dependencies unless they clearly belong to one package and are declared in that package.

### Development Workflow Rules

- Use `pnpm` workspace commands from repo root for cross-package checks.
- For local CLI smoke tests, use `node packages/cli/bin/run.js <command>`.
- Keep implementation artifacts and documentation in sync when changing product behavior.
- When adding package exports, update `src/index.ts` and verify dependent packages import through package entrypoints.
- Packaging strategy uses root `mugiew-method` wrapper plus internal runtime packages. Source manifests use `workspace:^`; `pnpm pack` rewrites those ranges to concrete semver in tarballs.
- Validate release packaging with `pnpm pack:smoke`; it packs local tarballs, installs them in a temp project offline, runs `mugiew-method install`, and verifies generated project files.
- Treat `_bmad-output/project-context.md` and `docs/index.md` as primary AI orientation files.
- Before changing gates or state contracts, inspect planning docs and existing story artifacts for intended policy.

### Critical Don't-Miss Rules

- Core philosophy is enforced by gates: no implementation before clarity, approval, zero blocking ambiguities, and confidence threshold.
- Approval and YOLO-RUN currently parse confidence from Markdown; changing confidence report wording can affect gates.
- YOLO-RUN validates approval schema and artifact content hashes before execution readiness.
- Validation commands are trusted project-local shell execution. Do not treat `validationCommands` as safe external input.
- `review-project` CLI scans relevant project files by default and supports explicit path/changed scopes with root, symlink, and binary safeguards.
- Discovery engine currently provides primitives and bootstrap, not full adaptive conversational interrogation runtime.
- Dependency graph cycle detection is implemented through core graph contracts and execution task selection.
- Project status should avoid false confidence: missing/corrupt artifacts should be explicit when hardening status behavior.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow all rules exactly as documented.
- When unsure, choose the more restrictive behavior.
- Update this file when new durable project patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent implementation needs.
- Update when technology stack, state contracts, package boundaries, or gate policy changes.
- Remove rules once they become obvious from codebase structure.

Last Updated: 2026-05-24
