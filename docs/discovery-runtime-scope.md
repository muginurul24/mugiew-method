# Discovery Runtime Scope

Mugiew Method currently implements discovery bootstrap primitives.

`create-prd` creates or resumes:

- `_mugiew-method/discovery/answers.md`
- `_mugiew-method/discovery/ambiguities.md`
- `_mugiew-method/discovery/assumptions.md`
- `_mugiew-method/discovery/confidence-report.md`
- `_mugiew-method/state/ambiguity-report.json`

Current runtime phase:

```txt
bootstrap-primitives
```

Adaptive conversational interrogation is pending. Current CLI does not run full natural-language clarification loop, generate adaptive questions from prior answers, or update ambiguity/confidence state from answer provenance during command execution.

Implemented scope is explicit so future agents do not overclaim discovery behavior.
