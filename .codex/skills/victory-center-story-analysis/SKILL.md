---
name: victory-center-story-analysis
description: Analyze non-trivial Victory Center stories before planning by extracting acceptance criteria, assumptions, ambiguities, constraints, edge cases, and out-of-scope boundaries.
---

# Victory Center Story Analysis

Use this skill when Codex needs to understand a non-trivial user story or
request before implementation planning. Keep it lightweight for routine fixes:
small, obvious changes usually do not need durable analysis artifacts.

## Responsibility

Convert the original request into a stable requirement model while preserving
the user's intent. Read `AGENTS.md` first for shared project rules, then inspect
repository context when existing behavior can answer an ambiguity. Use
`victory-center-project-patterns` when repository behavior can resolve a
technical ambiguity without making a product decision.

## Authority Order

```text
user story / explicit user clarification
-> acceptance criteria
-> implementation plan
-> tasks
-> implementation
```

Lower layers may clarify or decompose higher layers, but must never silently
remove a requirement, weaken a requirement, change product behavior, or mark
something out of scope without support from the original request or explicit
clarification.

## Workflow

1. Preserve the original user story/request and any explicit clarifications.
2. Extract explicit acceptance criteria as stable IDs: `AC-1`, `AC-2`, and so
   on.
3. Identify assumptions, ambiguities, constraints, edge cases implied by the
   story, and relevant out-of-scope boundaries.
4. Inspect existing code or documentation before asking the user questions when
   the answer can reasonably be derived from the repository.
5. Separate observed project behavior, reasonable technical inference, and
   product decisions that require user clarification.
6. For large or resumable stories, optionally write durable analysis to
   `.codex/work/<story-slug>/analysis.md`.

## Output Contract

Return or record:

- Original request summary.
- Acceptance criteria using `AC-*` IDs.
- Observed project behavior.
- Technical assumptions and inferences.
- Ambiguities or product decisions that still need clarification.
- Constraints, edge cases, and out-of-scope notes.

## Boundaries

This skill must not:

- Modify source code.
- Create implementation tasks.
- Decide implementation details prematurely.
- Invent product requirements.
- Ask questions when repository inspection can reasonably answer them.
- Treat `.codex/work/` artifacts as more authoritative than the original story
  or explicit user clarification.
