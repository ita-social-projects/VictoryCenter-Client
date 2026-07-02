---
name: victory-center-pr-review
description: Review Victory Center branches, PR diffs, or local changes. Use for code review, implementation analysis, risk assessment, regression hunting, duplicate logic checks, and missed test identification.
---

# Victory Center PR Review

Use this skill when Codex is asked to review a PR, branch, diff, or local change
set. The goal is high-signal findings, not a rewrite.

## Review Setup

1. Read `AGENTS.md` for shared rules.
2. Determine the comparison base from the user request. If none is given, inspect
   the current branch and use a reasonable base such as `main` only when it is
   locally available.
3. List changed files and commits, then read the changed files in full enough to
   understand behavior.
4. Inspect nearby unchanged code when it affects the reviewed behavior.
5. Do not modify files during review unless the user asks for fixes.

Useful commands:

```bash
git status --short
git diff --name-only <base>...HEAD
git diff <base>...HEAD -- <path>
git log --oneline <base>..HEAD
```

## What To Look For

Prioritize issues that can break users or slow maintainers:

- React correctness: hook rule violations, stale closures, missing effect
  cleanup, unstable dependencies, render-time mutation, bad keys in dynamic lists.
- TypeScript correctness: `any`, unsafe casts, overly broad props, missing null
  handling, mismatched API shapes.
- Project architecture drift: raw admin axios calls instead of `adminClient`,
  bypassed `useFormManager`, missing Yup validation, relative source imports,
  hardcoded text, missing locale entries, duplicated constants or mappers.
- API/data fetching risks: missing cancellation for public fetches, missing
  error handling, broken loading states, wrong auth boundary.
- Security: unsanitized HTML, unsafe user-provided URLs, exposed secrets, token
  handling changes.
- Accessibility: unlabeled form inputs, non-keyboard interactive elements,
  broken modal/focus behavior, image alt regressions.
- Test gaps: changed behavior without regression tests, missing edge cases for
  empty/null/error/loading states, brittle translated-text assertions.
- Unnecessary changes: formatting churn, unrelated files, broad refactors,
  duplicate logic, or new abstractions that do not pay for themselves.

## Severity

- Critical: likely runtime break, data loss, auth/security issue, or major user
  regression.
- High: incorrect behavior in a common flow, missed validation, broken API
  contract, or important test gap.
- Medium: maintainability issue likely to cause bugs, duplicated logic, fragile
  implementation, or accessibility regression.
- Low: minor issue worth fixing but not merge-blocking.

## Output Format

Lead with findings. For each finding include severity, file/line, the problem,
why it matters, and a concrete fix direction. Keep summaries brief and secondary.

If no issues are found, say that clearly and mention any verification limits,
such as tests not run or unavailable base branch.

Do not list style preferences as findings unless they create real risk in this
project.

