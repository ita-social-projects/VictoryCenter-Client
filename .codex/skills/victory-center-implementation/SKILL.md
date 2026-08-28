---
name: victory-center-implementation
description: Implement focused Victory Center React/TypeScript changes. Use for feature work, bug fixes, refactors, admin/public page updates, forms, API services, i18n, tests, or rich text changes in this repository.
---

# Victory Center Implementation

Use this skill when Codex is asked to change code in the Victory Center client.
Keep it practical: understand the local pattern, make the smallest useful edit,
verify the touched behavior, and report what changed.

## Workflow

1. Read `AGENTS.md` first for shared project rules.
2. Check `git status --short` before editing and preserve unrelated user work.
3. For medium or large stories, inspect relevant planning artifacts when they
   exist:
   - Original user request or `.codex/work/<story-slug>/story.md`
   - `.codex/work/<story-slug>/analysis.md`
   - `.codex/work/<story-slug>/plan.md`
   - `.codex/work/<story-slug>/tasks.md`

   Reconcile resumed artifacts with current `git status`, relevant diffs, and
   current code before trusting technical assumptions.
4. Inspect the closest existing examples before coding:
   - Components: `src/components/`, `src/pages/`
   - Hooks: `src/hooks/`
   - API services: `src/services/api/`
   - Types: `src/types/`
   - Validation: `src/validation/`
   - Locale strings: `src/locales/uk/`, `src/locales/en/`
   - Tests and mocks near the changed file
5. Identify the minimal set of files required for the request.
6. Edit only those files. Do not touch `.claude/`, `.github/`, or `CLAUDE.md`
   unless explicitly requested.
7. Run the narrowest useful verification. Prefer targeted tests first, then
   broader lint/build checks when risk or scope justifies them.

Planning artifacts are optional. Small fixes must still be able to move directly
from request to implementation.

For non-trivial changes where the closest local pattern is unclear, use
`victory-center-project-patterns` or perform equivalent bounded nearby
inspection before creating a new approach.

## Requirement Authority

Respect this order:

```text
user story / explicit user clarification
-> acceptance criteria
-> implementation plan
-> tasks
-> implementation
```

Implementation must not silently weaken an `AC-*`, remove an `AC-*`,
reinterpret product behavior for convenience, or treat a completed task list as
proof that the story is complete. If a lower-level artifact conflicts with the
original requirement, the higher-level requirement wins. Later explicit user
clarification wins over older planning artifacts.

## Task-Aware Implementation

For large stories with `tasks.md`, work in meaningful `T-*` units:

1. Confirm the task's referenced `AC-*` entries still exist.
2. Inspect declared dependencies before editing.
3. Inspect the closest relevant code before editing.
4. Keep task scope narrow.

Move a task checkbox to `[x]` only when the intended implementation unit exists,
the relevant behavior is minimally checked, and no known blocking issue remains
for that task. Do not mark `[x]` merely because files were edited.

When useful, add short task evidence such as files changed, targeted check run,
or result. Keep `tasks.md` concise; it should not become an activity log.

## Newly Discovered Work

Small, directly necessary work that clearly belongs to the current task may stay
inside that task. Materially separate work should become a new `T-*` task using
the next unused ID, mapped to relevant `AC-*` entries, with a short discovery
note when the reason is not obvious.

Reconsider the plan instead of silently expanding it when implementation
discovers materially larger scope, such as a new dependency, API contract
change, shared abstraction affecting unrelated areas, significantly more files
than expected, conflict with established project patterns, an invalid technical
direction, or one task splitting into several independent units.

Re-planning may update the technical plan or task decomposition, but it must not
weaken requirements.

Inspect the repository first when the issue may be resolved from existing
behavior. Ask the user only when a real product decision or requirement
clarification is required.

## Project Rules To Preserve

- Use `@/*` path aliases for source imports.
- Use TypeScript interfaces for component props and avoid `any`.
- Use i18next for user-facing text in public and admin UI.
- Use React Hook Form through `useFormManager` and Yup schemas for forms.
- Use `useAdminClient()` for authenticated admin API calls.
- Use existing public/admin API service shapes and pass cancellation signals
  where existing public fetch patterns do.
- Show loading, error, and toast feedback for user actions.
- Sanitize rendered HTML with the existing DOMPurify/normalization pattern.
- Prefer MUI and existing admin/common/public components before adding new UI.
- Use SASS modules or established Emotion/MUI styling patterns; avoid inline
  styles unless the surrounding code already requires them.

## Scope Control

- Avoid broad rewrites, file moves, dependency changes, and style churn.
- Do not create a new abstraction unless at least two real call sites benefit
  or the existing pattern already points to that abstraction.
- Keep components focused; split only when the current change would make the
  component meaningfully harder to test or review.
- Preserve existing naming, import order, exports, test placement, and format.
- Do not perform convergence inside implementation.
- Do not declare the whole story complete merely because all `T-*` tasks are
  checked.
- Do not turn implementation into PR review.
- Do not modify temporary artifacts unrelated to the current story.
- Do not clean up `.codex/work/<story-slug>/` automatically during
  implementation.

## Tests And Docs

Update tests when behavior changes, a bug fix needs regression coverage, a new
component/hook/service is added, or edge cases are easy to miss. Update locale
files with both Ukrainian and English keys when adding user-facing text. Update
docs only when behavior, setup, architecture, or agent workflow guidance changes.

## Final Report

Summarize:

- Files changed and why.
- Verification run, or why it was skipped.
- Any residual risk or follow-up that matters.

