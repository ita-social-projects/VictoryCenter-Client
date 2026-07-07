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
3. Inspect the closest existing examples before coding:
   - Components: `src/components/`, `src/pages/`
   - Hooks: `src/hooks/`
   - API services: `src/services/api/`
   - Types: `src/types/`
   - Validation: `src/validation/`
   - Locale strings: `src/locales/uk/`, `src/locales/en/`
   - Tests and mocks near the changed file
4. Identify the minimal set of files required for the request.
5. Edit only those files. Do not touch `.claude/`, `.github/`, or `CLAUDE.md`
   unless explicitly requested.
6. Run the narrowest useful verification. Prefer targeted tests first, then
   broader lint/build checks when risk or scope justifies them.

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

