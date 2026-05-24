# Mugiew Method

No implementation before clarity.

Mugiew Method adalah AI Governance and Autonomous Execution Framework untuk project software yang dikerjakan dengan bantuan AI. Tujuannya bukan membuat AI menulis kode lebih cepat, tetapi membuat eksekusi AI lebih jelas, terkendali, bisa diaudit, dan lebih aman untuk dipelihara oleh manusia maupun agent AI berikutnya.

Package publik yang dipakai user hanya:

```bash
npx mugiew-method install
```

User tidak perlu install package scoped/internal apa pun. Internal package tetap ada di repository ini untuk menjaga batas arsitektur, tetapi saat publish semua runtime internal di-vendor ke dalam package root `mugiew-method`.

## Kenapa Mugiew Method Dibuat

AI coding tools sering gagal di titik yang sama:

- mulai implementasi sebelum requirement jelas
- kehilangan konteks setelah sesi panjang
- membuat keputusan arsitektur yang berubah-ubah
- melewatkan edge case, testing, dan security concern
- menghasilkan UI atau kode yang terasa generik
- sulit direview oleh manusia
- sulit dilanjutkan oleh agent AI lain

Mugiew Method memaksa project punya discovery, spesifikasi, approval gate, task graph, validasi, review, dan journal sebelum autonomous execution dianggap aman.

Prinsip inti:

```txt
Clarity before implementation.
Specification before execution.
Understanding before generation.
```

## Apa Yang Dihasilkan

Saat dijalankan di root project, Mugiew Method membuat struktur governance lokal:

```txt
AGENTS.md
_mugiew-method/
  discovery/
    answers.md
    ambiguities.md
    assumptions.md
    confidence-report.md
  prd/
    PRD.md
    architecture.md
    technical-spec.md
    api-contracts.md
    database-schema.md
    execution-plan.md
    testing-strategy.md
  tasks/
  journal/
  state/
    ambiguity-report.json
    dependency-graph.json
    execution-metrics.json
    project-state.json
  rules/
    architecture-rules.md
    coding-rules.md
    testing-rules.md
    ui-rules.md
```

`AGENTS.md` adalah AI constitution untuk project. File ini menjadi kontrak perilaku agent AI: aturan arsitektur, coding standard, testing requirement, forbidden patterns, UI rules, dan constraint eksekusi.

## Status Implementasi Saat Ini

Versi aktif: `0.1.2`

Sudah ada:

- installer project governance
- root `AGENTS.md`
- struktur `_mugiew-method/`
- discovery bootstrap
- ambiguity report contract
- confidence report bootstrap
- PRD/spec/rules artifact generation
- approval gate dengan SHA-256 artifact integrity
- project status reporting
- review-project scanning dengan path safety
- task graph dan cycle detection
- YOLO-RUN gate denial
- runtime task selection primitives
- bounded validation runner
- self-review primitives
- package smoke test untuk `npx mugiew-method install`

Belum ada:

- full adaptive conversational discovery runtime
- full autonomous YOLO-RUN implementation loop
- validation command allowlist policy
- slash-command adapter publik seperti `/create-prd`

Penting: `create-prd` saat ini membuat atau melanjutkan discovery state. Command ini belum menjalankan percakapan adaptive discovery penuh.

## Instalasi

Jalankan dari root project yang ingin diberi Mugiew Method:

```bash
npx mugiew-method install
```

Untuk pin versi:

```bash
npx mugiew-method@0.1.2 install
```

Command ini akan:

- membuat `AGENTS.md`
- membuat folder `_mugiew-method/`
- membuat file state awal
- tidak overwrite install yang sudah ada secara diam-diam

Jika install sudah ada, CLI akan melaporkan file yang terdeteksi dan berhenti tanpa mengubah file.

## Cara Penggunaan

Setelah install, command dipanggil dengan format:

```bash
npx mugiew-method <command>
```

Jika package sudah diinstall lokal/global, bisa juga:

```bash
mugiew-method <command>
```

### Command Utama

| Command | Fungsi |
| --- | --- |
| `install` | Install file governance Mugiew Method ke project |
| `create-prd` | Membuat atau melanjutkan discovery bootstrap |
| `approve-prd` | Mengunci PRD jika readiness gate lolos |
| `project-status` | Menampilkan status readiness project |
| `project-status --json` | Menampilkan status machine-readable |
| `review-project` | Menulis governance review ke journal |
| `review-project --path <file>` | Review file tertentu |
| `review-project --changed` | Review file yang berubah di git working tree |
| `yolo-run` | Mengecek gate YOLO-RUN sebelum autonomous execution |

## Workflow Dasar

### 1. Install

```bash
npx mugiew-method install
```

Output sukses akan mencantumkan file yang dibuat.

### 2. Mulai Discovery / PRD Bootstrap

```bash
npx mugiew-method create-prd
```

Command ini membuat atau melanjutkan:

```txt
_mugiew-method/discovery/answers.md
_mugiew-method/discovery/ambiguities.md
_mugiew-method/discovery/assumptions.md
_mugiew-method/discovery/confidence-report.md
_mugiew-method/state/ambiguity-report.json
```

Output akan menjelaskan scope saat ini:

```txt
Discovery Phase: bootstrap-primitives
Adaptive Interrogation: pending
```

### 3. Approve PRD

```bash
npx mugiew-method approve-prd
```

Approval hanya berhasil jika gate lolos.

Approval record menyimpan hash untuk:

- `_mugiew-method/prd/PRD.md`
- `_mugiew-method/discovery/confidence-report.md`
- `_mugiew-method/state/ambiguity-report.json`

Jika file yang sudah diapprove berubah, `yolo-run` akan ditolak sampai approval diperbarui.

### 4. Cek Status Project

```bash
npx mugiew-method project-status
```

JSON output:

```bash
npx mugiew-method project-status --json
```

Status mencakup:

- PRD status
- approval integrity
- confidence score
- blocking ambiguity
- dependency graph blocker
- cycle detection
- runtime stop state
- corrupt atau missing state files

### 5. Review Project

Review file tertentu:

```bash
npx mugiew-method review-project --path src/example.ts
```

Review beberapa file:

```bash
npx mugiew-method review-project --path src/example.ts --path README.md
```

Review file yang berubah di git:

```bash
npx mugiew-method review-project --changed
```

Review scanner:

- membaca file di dalam project root saja
- menolak symlink escape
- skip binary file
- dedupe input path
- mencatat scanned/skipped count
- menulis hasil ke `_mugiew-method/journal/`

### 6. Cek YOLO-RUN Gate

```bash
npx mugiew-method yolo-run
```

YOLO-RUN hanya boleh lanjut jika:

- PRD approved
- approval record valid
- approval artifact masih fresh
- blocking ambiguity 0
- confidence memenuhi threshold
- dependency graph tidak punya cycle blocker

Jika gate gagal, command akan menampilkan alasan dan menulis journal denial.

## Struktur Monorepo

```txt
packages/
  cli/                 oclif command adapter
  core/                shared contracts, errors, safe writes, paths
  discovery-engine/    discovery bootstrap, ambiguity, confidence
  governance-engine/   install, PRD/spec generation, approval, status, review
  execution-engine/    task graph, YOLO-RUN gates, validation, review runtime

docs/                  dokumentasi project
_bmad/                 konfigurasi workflow BMad
_bmad-output/          PRD, architecture, stories, retrospectives, context
bin/run.js             entrypoint package publik
scripts/               release dan package smoke scripts
```

Rule penting:

- `packages/cli` hanya adapter command
- business logic masuk engine package
- shared schema/contract masuk `packages/core`
- file write ke project user harus aman dan eksplisit

## Development

Requirement:

- Node.js `>=24.0.0`
- pnpm `10.33.2`

Install dependency:

```bash
pnpm install
```

Run checks:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

Run CLI lokal dari source:

```bash
node packages/cli/bin/run.js install
node packages/cli/bin/run.js create-prd
node packages/cli/bin/run.js project-status --json
```

## Package Strategy

Public package:

```txt
mugiew-method
```

Internal workspace package tetap private secara usage. User tidak perlu tahu, install, atau publish package internal tersebut secara terpisah.

Internal packages tidak perlu diinstall user. Saat `prepack`, script akan:

1. build semua workspace package
2. copy compiled internal package ke folder vendor runtime
3. pack root package `mugiew-method`

Root package runtime dependencies publik hanya:

- `@oclif/core`
- `execa`
- `zod`

## Package Smoke Test

```bash
pnpm pack:smoke
```

Smoke test melakukan:

1. build workspace
2. prepare vendor runtime files
3. pack root package
4. install tarball root ke temp project
5. run `mugiew-method install`
6. verify `AGENTS.md` dan `_mugiew-method/`

## Publishing

Publish hanya root package:

```bash
pnpm publish --access public --no-git-checks
```

Sebelum publish:

```bash
pnpm pack:smoke
pnpm check
pnpm build
```

Test setelah publish:

```bash
tmpdir=$(mktemp -d)
cd "$tmpdir"
npx mugiew-method@0.1.2 install
ls
```

Harus muncul:

```txt
AGENTS.md
_mugiew-method
```

## Dokumentasi Tambahan

- [Project Overview](docs/project-overview.md)
- [Architecture](docs/architecture.md)
- [Development Guide](docs/development-guide.md)
- [Package API Reference](docs/package-api-reference.md)
- [Testing Strategy](docs/testing-strategy.md)
- [Discovery Runtime Scope](docs/discovery-runtime-scope.md)
- [Package Release](docs/package-release.md)

## License

MIT
