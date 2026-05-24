---
project: mugiew-method
date: 2026-05-24
change_scope: moderate
status: approved
trigger: post_mvp_launch_hardening
mode: batch
---

# Sprint Change Proposal: Post-MVP Launch Hardening

## 1. Issue Summary

Mugiew Method MVP implementation is complete through Epic 6, with project documentation and AI project context generated. Checkpoint review and generated project context surfaced a clear gap between current MVP implementation and launch-grade product claims.

The triggering issue is not a failed story. It is a post-MVP readiness gap discovered after implementation review:

- Product promise includes `npx mugiew-method install`, but package manifests are still `private: true` and use workspace-only dependency references.
- Product promise includes governance-grade gates, but YOLO-RUN currently treats approval record existence as approval without validating schema or artifact freshness.
- Product promise includes autonomous reliability, but validation command execution uses trusted shell strings without timeout/output/env policy.
- Product promise includes project review, but CLI `review-project` aggregates state only and does not scan project files for AGENTS.md violations.
- Product promise includes discovery engine, but implementation currently provides discovery primitives and bootstrap rather than a full adaptive conversational interrogation runtime.

Evidence:

- `docs/project-overview.md` lists launch gaps.
- `docs/architecture.md` lists architecture risks.
- `_bmad-output/project-context.md` records critical don't-miss rules.
- Checkpoint review identified packaging, gate freshness, validation runner, status, review-project, discovery, task graph, and CLI hardening gaps.

## 2. Checklist Findings

### 1. Understand Trigger and Context

- [x] 1.1 Trigger story: N/A. Trigger came from checkpoint review after Epic 6 completion.
- [x] 1.2 Core problem: MVP is functionally implemented, but launch-grade reliability and install path require a new hardening epic.
- [x] 1.3 Evidence: generated docs, checkpoint findings, package manifests, CLI review, and project context.

### 2. Epic Impact Assessment

- [x] 2.1 Current epic impact: Epic 6 remains complete. No rollback needed.
- [x] 2.2 Required epic-level change: add Epic 7 for launch hardening.
- [x] 2.3 Future epic impact: no existing future epic exists; Epic 7 becomes next backlog item.
- [x] 2.4 Obsolete epics: none.
- [x] 2.5 Priority: Epic 7 should precede any public release or broader feature expansion.

### 3. Artifact Conflict and Impact Analysis

- [x] 3.1 PRD impact: PRD requirements remain valid, but release-readiness requirements need explicit hardening stories.
- [x] 3.2 Architecture impact: architecture should add launch hardening notes for packaging, approval integrity, validation command policy, review-project scan behavior, and discovery runtime gap.
- [N/A] 3.3 UI/UX impact: no user-facing UI in MVP; CLI output remains relevant.
- [x] 3.4 Other artifacts: sprint plan/status, documentation, project context, and tests should be updated after Epic 7 is approved.

### 4. Path Forward Evaluation

- [x] 4.1 Direct Adjustment: viable. Add Epic 7 and stories; no rollback.
- [x] 4.2 Potential Rollback: not viable. Completed work is useful and does not block hardening.
- [x] 4.3 PRD MVP Review: viable only as clarification. MVP can remain complete; launch readiness becomes next scope.
- [x] 4.4 Recommended path: Direct Adjustment with a new moderate-scope Epic 7.

### 5. Sprint Change Proposal Components

- [x] 5.1 Issue summary created.
- [x] 5.2 Epic and artifact impacts documented.
- [x] 5.3 Path forward documented.
- [x] 5.4 MVP impact documented.
- [x] 5.5 Handoff plan documented.

### 6. Final Review and Handoff

- [x] 6.1 Checklist complete.
- [x] 6.2 Proposal drafted.
- [!] 6.3 Awaiting user approval.
- [!] 6.4 Sprint status not updated until proposal approval.
- [x] 6.5 Handoff plan included.

## 3. Recommended Approach

Use Direct Adjustment: add Epic 7, "Launch Hardening & Release Readiness".

Rationale:

- Existing MVP implementation should remain intact.
- Gaps are coherent and release-oriented, not evidence that Epics 1-6 were wrong.
- Work is moderate scope and can be implemented by Developer agent with focused stories.
- This keeps the product direction stable while closing the most important launch blockers.

Change scope classification: **Moderate**.

## 4. Detailed Change Proposals

### 4.1 Epics Document Change

Artifact: `_bmad-output/planning-artifacts/epics.md`

Section: `## Epic List`

OLD:

```md
### Epic 6: YOLO-RUN Runtime & Self-Review Enforcement

User can run controlled autonomous execution that selects unblocked tasks, validates work, performs self-review, updates Journal, and stops safely on blockers.

**FRs covered:** FR5, FR22, FR23, FR24
```

NEW:

```md
### Epic 6: YOLO-RUN Runtime & Self-Review Enforcement

User can run controlled autonomous execution that selects unblocked tasks, validates work, performs self-review, updates Journal, and stops safely on blockers.

**FRs covered:** FR5, FR22, FR23, FR24

### Epic 7: Launch Hardening & Release Readiness

User can rely on Mugiew Method as a launch-ready CLI package with stronger approval integrity, safer validation execution, richer project review, explicit discovery runtime scope, and release packaging support.

**FRs covered:** FR1, FR3, FR5, FR6, FR7, FR8, FR9, FR15, FR22, NFR1, NFR4, NFR6, NFR10
```

Rationale: Epic 7 captures hardening gaps without reopening completed MVP epics.

### 4.2 New Epic 7 Stories

Add to `_bmad-output/planning-artifacts/epics.md` after Epic 6.

```md
## Epic 7: Launch Hardening & Release Readiness

User can rely on Mugiew Method as a launch-ready CLI package with stronger approval integrity, safer validation execution, richer project review, explicit discovery runtime scope, and release packaging support.

### Story 7.1: Make CLI Package NPM Release Ready

As an AI-native Engineer,
I want `npx mugiew-method install` to work from a published package,
So that Mugiew Method can be installed outside the source workspace.

Acceptance Criteria:
- Root or package publish strategy is explicit and documented.
- `private: true` blockers are removed or release package is separated.
- Workspace dependencies are publishable or bundled intentionally.
- Published package exposes `mugiew-method` bin.
- Package includes `license`, `files` or equivalent publish control, and built `dist`.
- A packaging smoke test verifies install command from packed artifact.

### Story 7.2: Validate Approval Record Integrity Before YOLO-RUN

As an Autonomous Project Maintainer,
I want YOLO-RUN to reject stale or malformed approvals,
So that execution cannot proceed after approved artifacts change.

Acceptance Criteria:
- Approval record is parsed and schema-validated.
- Approval record includes content hash versions for approved PRD, confidence report, and ambiguity report.
- YOLO-RUN compares current artifact versions against approval record.
- Stale, malformed, or missing approval produces `YOLO-RUN DENIED`.
- Project status reports stale approval separately from draft/approved.

### Story 7.3: Harden Validation Command Execution

As an AI-native Engineer,
I want task validation commands to have execution limits and explicit trust boundaries,
So that YOLO-RUN cannot hang or silently leak sensitive environment data.

Acceptance Criteria:
- Validation runner supports command timeout.
- Validation runner limits captured output size or documents truncation.
- Validation runner documents trusted project-local command model.
- Failure journals include timeout/output-limit reason when applicable.
- Tests cover timeout, failed command, and successful command behavior.

### Story 7.4: Make Project Review CLI Scan Relevant Files

As an Autonomous Project Maintainer,
I want `/review-project` to inspect actual project outputs,
So that AGENTS.md violations are detectable from CLI usage.

Acceptance Criteria:
- CLI can collect review inputs from changed files, task expected files, or explicit paths.
- `reviewProject` can distinguish no inputs from no violations.
- Review report includes scanned file count and skipped file count.
- CLI output summarizes finding categories, not only count.

### Story 7.5: Add Dependency Graph Cycle Detection

As an AI-native Engineer,
I want dependency graph rebuild and runtime selection to detect cycles,
So that autonomous execution does not stall on opaque blocked states.

Acceptance Criteria:
- Dependency graph validation detects cycles.
- Cycle findings identify involved task IDs.
- Project status reports cycle blockers.
- Runtime task selection stops safely with cycle reason.

### Story 7.6: Clarify Discovery Runtime Scope

As an AI-native Engineer,
I want `/create-prd` behavior to clearly distinguish bootstrap primitives from full conversational discovery,
So that product claims and CLI behavior stay aligned.

Acceptance Criteria:
- CLI output names current discovery phase accurately.
- Documentation states whether adaptive interrogation is implemented or pending.
- If implemented, conversational discovery writes answer provenance and updates ambiguity/confidence state.
- If deferred, backlog records full adaptive runtime as post-launch work.
```

Rationale: Stories map directly to checkpoint and project-context launch gaps.

### 4.3 PRD Change

Artifact: `_bmad-output/planning-artifacts/prds/prd-mugiew-method-2026-05-24/prd.md`

Section: add under Features or Constraints.

OLD:

```md
FR-1: Install Mugiew Method into a project
```

NEW:

```md
FR-1a: Support release-grade installation path

The published package must support `npx mugiew-method install` outside the source workspace.

Consequences:
- Package manifest is publishable.
- CLI bin resolves from published artifact.
- Internal dependencies resolve without workspace-only assumptions.
- Packed artifact smoke test validates install command.
```

Rationale: Existing FR1 says what user can run, but not release packaging constraints needed to make it true.

### 4.4 Architecture Change

Artifact: `_bmad-output/planning-artifacts/architecture.md`

Section: add under Security Decisions / Runtime.

OLD:

```md
Shell command execution must be explicit, logged, and task-bound.
```

NEW:

```md
Shell command execution must be explicit, logged, task-bound, timeout-bounded, and output-bounded. Validation commands are trusted project-local execution, not untrusted external input.
```

Rationale: Captures validation runner security boundary and runtime resilience.

### 4.5 Sprint Status Change

Artifact: `_bmad-output/implementation-artifacts/sprint-status.yaml`

After approval, add:

```yaml
  epic-7: backlog
  7-1-make-cli-package-npm-release-ready: backlog
  7-2-validate-approval-record-integrity-before-yolo-run: backlog
  7-3-harden-validation-command-execution: backlog
  7-4-make-project-review-cli-scan-relevant-files: backlog
  7-5-add-dependency-graph-cycle-detection: backlog
  7-6-clarify-discovery-runtime-scope: backlog
  epic-7-retrospective: optional
```

Rationale: Keeps completed Epics 1-6 untouched and queues launch hardening.

## 5. Implementation Handoff

Scope: **Moderate**

Recommended route:

- Product Owner / Developer: approve Epic 7 insertion and sprint-status backlog update.
- Developer agent: implement stories 7.1 through 7.6 sequentially.
- Code Review agent: review each story with special focus on release packaging, gate integrity, shell execution policy, and state corruption behavior.
- Tech Writer: update `docs/index.md`, `_bmad-output/project-context.md`, and package README after Epic 7 completion.

Suggested story order:

1. Story 7.2 approval integrity first because it protects YOLO-RUN.
2. Story 7.3 validation hardening.
3. Story 7.5 dependency cycle detection.
4. Story 7.4 review-project scan behavior.
5. Story 7.6 discovery scope clarification.
6. Story 7.1 package release readiness last, after behavior is stable.

## 6. Success Criteria

- `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm check` pass.
- Packaging smoke test validates `mugiew-method install` from packed artifact.
- YOLO-RUN denies stale approval.
- Validation runner cannot hang indefinitely.
- Project status surfaces stale/corrupt state clearly.
- Review CLI scans relevant files or clearly reports no scanned files.
- Dependency graph cycles are explicit blockers.
- Documentation no longer overclaims implemented adaptive discovery behavior.

## 7. Approval Status

Status: approved by user on 2026-05-24.

Approved next steps:

1. Update `epics.md` with Epic 7 and stories.
2. Update `sprint-status.yaml` with Epic 7 backlog entries.
3. Run sprint planning or create Story 7.1/7.2 depending selected order.
