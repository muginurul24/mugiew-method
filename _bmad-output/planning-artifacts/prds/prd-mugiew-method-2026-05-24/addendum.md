# Addendum

## Source Architecture Notes

User supplied a system architecture direction covering discovery, specification, `AGENTS.md`, ambiguity classification, confidence calculation, PRD format, task system, dependency graph, YOLO-RUN runtime, self-review engine, UI philosophy, CLI design, and TypeScript/Node.js stack recommendation.

Technical depth that may belong in downstream architecture:

- Suggested package structure:
  - `packages/core`
  - `packages/cli`
  - `packages/discovery-engine`
  - `packages/ambiguity-engine`
  - `packages/task-engine`
  - `packages/yolo-runtime`
  - `packages/review-engine`
- Recommended CLI stack: TypeScript + Node.js.
- Install command target: `npx mugiew-method install`.
- Command set:
  - `/create-prd`
  - `/approve-prd`
  - `/yolo-run`
  - `/project-status`
  - `/review-project`
  - `/rebuild-tasks`

## Competitive / Landscape Notes

These notes inform positioning but are not product requirements by themselves.

- Source links checked during PRD drafting:
  - BMad Method docs: https://docs.bmad-method.org/
  - Cursor docs: https://cursor.com/docs
  - SWE-agent GitHub: https://github.com/SWE-agent/SWE-agent
  - OpenHands GitHub: https://github.com/OpenHands/OpenHands
- BMad Method overlaps as a structured AI-assisted product and delivery workflow. Mugiew Method should differentiate through stronger autonomous execution readiness, ambiguity gating, and project-local governance contracts.
- Cursor Rules and similar IDE instruction systems overlap with persistent AI guidance. Mugiew Method should treat instructions as one layer only; the differentiator is the full loop of discovery, approval, task graph, runtime, validation, and journal.
- SWE-agent, OpenHands/OpenDevin-style systems, and Devin-style orchestration overlap with autonomous execution. Mugiew Method should differentiate by governing whether execution is safe before it begins and by maintaining AI-readable project state across future agents.
- AutoGPT-style agent systems overlap with autonomous task execution but are less specifically targeted at production software engineering governance.

## Architecture Work Needed Next

- Define JSON schemas:
  - `project-state.json`
  - `ambiguity-report.json`
  - `dependency-graph.json`
  - `execution-metrics.json`
- Define Task file schema.
- Define Confidence Gate formula.
- Define force mode policy.
- Define status drift detection rules between Markdown and JSON.
- Decide whether package boundaries follow:
  - Three-engine model: Understanding, Governance, Execution.
  - Fine-grained packages: `core`, `cli`, `discovery-engine`, `ambiguity-engine`, `task-engine`, `yolo-runtime`, `review-engine`.
- Define command lifecycle for each slash command.
- Define file overwrite and migration policy.
