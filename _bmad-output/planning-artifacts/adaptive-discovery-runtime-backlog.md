# Adaptive Discovery Runtime Backlog

Status: deferred

## Scope

Implement full adaptive conversational discovery runtime after launch hardening.

## Required Capabilities

- Ask adaptive natural-language questions based on prior answers.
- Record answer provenance.
- Update ambiguity report from answers.
- Update assumptions from answers.
- Recalculate confidence after each discovery turn.
- Challenge contradictions and risky decisions during conversation.
- Preserve deterministic machine-readable state.

## Reason Deferred

Current launch-hardening scope clarifies that `/create-prd` bootstraps discovery artifacts and state. Full adaptive interrogation needs a dedicated runtime story because it changes command interaction model and state transitions.
