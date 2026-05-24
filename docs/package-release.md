# Package Release

Mugiew Method publishes `mugiew-method` as the public NPX package.

## Package Strategy

- `mugiew-method` is the only package users install through NPX.
- Internal packages remain workspace packages for development boundaries.
- `prepack` runs `pnpm build` and `scripts/prepare-root-package.mjs`.
- The prepare step vendors internal compiled packages under `vendor/node_modules/@mugiew-method/` inside the root tarball.
- Root runtime dependencies are only external packages: `@oclif/core`, `execa`, and `zod`.
- Published consumers do not need to install any `@mugiew-method/*` package.

## Publish Controls

The root package declares `license: MIT` and a `files` allowlist. It includes the CLI bin, README, LICENSE, manifest, and generated vendor runtime files.

## Validation

Run:

```bash
pnpm build
pnpm pack:smoke
pnpm check
```

`pnpm pack:smoke` packs the root package, installs it in a temporary project, runs `mugiew-method install`, and verifies `AGENTS.md` plus `_mugiew-method/` are created.
