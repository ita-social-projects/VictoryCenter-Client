# Victory Center Codex Instructions

This directory contains Codex-specific guidance for the Victory Center frontend.
It complements the shared `AGENTS.md` instructions and does not replace the
Claude or Copilot instructions in `.claude/`, `.github/`, or `CLAUDE.md`.

## Structure

- `config.toml` - project-scoped Codex settings and review guidance.
- `rules/default.rules` - conservative command approval rules for this repo.
- `skills/` - Codex skills written in the OpenAI `SKILL.md` format.

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

- `victory-center-implementation` - implementation workflow for focused code
  changes in this React/TypeScript application.
- `victory-center-pr-review` - lightweight PR/diff review workflow focused on
  correctness, regressions, risk, and missed tests.

