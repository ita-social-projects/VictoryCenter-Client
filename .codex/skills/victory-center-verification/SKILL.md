---
name: victory-center-verification
description: Gather proportionate evidence that a Victory Center implementation works, using targeted tests and checks without replacing convergence or PR review.
---

# Victory Center Verification

Use this skill after implementation, and after convergence for large stories
when convergence is part of the workflow. Verification asks what evidence
demonstrates that the implementation is correct and safe enough to finish.

## Responsibility

Gather proportionate evidence that the completed implementation works.
Verification is distinct from convergence:

- Convergence asks whether the whole story was implemented.
- Verification asks whether there is evidence that the implementation works.

## Inputs

When available, inspect:

- Original story and `AC-*` entries.
- Changed files.
- Plan verification strategy.
- `T-*` tasks.
- Convergence result.
- Relevant `package.json` scripts.
- Nearby existing tests.

If convergence still has unresolved gaps, verification may still run targeted
checks, but it must clearly state that story completeness remains unresolved.
Do not treat verification success as convergence success.

## Strategy

Prefer the narrowest useful evidence first:

1. Inspect the changed diff.
2. Run targeted relevant tests.
3. Run TypeScript check when source or types changed.
4. Run lint when appropriate.
5. Run broader tests, build, or coverage only when risk or scope justifies them.

Use existing repository commands and Codex command rules. Relevant commands may
include:

```bash
npx craco test --watchAll=false --forceExit --testPathPattern=...
npx tsc --noEmit
npm run lint
npm run build
npm run test:cover
```

Do not require every change to run every command.

## AC Evidence

When practical, map evidence back to `AC-*` entries internally and summarize it
concisely. Do not produce a large requirement matrix unless the user requests
one.

## Result States

Use these states:

- `PASS` - required checks passed and no known blocking verification issue
  remains.
- `PARTIAL` - some relevant checks passed but meaningful evidence is missing.
- `FAIL` - a relevant check failed or expected behavior is contradicted.
- `SKIPPED` - a check was intentionally not run, with a reason.

Report residual risk only when meaningful.

## Temporary Artifact

For large or resumable stories already using `.codex/work/<story-slug>/`,
verification may write `.codex/work/<story-slug>/verification.md`.

Keep it concise:

- Checks run.
- Result.
- Skipped checks and why.
- Residual risk if any.

Do not create this artifact for small work that does not otherwise use durable
work state.

## Boundaries

This skill must not:

- Redefine product requirements.
- Silently fix implementation.
- Perform broad refactors.
- Replace convergence.
- Replace PR review.
- Change coverage thresholds unless explicitly requested by the user.
- Run destructive commands.

If checks reveal an implementation issue, report it and return control to
implementation.
