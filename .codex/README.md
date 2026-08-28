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

- `victory-center-story-analysis` - turns a non-trivial story/request into
  stable acceptance criteria, assumptions, ambiguities, constraints, edge cases,
  and out-of-scope boundaries before planning.
- `victory-center-planning` - converts accepted requirements into an
  implementation-oriented plan with affected areas, AC mapping, risks, and
  verification expectations.
- `victory-center-task-decomposition` - breaks large-story plans into stable
  `T-*` implementation tasks linked to acceptance criteria.
- `victory-center-implementation` - implementation workflow for focused code
  changes in this React/TypeScript application.
- `victory-center-pr-review` - lightweight PR/diff review workflow focused on
  correctness, regressions, risk, and missed tests.

## Planning Workflow

Use the planning workflow only when it earns its cost:

- Small task: request -> implementation. Planning artifacts are usually
  unnecessary.
- Medium feature: request -> story analysis when useful -> planning ->
  implementation.
- Large story: story -> story analysis -> planning -> task decomposition ->
  implementation by `T-*` units. Later workflow stages may add convergence and
  verification artifacts, but those stages are not implemented here.

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

Lifecycle principles:

- Create artifacts only when work is large or complex enough to benefit from
  durable state or resumability.
- Update artifacts as analysis, planning, and task decomposition legitimately
  evolve.
- Resume later work by reading the relevant story directory first.
- Treat temporary artifacts as working memory; they never override the original
  user request or explicit clarification.
- Do not rewrite the story into an easier version and then treat that rewrite as
  authoritative.
- Cleanup must target only agent-created work artifacts for that story. Do not
  use broad destructive cleanup, and do not delete incomplete work merely
  because one implementation session ended.

