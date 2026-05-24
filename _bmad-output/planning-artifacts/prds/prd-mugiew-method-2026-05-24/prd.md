---
title: Mugiew Method PRD
status: draft
created: 2026-05-24
updated: 2026-05-24
---

# PRD: Mugiew Method

## 0. Document Purpose

Dokumen ini mendefinisikan product requirements untuk Mugiew Method, sebuah AI Governance & Autonomous Execution Framework. PRD ini ditujukan untuk product owner, architecture workflow, story planning workflow, dan AI implementation agents yang akan membangun sistem ini secara bertahap. Struktur dokumen memakai Glossary, User Journeys, Functional Requirements, Non-Functional Requirements, Constraints, Success Metrics, Open Questions, dan Assumptions Index agar downstream AI dapat mengekstrak requirement secara deterministik.

## 1. Vision

Mugiew Method adalah protocol layer untuk autonomous AI software engineering. Produk ini mencegah AI coding agent langsung mengimplementasikan prompt yang belum jelas dengan memaksa discovery, ambiguity detection, specification generation, approval, task planning, execution governance, validation, dan self-review sebelum pekerjaan dianggap aman untuk berjalan.

Produk ini tidak mengoptimalkan kecepatan pembuatan kode. Produk ini mengoptimalkan reliability of execution: requirements jelas, architecture konsisten, context tidak hilang, task dapat dilacak, dan agent dapat melanjutkan pekerjaan secara autonomus tanpa merusak maintainability jangka panjang.

Mugiew Method bertaruh bahwa pasar AI coding membutuhkan governance layer yang lebih kuat daripada prompt templates, IDE rules, atau agent orchestration murni. Thesis produk: autonomous execution hanya reliable jika understanding, governance, dan execution dipisah sebagai engine yang eksplisit dan saling mengunci.

## 2. Target User

### 2.1 Primary Persona

**AI-native Engineer** — engineer, solo founder, indie hacker, atau AI power user yang sudah menggunakan Claude Code, Cursor, Codex, Antigravity, atau autonomous coding agents dalam pekerjaan nyata. Persona ini paham bahwa AI coding chaos, architecture drift, context collapse, dan premature implementation adalah risiko nyata, bukan sekadar ketidaknyamanan.

### 2.2 Secondary Persona

**Autonomous Project Maintainer** — maintainer yang ingin future AI agents dapat memahami, melanjutkan, dan memvalidasi project tanpa kehilangan konteks keputusan lama.

### 2.3 Jobs To Be Done

- Saat ingin membangun project baru dengan AI, user ingin AI menggali requirement sampai tidak ada ambiguity blocking sebelum implementasi dimulai.
- Saat project sudah disetujui, user ingin AI menjalankan task secara autonomus dengan dependency graph, validation, self-review, dan journal update.
- Saat context AI session hilang, user ingin project tetap bisa dilanjutkan oleh agent baru melalui dokumen, rules, state, dan task contracts.
- Saat architecture mulai drift, user ingin sistem mendeteksi pelanggaran terhadap `AGENTS.md`, PRD, dan architecture rules.
- Saat menggunakan banyak AI tools, user ingin governance layer portable yang dapat dibaca Claude, Cursor, Codex, dan Antigravity.

### 2.4 Non-Users (v1)

- Beginner yang mencari coding tutor.
- User yang ingin prompt generator ringan.
- Tim enterprise besar yang membutuhkan centralized SaaS governance, RBAC, audit portal, dan compliance dashboard penuh.
- User yang ingin AI selalu mulai coding secepat mungkin tanpa discovery.

### 2.5 Key User Journeys

- **UJ-1. AI-native Engineer membuat PRD dari ide mentah.**
  AI-native Engineer masuk ke project baru, menjalankan `npx mugiew-method install`, lalu memanggil `/create-prd` dari AI coding environment. Mugiew Method memulai conversational discovery, mengajukan pertanyaan adaptif, mengklasifikasi ambiguity, mencatat assumption, menghitung confidence, dan menghasilkan PRD machine-readable. Climax terjadi ketika system menunjukkan blocking ambiguity count `0` dan PRD siap disetujui. Resolution: user memiliki PRD dan specification artifacts yang siap masuk architecture dan task planning.

- **UJ-2. AI-native Engineer mencegah YOLO-RUN prematur.**
  AI-native Engineer mencoba menjalankan `/yolo-run` sebelum PRD approved. Mugiew Method membaca project state, menemukan `prd_status != approved` atau `ambiguity_count > 0`, lalu menolak runtime dengan status `YOLO-RUN DENIED` dan alasan spesifik. Resolution: user tahu gate mana yang belum terpenuhi dan kembali ke discovery atau approval.

- **UJ-3. Autonomous Project Maintainer melanjutkan project dengan agent baru.**
  Autonomous Project Maintainer membuka project setelah session lama hilang. Agent baru membaca `AGENTS.md`, `_mugiew-method/prd`, `_mugiew-method/tasks`, `_mugiew-method/state`, dan `_mugiew-method/journal`. Agent mengetahui task berikutnya, dependency blockers, rules, assumptions, dan validation requirements. Resolution: project dapat dilanjutkan tanpa reconstruct context dari chat history.

- **UJ-4. AI-native Engineer menjalankan autonomous execution.**
  Setelah PRD approved dan confidence threshold terpenuhi, AI-native Engineer menjalankan `/yolo-run`. Runtime memilih task yang tidak blocked, membaca contracts, mengimplementasikan concern tunggal, menjalankan lint/test/typecheck, melakukan self-review, memperbarui journal dan state, lalu lanjut ke task berikutnya. Resolution: execution berjalan konsisten sampai completion atau blocked state yang eksplisit.

- **UJ-5. AI-native Engineer memperbaiki architecture drift.**
  Saat runtime atau review mendeteksi implementasi melanggar `AGENTS.md` atau architecture rules, Mugiew Method menandai drift, menjelaskan rule yang dilanggar, membuat journal review, dan mencegah task dianggap done sebelum violation diselesaikan atau dicatat sebagai approved exception. Resolution: maintainability tidak dikorbankan demi task completion cepat.

## 3. Glossary

- **Mugiew Method** — AI Governance & Autonomous Execution Framework untuk discovery, specification, approval, task planning, autonomous execution, validation, dan self-review.
- **Discovery Engine** — komponen yang melakukan conversational requirement discovery, ambiguity detection, contradiction detection, edge-case discovery, dan confidence calculation.
- **Ambiguity** — unknown, contradiction, missing decision, atau requirement gap yang mempengaruhi kemampuan AI untuk mengeksekusi project secara reliable.
- **Blocking Ambiguity** — Ambiguity yang wajib diselesaikan sebelum PRD approval atau YOLO-RUN.
- **Non-Blocking Ambiguity** — Ambiguity yang dapat diselesaikan melalui best practice, assumption, atau downstream architecture decision.
- **Assumption** — keputusan sementara yang dibuat AI dan ditandai eksplisit agar dapat dikonfirmasi atau diubah.
- **Confidence Gate** — aturan readiness yang memakai confidence score, ambiguity count, PRD status, dan validation state untuk mengizinkan atau menolak phase transition.
- **PRD Artifact** — dokumen requirement machine-readable di `_mugiew-method/prd/PRD.md`.
- **Specification Artifact** — dokumen pendukung seperti architecture, technical spec, API contracts, database schema, execution plan, dan testing strategy.
- **AGENTS.md Constitution** — root-level `AGENTS.md` yang menjadi aturan konstitusional untuk AI behavior, architecture, coding standards, UI rules, testing, constraints, dan forbidden patterns.
- **Task Graph** — graph dependency antar implementation tasks.
- **Task** — unit kerja implementation concern tunggal yang traceable, testable, reversible, dan AI-readable.
- **YOLO-RUN Runtime** — autonomous execution runtime yang menjalankan Task Graph setelah Confidence Gate lolos.
- **Self-Review Engine** — komponen yang mengevaluasi output task terhadap code smell, duplication, architecture drift, maintainability, AI readability, type safety, tests, lint, dan validation rules.
- **Project State** — state files dalam `_mugiew-method/state` yang merekam readiness, ambiguity, task progress, dependency graph, dan execution metrics.
- **Journal** — catatan review, done state, decisions, blockers, dan execution history dalam `_mugiew-method/journal`.

## 4. Product Thesis and Differentiation

Mugiew Method berbeda dari workflow AI coding umum karena menempatkan governance sebelum execution. Cursor Rules dan `AGENTS.md`-style instructions memberi persistent context untuk agent, tetapi tidak dengan sendirinya memaksa discovery, confidence gate, task graph, atau execution runtime. Autonomous coding agents seperti OpenHands dan SWE-agent berfokus pada agent execution terhadap issue atau task, sedangkan Mugiew Method berfokus pada readiness protocol sebelum execution serta governance contract selama execution. BMad Method overlap dalam structured workflow, tetapi Mugiew Method diposisikan lebih sempit dan keras pada autonomous software engineering readiness.

**Strategic bet:** AI coding reliability naik signifikan jika system menjadikan ambiguity, specification, task dependency, and self-review sebagai first-class state, bukan conversational memory.

## 5. Features

### 5.1 Project Installation and Bootstrap

**Description:** User dapat menginstall Mugiew Method ke repository lewat NPX. Bootstrap membuat struktur `_mugiew-method/`, root `AGENTS.md`, command metadata, dan initial Project State. [ASSUMPTION: v1 berjalan sebagai local CLI package TypeScript/Node.js, bukan hosted service.]

#### FR-1: Install Mugiew Method into a project

User can run `npx mugiew-method install` from a project root to initialize Mugiew Method.

**Consequences (testable):**
- Command creates `_mugiew-method/` with `discovery`, `prd`, `tasks`, `journal`, `state`, and `rules` directories.
- Command creates root-level `AGENTS.md` if missing.
- Command refuses to overwrite existing Mugiew Method files unless user confirms or passes explicit force flag.
- Command writes initial `project-state.json` with install status and version.

#### FR-2: Detect existing installation

System can detect whether Mugiew Method already exists in a repository.

**Consequences (testable):**
- Re-running install reports existing installation state.
- Re-running install does not silently destroy user-edited files.
- Existing state is migrated only through explicit migration logic. [ASSUMPTION: migration framework exists by v1.1, while v1 can use version guardrails.]

### 5.2 Command Interface

**Description:** User interacts through slash-command style verbs that AI agents can interpret consistently. Commands are documented as deterministic workflows, not merely prompt snippets.

#### FR-3: Provide command contract for `/create-prd`

User can invoke `/create-prd` to start Discovery Engine and PRD Artifact generation.

**Consequences (testable):**
- Command requires project to be installed.
- Command creates or resumes discovery state.
- Command records answers, ambiguities, assumptions, and confidence report.
- Command cannot mark PRD approved.

#### FR-4: Provide command contract for `/approve-prd`

User can invoke `/approve-prd` to lock PRD Artifact and enable execution readiness checks.

**Consequences (testable):**
- Command fails if Blocking Ambiguity count is greater than `0`.
- Command fails if Confidence Gate threshold is not met.
- Command records approval timestamp and approved artifact versions.
- Command triggers task generation and Task Graph generation or marks them required next. [ASSUMPTION: `/approve-prd` can orchestrate task generation in v1 if PRD contains enough structure.]

#### FR-5: Provide command contract for `/yolo-run`

User can invoke `/yolo-run` to start YOLO-RUN Runtime.

**Consequences (testable):**
- Command denies execution unless `ambiguity_count == 0`, confidence threshold is met, and `prd_status == approved`.
- Command selects only unblocked Tasks.
- Command writes each execution step to Journal.
- Command stops on failed validation, unresolved blocker, or explicit user stop.

#### FR-6: Provide command contract for `/project-status`

User can invoke `/project-status` to inspect Project State.

**Consequences (testable):**
- Output includes confidence score, Blocking Ambiguity count, PRD status, task progress, active blockers, architecture health, and latest validation status.
- Output is human-readable and machine-readable. [ASSUMPTION: v1 supports Markdown plus JSON state; structured CLI JSON output may be a flag.]

#### FR-7: Provide command contract for `/review-project`

User can invoke `/review-project` to run review without advancing implementation.

**Consequences (testable):**
- Review checks architecture drift, rule violations, task completion claims, and validation gaps.
- Review writes report to Journal.
- Review does not modify source code unless explicit fix mode is requested.

#### FR-8: Provide command contract for `/rebuild-tasks`

User can invoke `/rebuild-tasks` to regenerate Task Graph from approved specifications.

**Consequences (testable):**
- Command detects manual task edits and surfaces conflicts before overwrite.
- Command preserves completed task history.
- Command records regeneration reason.

### 5.3 Discovery Engine

**Description:** Discovery Engine conducts natural conversational interrogation. It is not a static form. It silently tracks required concern domains while asking adaptive questions.

#### FR-9: Run natural conversational discovery

Discovery Engine can ask adaptive questions based on prior answers.

**Consequences (testable):**
- Questions reference user-provided context.
- System avoids dumping full checklists as forms.
- System challenges contradictions and under-specified decisions.
- System records answer provenance in `discovery/answers.md`.

#### FR-10: Maintain internal discovery concern coverage

Discovery Engine tracks coverage for auth, roles, permissions, security, performance, deployment, database, API, testing, error handling, empty states, loading states, maintainability, AI readability, human readability, observability, accessibility, responsive design, and scalability where applicable.

**Consequences (testable):**
- Each applicable concern is marked covered, not applicable, or unresolved.
- Uncovered applicable concerns produce Ambiguity entries.
- Concern state contributes to Confidence Gate.

#### FR-11: Detect contradictions and bad decisions

Discovery Engine can challenge user input when requirements conflict or create high risk.

**Consequences (testable):**
- Contradictions produce Blocking Ambiguity unless explicitly resolved.
- Risky choices are logged with rationale.
- User can override recommendations, but override is recorded as decision provenance.

### 5.4 Ambiguity Classification

**Description:** Ambiguity is first-class state. System classifies unknowns and prevents phase transition when blockers remain.

#### FR-12: Classify Ambiguity

System classifies each Ambiguity as Blocking Ambiguity, Non-Blocking Ambiguity, or Assumption.

**Consequences (testable):**
- Every Ambiguity has ID, category, source, impact, owner, and resolution status.
- Blocking Ambiguity must include reason it blocks execution.
- Non-Blocking Ambiguity must include default handling strategy.
- Assumption must include confirmation state.

#### FR-13: Persist Ambiguity reports

System writes Ambiguity state to Markdown and JSON.

**Consequences (testable):**
- `discovery/ambiguities.md` exists for human reading.
- `state/ambiguity-report.json` exists for machine parsing.
- Counts match across Markdown and JSON.

### 5.5 Confidence Gate

**Description:** Confidence Gate calculates project understanding readiness and blocks unsafe transitions.

#### FR-14: Calculate project understanding confidence

System calculates a confidence score based on unresolved ambiguity count, architecture completeness, edge-case coverage, requirement clarity, dependency clarity, and execution predictability.

**Consequences (testable):**
- Confidence report includes numeric score and contributing factors.
- Score changes when Ambiguity status changes.
- Score cannot reach execution-ready state while Blocking Ambiguity exists.

#### FR-15: Enforce phase gates

System enforces gate rules between discovery, specification, approval, and execution.

**Consequences (testable):**
- YOLO-RUN denied if required gate fields fail.
- Denial message names exact failed condition.
- Force mode, if present, requires explicit user confirmation and writes high-severity Journal entry. [ASSUMPTION: force mode exists but is discouraged and visibly unsafe.]

### 5.6 PRD and Specification Generation

**Description:** System generates AI-readable PRD Artifact and Specification Artifacts from Discovery Engine output.

#### FR-16: Generate machine-readable PRD Artifact

System generates `_mugiew-method/prd/PRD.md` with stable IDs for Functional Requirements, Non-Functional Requirements, Acceptance Criteria, Constraints, Architecture Decisions, Open Questions, and Assumptions.

**Consequences (testable):**
- IDs are stable and globally unique within document type.
- Requirements are written as capabilities, not implementation details.
- Assumptions are indexed.
- Open Questions are empty or explicitly deferred before approval.

#### FR-17: Generate Specification Artifacts

System generates architecture, technical spec, API contracts, database schema, execution plan, and testing strategy where applicable.

**Consequences (testable):**
- Missing non-applicable artifacts are explicitly marked not applicable.
- Generated artifacts reference PRD IDs.
- Architecture artifact captures downstream technical decisions, not product requirements.

### 5.7 AGENTS.md Constitution

**Description:** `AGENTS.md` is root-level AI Constitution. It governs agent behavior and project implementation rules.

#### FR-18: Generate root-level AGENTS.md

System creates and maintains root `AGENTS.md`.

**Consequences (testable):**
- File includes architecture rules, coding standards, UI rules, maintainability standards, testing requirements, forbidden patterns, stack decisions, and AI execution constraints.
- File states that implementation must not begin before clarity gates pass.
- File is readable by Codex, Claude, Cursor, and Antigravity. [ASSUMPTION: v1 uses common Markdown conventions rather than tool-specific metadata.]

#### FR-19: Validate work against AGENTS.md Constitution

System can check implementation or task output against `AGENTS.md`.

**Consequences (testable):**
- Violations are reported with rule reference.
- Task cannot be marked done while unresolved critical violation exists.
- Approved exceptions are logged in Journal.

### 5.8 Task System and Task Graph

**Description:** Tasks are implementation concern units, not broad feature bundles. Task Graph prevents autonomous execution from running work in unsafe order.

#### FR-20: Generate granular Tasks

System generates Tasks where `1 task = 1 implementation concern`.

**Consequences (testable):**
- Task files have ID, title, concern, source PRD IDs, dependencies, acceptance criteria, validation commands, expected files or areas, and rollback notes.
- Tasks avoid mixing unrelated concerns like auth API, auth UI, and session persistence into one unit.
- Tasks are independently reviewable.

#### FR-21: Maintain Task Graph

System maintains dependency graph in `state/dependency-graph.json`.

**Consequences (testable):**
- Each Task has dependency status.
- Blocked Tasks cannot be selected by YOLO-RUN Runtime.
- Completed Tasks remain traceable to PRD IDs and Journal entries.

### 5.9 YOLO-RUN Runtime

**Description:** YOLO-RUN Runtime is controlled autonomous execution, not blind code generation.

#### FR-22: Execute Tasks autonomously after readiness

YOLO-RUN Runtime can execute unblocked Tasks after Confidence Gate passes.

**Consequences (testable):**
- Runtime reads `AGENTS.md`, PRD Artifact, Specification Artifacts, Task Graph, Project State, and relevant Journal before editing.
- Runtime runs validation commands required by Task.
- Runtime updates Project State after each Task.
- Runtime can continue to next unblocked Task until completion, blocker, validation failure, or stop condition.

#### FR-23: Stop safely on blockers

YOLO-RUN Runtime stops when it cannot proceed safely.

**Consequences (testable):**
- Stop reason is written to Journal.
- Project State marks runtime status as blocked, failed, paused, or complete.
- Runtime does not invent missing approvals.

### 5.10 Self-Review Engine

**Description:** Self-Review Engine checks every Task before done state.

#### FR-24: Run self-review before task completion

System reviews output for code smell, duplicate logic, architecture drift, maintainability, AI readability, type safety, test status, lint status, and rule compliance.

**Consequences (testable):**
- Review report exists before done Journal entry.
- Critical finding prevents done state.
- Medium/low findings are tracked with disposition.

#### FR-25: Detect architecture drift

System detects whether implementation diverges from architecture and `AGENTS.md`.

**Consequences (testable):**
- Drift finding includes expected rule, observed change, severity, and remediation.
- Approved drift requires explicit Journal entry.

### 5.11 UI Governance

**Description:** UI outputs must comply with Uncodixfy-inspired philosophy: human-designed, purposeful, restrained, not AI-generated-looking.

#### FR-26: Enforce UI rules in generated guidance

System includes UI rules in `AGENTS.md` and `rules/ui-rules.md`.

**Consequences (testable):**
- Rules discourage excessive glassmorphism, unnecessary gradients, oversized rounded corners, generic dashboard cards, decorative layouts, and fake-modern interfaces.
- UI requirements include states for loading, empty, error, disabled, responsive, and accessibility where UI exists.
- Self-review checks UI work against UI rules when task touches UI.

## 6. Cross-Cutting Non-Functional Requirements

- **NFR-1 Reliability:** Gate logic must be deterministic from Project State. Same state should produce same readiness decision.
- **NFR-2 AI Readability:** Core artifacts must be parseable by future AI agents without relying on prior chat context.
- **NFR-3 Human Readability:** Core artifacts must remain readable by engineers, not only machines.
- **NFR-4 Portability:** v1 must work across common local repositories without hosted service dependency. [ASSUMPTION: cloud sync is out of scope for MVP.]
- **NFR-5 Traceability:** PRD IDs, Task IDs, Journal entries, and Project State must preserve trace from intent to execution result.
- **NFR-6 Safety:** Destructive actions require explicit command contract and Journal entry.
- **NFR-7 Extensibility:** Engines should expose boundaries for future provider adapters and tool-specific integrations.
- **NFR-8 Performance:** CLI operations on typical small-to-medium projects should complete setup/status operations within interactive CLI expectations. [ASSUMPTION: exact benchmark defined during architecture.]
- **NFR-9 Accessibility:** Any generated UI guidance must require WCAG-aware behavior for user-facing products.
- **NFR-10 Observability:** Runtime decisions, gate denials, validation failures, and overrides must be inspectable through Journal and Project State.

## 7. Constraints and Guardrails

- **C-1:** AI cannot implement before `ambiguity_count == 0` for Blocking Ambiguity.
- **C-2:** `AGENTS.md` must exist at project root.
- **C-3:** Discovery must be conversational and adaptive, not fixed-form interrogation.
- **C-4:** YOLO-RUN requires approved PRD unless explicit force mode is confirmed and logged.
- **C-5:** All core structures must be deterministic enough for AI parsing.
- **C-6:** Human + AI maintainability is a product requirement, not an implementation preference.
- **C-7:** UI governance must follow Uncodixfy-aligned anti-pattern avoidance.
- **C-8:** Task generation must preserve `1 task = 1 implementation concern`.
- **C-9:** Project State must never contradict authoritative Markdown artifacts without reporting drift.
- **C-10:** User-owned files must not be silently overwritten.

## 8. MVP Scope

### 8.1 In Scope

- Local CLI installation via NPX.
- `_mugiew-method/` directory creation.
- Root `AGENTS.md` generation.
- Slash-command workflow contracts for `/create-prd`, `/approve-prd`, `/yolo-run`, `/project-status`, `/review-project`, and `/rebuild-tasks`.
- Discovery Engine prompt/workflow artifacts.
- Ambiguity classification Markdown and JSON state.
- Confidence Gate report and readiness checks.
- PRD and Specification Artifact generation.
- Task file generation.
- Task Graph JSON.
- YOLO-RUN Runtime protocol.
- Self-Review Engine protocol.
- Journal updates.
- UI rules generation.

### 8.2 Out of Scope for MVP

- Hosted SaaS dashboard.
- Multi-user cloud collaboration.
- Enterprise RBAC.
- Marketplace for extensions.
- Full provider abstraction across all AI tools.
- Automatic direct control of every AI IDE. [ASSUMPTION: v1 provides files and command contracts that AI tools can follow.]
- Formal compliance certifications.
- Visual GUI.
- Training custom models.

## 9. Public Surface and Versioning

- **Public CLI:** `npx mugiew-method install`.
- **Public command contracts:** `/create-prd`, `/approve-prd`, `/yolo-run`, `/project-status`, `/review-project`, `/rebuild-tasks`.
- **Public file contracts:** root `AGENTS.md`, `_mugiew-method/discovery`, `_mugiew-method/prd`, `_mugiew-method/tasks`, `_mugiew-method/journal`, `_mugiew-method/state`, `_mugiew-method/rules`.
- **Versioning policy:** v1 must avoid breaking existing project state without migration path. [ASSUMPTION: semantic versioning applies to CLI package and file contract version.]

## 10. Risks and Mitigations

- **R-1 Over-rigidity:** Gates may feel slow. Mitigation: Fast Path discovery and explicit force mode with warnings.
- **R-2 False confidence:** Confidence score may imply more certainty than warranted. Mitigation: confidence report must show factors and unresolved assumptions.
- **R-3 Tool fragmentation:** Claude, Cursor, Codex, and Antigravity may interpret instructions differently. Mitigation: common Markdown contracts first, tool adapters later.
- **R-4 State drift:** Markdown and JSON artifacts may diverge. Mitigation: status command detects drift and reports source of truth conflict.
- **R-5 AI self-review blindness:** Agent may miss its own errors. Mitigation: require concrete validation commands and optional external review workflows.
- **R-6 Scope creep:** Framework may become full IDE or hosted orchestrator too early. Mitigation: MVP focuses on protocol, files, CLI, and runtime contracts.

## 11. Success Metrics

**Primary**

- **SM-1:** Gate correctness — YOLO-RUN denies execution when required readiness fields fail in 100% of fixture cases. Validates FR-5, FR-14, FR-15.
- **SM-2:** Artifact completeness — generated project contains all required MVP directories, state files, and root `AGENTS.md` in 100% of install fixtures. Validates FR-1, FR-18.
- **SM-3:** Traceability coverage — every generated Task references at least one PRD ID and has dependency metadata. Validates FR-20, FR-21.
- **SM-4:** Review enforcement — Task cannot be marked done when critical self-review finding exists. Validates FR-24, FR-25.

**Secondary**

- **SM-5:** AI continuation success — a fresh AI session can identify next task, blockers, and rules using only repository artifacts in benchmark projects. Validates FR-6, FR-21, FR-22.
- **SM-6:** User-perceived clarity — launch users report that generated PRD/tasks reduce ambiguous implementation starts compared with their prior AI coding workflow. Validates FR-9, FR-16, FR-20.

**Counter-metrics**

- **SM-C1:** Do not optimize for raw generation speed if it reduces gate quality. Counterbalances SM-6.
- **SM-C2:** Do not maximize document length as proxy for clarity. Counterbalances SM-2 and SM-5.
- **SM-C3:** Do not over-block on implementation-detail ambiguity that architecture workflow can safely resolve. Counterbalances SM-1.

## 12. Acceptance Criteria

- **AC-1:** Fresh repository install via `npx mugiew-method install` creates required Mugiew Method structure, root `AGENTS.md`, and initial Project State without overwriting existing user content silently.
- **AC-2:** `/create-prd` produces Discovery Engine outputs, Ambiguity reports, Assumptions, Confidence report, and draft PRD Artifact.
- **AC-3:** System classifies all unresolved unknowns as Blocking Ambiguity, Non-Blocking Ambiguity, or Assumption before PRD approval.
- **AC-4:** `/approve-prd` refuses approval while Blocking Ambiguity count is greater than `0`.
- **AC-5:** `/yolo-run` returns `YOLO-RUN DENIED` when `ambiguity_count != 0`, confidence threshold is unmet, or `prd_status != approved`.
- **AC-6:** Generated Tasks each contain one implementation concern, source PRD ID references, dependency metadata, acceptance criteria, and validation expectations.
- **AC-7:** Task Graph prevents YOLO-RUN Runtime from selecting blocked Tasks.
- **AC-8:** Every completed Task has Journal entries for implementation, validation, self-review, and done state.
- **AC-9:** Critical Self-Review Engine findings prevent Task completion until resolved or explicitly approved as exception.
- **AC-10:** `/project-status` reports confidence score, ambiguity count, PRD status, task progress, blocker state, architecture health, and latest validation state.
- **AC-11:** `AGENTS.md` Constitution contains enforceable rules for architecture, coding standards, UI, maintainability, testing, forbidden patterns, stack decisions, and AI execution constraints.
- **AC-12:** A fresh AI session can read repository artifacts and identify next safe action without relying on prior chat history.

## 13. Architecture Decisions

- **AD-1:** Mugiew Method v1 is project-local first, using repository files as source of truth rather than hosted SaaS state.
- **AD-2:** `AGENTS.md` Constitution is mandatory at repository root.
- **AD-3:** Core artifacts are dual-readable: Markdown for humans and AI agents, JSON for deterministic machine state where needed.
- **AD-4:** System architecture follows three conceptual engines: Understanding Engine, Governance Engine, and Execution Engine.
- **AD-5:** YOLO-RUN Runtime is gated by Project State, not conversational confidence.
- **AD-6:** Task granularity follows `1 task = 1 implementation concern`.
- **AD-7:** UI governance is embedded into generated rules rather than treated as optional style guidance.
- **AD-8:** TypeScript + Node.js is recommended for CLI implementation. [ASSUMPTION: final architecture may refine package layout but should preserve NPX compatibility.]

## 14. Open Questions

- **OQ-1:** Exact confidence scoring formula and threshold.
- **OQ-2:** Whether force mode ships in MVP or is deferred.
- **OQ-3:** Exact JSON schemas for Project State, Ambiguity report, Dependency Graph, and Execution Metrics.
- **OQ-4:** Whether `/approve-prd` generates Tasks directly or only unlocks task generation command.
- **OQ-5:** How provider/tool adapters are represented in v1.
- **OQ-6:** How strongly Mugiew Method should integrate with existing BMad workflows versus remain independent.
- **OQ-7:** Whether package architecture follows three engines only or finer-grained packages from day one.

## 15. Assumptions Index

- §5.1 — [ASSUMPTION: v1 berjalan sebagai local CLI package TypeScript/Node.js, bukan hosted service.]
- §5.1 — [ASSUMPTION: migration framework exists by v1.1, while v1 can use version guardrails.]
- §5.2 — [ASSUMPTION: `/approve-prd` can orchestrate task generation in v1 if PRD contains enough structure.]
- §5.2 — [ASSUMPTION: v1 supports Markdown plus JSON state; structured CLI JSON output may be a flag.]
- §5.5 — [ASSUMPTION: force mode exists but is discouraged and visibly unsafe.]
- §5.7 — [ASSUMPTION: v1 uses common Markdown conventions rather than tool-specific metadata.]
- §6 — [ASSUMPTION: cloud sync is out of scope for MVP.]
- §6 — [ASSUMPTION: exact benchmark defined during architecture.]
- §8.2 — [ASSUMPTION: v1 provides files and command contracts that AI tools can follow.]
- §9 — [ASSUMPTION: semantic versioning applies to CLI package and file contract version.]
- §13 — [ASSUMPTION: final architecture may refine package layout but should preserve NPX compatibility.]
