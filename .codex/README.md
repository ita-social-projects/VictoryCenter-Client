# Victory Center Codex Instructions

This directory contains Codex-specific guidance for the Victory Center frontend.
It complements the shared `AGENTS.md` instructions and does not replace the
Claude or Copilot instructions in `.claude/`, `.github/`, or `CLAUDE.md`.

## Structure

- `config.toml` - project-scoped Codex settings and review guidance.
- `rules/default.rules` - conservative command approval rules for this repo.
- `skills/` - Codex skills written in the OpenAI `SKILL.md` format.
- `work/` - optional temporary runtime artifacts for large or resumable Codex
  work.

OpenAI Codex skills use a directory with a required `SKILL.md` file containing
`name` and `description` front matter. Rules use Codex `.rules` files under a
`rules/` directory in a trusted `.codex/` project layer.

## How Codex Should Use This Repo

1. Start with `AGENTS.md`, then load a focused skill only when the task matches.
2. Inspect nearby implementations before editing.
3. Keep changes small, scoped, and consistent with existing React, TypeScript,
   MUI, SASS module, i18n, form, and API patterns.
4. Prefer targeted tests and lint/build checks related to the touched code.
5. Do not edit `.claude/`, `.github/`, or `CLAUDE.md` unless the user explicitly
   asks for those files.

## Skills

- `victory-center-project-patterns` - read-only discovery for the closest
  existing implementation pattern and directly related files.
- `victory-center-story-analysis` - turns a non-trivial story/request into
  stable acceptance criteria, assumptions, ambiguities, constraints, edge cases,
  and out-of-scope boundaries before planning.
- `victory-center-planning` - converts accepted requirements into an
  implementation-oriented plan with affected areas, AC mapping, risks, and
  verification expectations.
- `victory-center-task-decomposition` - breaks large-story plans into stable
  `T-*` implementation tasks linked to acceptance criteria.
- `victory-center-implementation` - implementation workflow for focused code
  changes in this React/TypeScript application. For large stories it may consume
  optional story, analysis, plan, and task artifacts.
- `victory-center-convergence` - read-only requirement completeness check that
  reports only unresolved `MISSING`, `PARTIAL`, or `INCORRECT` story gaps.
- `victory-center-verification` - proportionate evidence-gathering workflow for
  targeted tests, typecheck, lint, build, or skipped-check reporting.
- `victory-center-pr-review` - lightweight PR/diff review workflow focused on
  correctness, regressions, risk, and missed tests.

## Planning Workflow

Use the planning workflow only when it earns its cost.
`victory-center-project-patterns` is a supporting discovery skill, not a
mandatory artifact-producing phase.

- Small task: request -> nearby inspection/project-patterns when needed ->
  implementation -> proportionate verification. Planning artifacts are usually
  unnecessary.
- Medium feature: request -> story analysis when useful -> project-patterns ->
  planning -> implementation -> verification.
- Large story: story -> story analysis -> project-patterns -> planning -> task
  decomposition -> implementation by `T-*` units -> convergence -> resolve gaps
  -> verification -> optional PR review.

The requirement authority order is:

```text
user story / explicit user clarification
-> acceptance criteria
-> implementation plan
-> tasks
-> implementation
```

Lower layers may clarify or decompose higher layers, but they must not silently
remove requirements, weaken requirements, change product behavior, or mark work
out of scope without support from the original request or explicit user
clarification.

Completing every `T-*` task does not prove story completeness. Convergence
checks whether the implementation satisfies the original story and `AC-*`
requirements. Verification checks what evidence demonstrates that the
implementation works. PR review remains a separate quality/risk pass for
correctness, regressions, maintainability, security, accessibility, and test
gaps.

## Stage Responsibilities

- Story analysis: define what the request requires and produce `AC-*` outcomes.
- Project patterns: find repository evidence for how similar work is already
  implemented.
- Planning: define how accepted requirements should be implemented.
- Task decomposition: split large plans into stable `T-*` implementation units.
- Implementation: make the changes and update active task state when used.
- Convergence: re-check the implementation against the original story and
  report only unresolved requirement gaps.
- Verification: gather proportionate evidence that the implementation works.
- PR review: assess final quality and risk when requested.

## Temporary Work Artifacts

For large or resumable stories, Codex may create a runtime directory:

```text
.codex/work/<story-slug>/
```

Potential artifacts:

- `story.md` - original story/request text or a faithful working copy, explicit
  user clarifications, and important supplied issue/requirement references.
- `analysis.md` - acceptance criteria such as `AC-1`, assumptions, ambiguities,
  constraints, edge cases, and out-of-scope boundaries.
- `plan.md` - implementation approach, affected areas, AC-to-area mapping,
  ordering, risks, scope boundaries, re-plan triggers, and verification
  expectations.
- `tasks.md` - stable large-story task checklist using `T-001`, `T-002`, and so
  on.
- Later workflow stages may add `convergence.md` for unresolved story gaps and
  `verification.md` for concise verification evidence.

Lifecycle principles:

- Create artifacts only when work is large or complex enough to benefit from
  durable state or resumability.
- Update artifacts as analysis, planning, and task decomposition legitimately
  evolve.
- Resume later work by reading the relevant story directory first.
- Reconcile resumed artifacts with current `git status`, relevant diffs, and
  current code before treating technical assumptions as current.
- Treat temporary artifacts as working memory; they never override the original
  user request or explicit clarification.
- Do not rewrite the story into an easier version and then treat that rewrite as
  authoritative.
- Cleanup must target only agent-created work artifacts for that story. Do not
  use broad destructive cleanup, and do not delete incomplete work merely
  because one implementation session ended.
- Implementation does not delete work artifacts automatically. Incomplete work
  remains resumable; cleanup is a later lifecycle/rules concern.

