# Source Tree Analysis

## Root

```txt
mugiew-method/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── vitest.config.ts
├── packages/
├── _bmad/
├── _bmad-output/
└── docs/
```

Root files define workspace metadata, shared TypeScript settings, test configuration, BMad planning artifacts, and generated documentation.

## Packages

```txt
packages/
├── cli/
├── core/
├── discovery-engine/
├── governance-engine/
└── execution-engine/
```

### `packages/cli`

```txt
packages/cli/
├── bin/run.js
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    └── commands/
        ├── approve-prd.ts
        ├── create-prd.ts
        ├── index.ts
        ├── install.ts
        ├── project-status.ts
        ├── review-project.ts
        └── yolo-run.ts
```

Entry point: `bin/run.js`.

Command registry: `src/commands/index.ts`.

Purpose: terminal adapter over engine packages.

### `packages/core`

```txt
packages/core/src/
├── contracts/
├── errors/
├── filesystem/
├── index.ts
└── index.test.ts
```

Critical folders:

- `contracts/` defines state schemas and parsers.
- `errors/` defines domain errors.
- `filesystem/` defines project paths, root detection, and safe writes.

### `packages/discovery-engine`

```txt
packages/discovery-engine/src/
├── ambiguity-classifier.ts
├── concern-coverage.ts
├── confidence-calculator.ts
├── contradiction-detector.ts
├── start-discovery.ts
└── index.ts
```

Purpose: turn discovery answers and concern coverage into ambiguity and confidence state.

### `packages/governance-engine`

```txt
packages/governance-engine/src/
├── agents-generator.ts
├── approval-gate.ts
├── constitution-validator.ts
├── force-mode-policy.ts
├── install-project.ts
├── prd-generator.ts
├── project-status.ts
├── review-project.ts
├── rules-generator.ts
├── specification-generator.ts
└── index.ts
```

Purpose: generate and validate governance artifacts and status.

### `packages/execution-engine`

```txt
packages/execution-engine/src/
├── architecture-drift-detector.ts
├── dependency-graph.ts
├── rebuild-tasks.ts
├── review-engine.ts
├── runtime-stop.ts
├── task-generator.ts
├── task-selection.ts
├── task-selector.ts
├── validation-runner.ts
├── yolo-runtime.ts
└── index.ts
```

Purpose: task graph and autonomous runtime primitives.

## BMad Artifacts

```txt
_bmad-output/
├── planning-artifacts/
└── implementation-artifacts/
```

Planning artifacts contain PRD and architecture source. Implementation artifacts contain story files, sprint status, and retrospective records.

## Test Layout

Tests live beside implementation files using `.test.ts`. This keeps behavior contracts close to the code they validate.
