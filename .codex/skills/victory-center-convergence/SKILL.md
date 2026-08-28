---
name: victory-center-convergence
description: Read-only check that a large or complex Victory Center implementation satisfies the original story and acceptance criteria without becoming PR review or verification.
---

# Victory Center Convergence

Use this skill after a large or complex story has been implemented and the
question is whether the actual implementation converged with the original
story. Do not make convergence mandatory for tiny fixes.

## Responsibility

Re-evaluate the original requirements against the actual implementation. This
is a read-only completeness check, not general code review, test execution,
refactoring, or implementation.

## When To Use

Use convergence when:

- A large story was decomposed into multiple `T-*` tasks.
- Several project layers were changed.
- Implementation happened across multiple passes or sessions.
- Many `AC-*` entries exist.
- The user asks whether the story is actually complete.
- All implementation tasks appear done but completeness still needs an
  independent check.

## Evidence Hierarchy

Inspect in this authority order:

1. Original user story/request.
2. Explicit user clarifications.
3. Acceptance criteria.
4. Plan.
5. Tasks.
6. Actual code or diff.
7. Tests only as supporting evidence.

Tasks are implementation aids, not proof of completeness. Even if every `T-*`
is checked, independently re-check the original story and `AC-*` entries.

## Checks

For each requirement, compare expected behavior with the actual implementation
and report only unresolved gaps:

- `MISSING` - the requirement is not implemented.
- `PARTIAL` - some required behavior exists, but not all of it.
- `INCORRECT` - implementation exists but does not match the requirement.

Do not report style or code-smell findings unless they directly prevent
requirement satisfaction.

## Output Contract

User-facing output must contain only unresolved requirement gaps:

```text
[MISSING] AC-4 - Edit flow support
Expected:
...

Found:
...

Evidence:
- relevant file(s)
```

If no unresolved gaps are found, say:

```text
Convergence complete. No unmet, partial, or incorrectly implemented story requirements were found.
```

Do not output a verbose successful-AC checklist.

## Temporary Artifact

When the active workflow already uses durable work artifacts, convergence may
update `.codex/work/<story-slug>/convergence.md`. Keep it limited to current
unresolved gaps. When a later pass resolves a gap, remove it from the artifact
instead of keeping a historical success log.

## Gap Resolution Handoff

Convergence itself stays read-only. If gaps are found, implementation may later
resolve them. Reuse an existing unchecked `T-*` task when it already represents
the gap. Add a new `T-*` with the next unused ID only when the gap is materially
independent work.

Do not declare story completion until convergence reports no unresolved gaps,
unless the user explicitly accepts or waives a known gap.

## Boundaries

This skill must not:

- Edit application code.
- Modify tests.
- Fix gaps.
- Alter acceptance criteria.
- Rewrite the plan to hide discrepancies.
- Mark tasks complete.
- Perform cleanup.
- Run broad refactors.
- Replace verification or PR review.
