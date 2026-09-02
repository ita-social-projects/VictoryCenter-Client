---
name: victory-center-pr-review
description: Review Victory Center PRs, branches, diffs, or local changes for concrete correctness, regression, security, accessibility, architecture, and test risks. Read-only by default.
---

# Victory Center PR Review

Use this skill when Codex is asked to review a PR, branch, diff, or local change set. The primary question is: "What concrete issues in this PR/diff could break behavior, violate important project contracts, introduce regressions, or create meaningful maintenance risk?"

Review is read-only by default: review first, findings first, no automatic fixes, and no automatic commits. If the user explicitly asks to fix findings, handle that as a separate follow-up implementation workflow.

## Review Setup

1. Read `AGENTS.md` for shared project rules.
2. Determine the comparison base from the user request.
3. If no base is provided, inspect the current branch and use a reasonable local base such as `main` only when it is actually available. Do not invent unavailable remote state.
4. Inspect `git status --short`, changed files, relevant commits, and changed diff.
5. Read changed files with enough surrounding context to understand behavior. Do not review only isolated hunks when full-file context is needed.
6. Inspect nearby unchanged code when it affects the changed path.
7. Use `victory-center-project-patterns` when a finding depends on whether the change follows an established repository pattern.

Useful commands:

```bash
git status --short
git branch --show-current
git diff --name-only <base>...HEAD
git diff <base>...HEAD -- <path>
git log --oneline <base>..HEAD
```

## Scope Discipline

Prioritize issues introduced or materially affected by the current change. Pre-existing issues should generally not be reported unless the change makes them newly reachable, makes them worse, materially affects correctness of changed behavior, or the user explicitly requested a broader audit.

If a relevant issue is clearly pre-existing, label it as pre-existing and keep it secondary. Do not turn PR review into whole-repository cleanup.

## What To Review

### Behavioral Correctness

Look for wrong business logic, missing branches, mismatched create/edit behavior, wrong state transitions, broken loading/error/empty behavior, incorrect null/undefined assumptions, wrong ordering/filtering/mapping, regressions from changed defaults, and dead or unreachable behavior introduced by the diff.

### React Correctness

Look for conditional or loop-level hook calls, stale closures, incomplete effect/callback dependencies, missing effect cleanup, async lifecycle issues, render-time mutation, unstable derived objects/arrays used as hook dependencies, unnecessary derived state, invalid list keys, and behavior that breaks under re-render or remount.

Do not report theoretical micro-optimizations unless they create a concrete bug risk.

### TypeScript Correctness

Look for new `any`, unsafe casts that hide real mismatches, overly broad prop/function types, incorrect optional/null assumptions, API response shape mismatches, enum/string mismatches, lost discriminated-union safety, incorrect generic usage, and types that permit invalid runtime states.

Do not report every cast. Report casts only when they materially hide risk or contradict the actual data shape.

### Victory Center Architecture And Patterns

Use repository evidence and `victory-center-project-patterns` when needed. Review for material departures from established patterns such as:

- Raw authenticated axios usage instead of the established admin-client path.
- Public fetch code bypassing the standard data-fetch or cancellation pattern.
- Raw React Hook Form usage where project convention requires `useFormManager`.
- Validation bypassing established Yup or project schema organization.
- Hardcoded user-facing strings instead of i18n.
- Missing locale counterpart.
- Wrong placement of constants, types, validation, or images.
- Relative source imports where `@/*` is the established convention.
- New UI abstractions duplicating existing reusable components.
- Duplicated mappers, constants, or helpers that already exist.
- Rich-text rendering bypassing established sanitization or normalization.

Do not report minor pattern differences unless they create real correctness or maintenance risk.

### API And Data Flow

Check request/response mapping, public request cancellation, auth client boundaries, missing or incorrect error handling, broken loading-state transitions, stale requests updating state, missing guards for absent IDs/data, wrong endpoint or payload shape, inconsistent create/update/delete flows, and optimistic behavior without rollback when required.

### Security

Check changed behavior for unsanitized HTML, unsafe user-provided URLs, `javascript:` or equivalent URL risks, exposed secrets or credentials, unsafe auth/token handling, unintended privileged API usage, dangerous data injection into HTML/URLs, and changes that weaken established sanitization.

Keep security findings concrete and evidence-based. Do not produce generic security warnings.

### Accessibility

Review changed UI for meaningful regressions: unlabeled controls, non-keyboard interactive elements, broken focus management, modal/dialog focus problems, missing meaningful alt text, inaccessible state indication, invalid heading structure introduced by the change, and clickable non-semantic containers without equivalent keyboard support.

Do not report subjective visual preferences as accessibility issues.

### Tests

Review whether changed behavior is actually tested. Look for:

- Bug fixes without regression tests.
- New behavior with only render-smoke coverage.
- Missing empty/null/error/loading cases when relevant.
- Tests that mock away the behavior they claim to test.
- Brittle translated-text assertions when better local patterns exist.
- Mocks that do not expose needed `jest.fn()` behavior.
- Assertions that pass without exercising meaningful behavior.
- Missing create/edit counterpart coverage.
- Changed API mapping without request/payload assertions.
- Changed conditional rendering without both sides tested.

Do not require every edge case for every change. Prioritize gaps that could allow the reviewed regression to reappear.

### Scope And Churn

Check for unrelated formatting churn, unrelated files, broad refactors mixed into feature work, unnecessary abstractions, duplicated logic, unjustified file moves, unjustified dependency changes, test rewrites that hide behavior changes, and generated or incidental noise.

Only report these when they meaningfully increase review risk or maintenance burden.

## Finding Standard

Every finding must be grounded in observable evidence. A finding should include severity, location, concrete problem, impact, evidence, and a concrete fix direction.

Preferred shape:

```text
[High] src/.../ProgramForm.tsx:84

Problem:
...

Impact:
...

Evidence:
...

Fix:
...
```

Reject speculative findings. Do not report vague performance concerns, generic best-practice advice, style preferences, theoretical maintainability concerns with no concrete consequence, or bugs unsupported by the code. When confidence is low, gather more repository evidence, run a narrow confirmation check when appropriate, or omit the finding.

## Severity

- Critical: security/auth vulnerability, data loss, guaranteed runtime break in an important flow, destructive behavior, or severe permission boundary failure.
- High: incorrect behavior in a common flow, broken API contract, major regression, required validation missing, incorrect create/edit behavior, or feature does not work as intended.
- Medium: plausible bug risk, fragile hook/state behavior, important accessibility regression, duplicated/shared logic likely to diverge, meaningful missing test for changed behavior, or established architecture pattern bypassed with concrete risk.
- Low: localized maintainability defect, minor test weakness, clarity issue with real maintenance cost, or non-blocking cleanup worth addressing.

Severity reflects impact and likelihood, not ease of fixing. Do not inflate severity to make findings look important.

## Relationship To Other Workflow Skills

PR review is not convergence. Convergence asks whether implementation satisfied the full original story. PR review asks what defects, regressions, risks, or maintainability problems are present in the change. If story/AC context is available, PR review may mention a requirement mismatch when it manifests as an actual defect, but it should not reproduce the convergence workflow.

PR review is not full verification. Prefer static/code-context review first. You may run narrowly targeted verification only when it materially increases confidence in a concrete finding and command policy permits it. Do not automatically run the full suite, coverage, lint, or build unless the user explicitly requested review plus verification or the review task itself requires that evidence.

If verification evidence already exists, inspect and use it. If relevant checks were not run, state that as a review limitation rather than assuming success.

## Coverage And Commits

Do not manage coverage thresholds as part of ordinary PR review. Report a finding if the diff lowers thresholds to make the branch pass, removes meaningful tests without justification, or materially weakens test coverage for changed behavior.

Do not manage commits during review. Do not regroup commits, commit fixes, enforce commit ordering, or create commit messages unless explicitly requested.

## Review Workflow

1. Establish base and review scope.
2. Inspect status, changed files, commits, and diff.
3. Read changed files in context.
4. Inspect nearby code and project patterns where needed.
5. Collect candidate findings.
6. Reject speculative, style-only, and unrelated pre-existing findings.
7. Classify severity by impact and likelihood.
8. Optionally confirm a concrete finding with narrow verification.
9. Output findings first.

Do not make fixes during this workflow.

## Output Format

Lead directly with findings ordered by severity: Critical, High, Medium, Low. Within the same severity, prioritize user impact and confidence.

For each finding include:

- Severity.
- File and line when available.
- Problem.
- Impact.
- Evidence.
- Fix direction.

If no actionable findings are found, say:

```text
No actionable review findings found.
```

Then briefly state review limits, such as base branch unavailable, tests not run, verification evidence unavailable, or only local diff reviewed.

Do not produce a large success checklist. Do not list passed review categories.

