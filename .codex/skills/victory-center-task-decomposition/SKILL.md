---
name: victory-center-task-decomposition
description: Decompose large Victory Center implementation plans into stable T-* tasks linked to acceptance criteria without changing product requirements.
---

# Victory Center Task Decomposition

Use this skill only for large stories where a durable task list will help
implementation proceed in stable units. Do not make it mandatory for routine
feature work or small fixes.

## Responsibility

Convert a sufficiently large implementation plan into executable tasks while
preserving acceptance criteria as the source of what must be true.

## Inputs

- Original story/request.
- Story analysis and `AC-*` acceptance criteria.
- Implementation plan.
- Relevant scope boundaries and re-plan triggers.

## Task IDs

Use monotonically increasing stable IDs:

```text
T-001
T-002
T-003
```

Rules:

- IDs are never reused.
- If a task is cancelled or deferred, do not renumber later tasks.
- Newly discovered tasks receive the next unused ID.
- Task order may evolve, but identity must remain stable.

## Task Syntax

Prefer concise checklist entries:

```markdown
- [ ] T-001 [AC-1] Add request/response types for the publishing flow
- [ ] T-008 [AC-2, AC-4] Add focused regression tests for failed publish requests
- [ ] T-012 [AC-3] Wire publish state into the existing admin form
  Depends on: T-004, T-009
```

Add dependency metadata only when it provides real implementation value.

## Task Granularity

A task should represent one meaningful implementation unit or small outcome.

Good examples:

- Add request/response types for the publishing flow.
- Add admin API method for publishing a program.
- Wire publish state into the existing admin form.
- Add focused regression tests for failed publish requests.

Bad examples:

- Open file.
- Read component.
- Add import.
- Rename variable.
- Implement feature.
- Fix everything.

For a normal large story, prefer tens of meaningful tasks rather than dozens of
microscopic editor operations.

## AC Traceability

Every implementation task should reference relevant `AC-*` IDs when possible.
Technical enabling tasks that do not directly satisfy one AC may reference
multiple ACs or be clearly marked as shared/cross-cutting.

Acceptance criteria define what must be true. Tasks define how the
implementation intends to achieve it. Completing every task does not prove the
story is complete; a later convergence pass must independently re-check the
original requirements.

## Task Lifecycle

Use checkboxes as implementation state:

- `[ ]` = not yet completed.
- `[x]` = implementation unit completed and minimally verified.

Do not mark `[x]` merely because a file was edited. If implementation discovers
a materially separate piece of work, add a new `T-*` task instead of silently
making an existing task much broader.

For large stories, durable task state should map to
`.codex/work/<story-slug>/tasks.md`. Prefer one `tasks.md` by default. Split
into multiple task files only when one task file becomes difficult to navigate.

## Boundaries

This skill must not:

- Alter acceptance criteria.
- Redefine product behavior.
- Hide dropped requirements.
- Treat task completion as proof of story completion.
- Modify application code.
