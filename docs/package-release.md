# Package Release

Mugiew Method publishes `mugiew-method` as the public NPX entry package.

## Package Strategy

- `mugiew-method` is the root wrapper package and exposes `mugiew-method` through `bin/run.js`.
- `@mugiew-method/cli` owns the oclif runtime and command adapters.
- `@mugiew-method/core`, `@mugiew-method/discovery-engine`, `@mugiew-method/governance-engine`, and `@mugiew-method/execution-engine` are published runtime packages.
- Source manifests use `workspace:^` for local development. `pnpm pack` rewrites those workspace ranges to concrete package versions in tarballs so published artifacts resolve outside the source workspace.

## Publish Controls

Each package declares `license: MIT` and `files` allowlists. Runtime packages include built `dist` output and package metadata. The root package includes the wrapper bin, README, LICENSE, and manifest.

## Validation

Run:

```bash
pnpm build
pnpm pack:smoke
pnpm check
```

`pnpm pack:smoke` packs all runtime packages into local tarballs, installs those tarballs in a temporary project with offline resolution, runs `mugiew-method install`, and verifies `AGENTS.md` plus `_mugiew-method/` are created.
