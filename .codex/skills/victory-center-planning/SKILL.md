---
name: victory-center-planning
description: Plan technical implementation for Victory Center requirements by mapping accepted ACs to affected areas, likely files, order, risks, and verification expectations.
---

# Victory Center Planning

Use this skill for medium and large Victory Center work after the request is
understood. Planning should be implementation-oriented, but it should not become
a line-by-line coding script.

## Responsibility

Convert accepted requirements into a practical technical strategy. Read
`AGENTS.md` for project conventions and inspect existing repository patterns
before proposing new abstractions. Use `victory-center-project-patterns` when
the closest existing implementation pattern is not already clear.

## Inputs

- Original story/request.
- Story analysis and `AC-*` acceptance criteria when available.
- Relevant repository context.
- Existing project conventions from `AGENTS.md`.

## Workflow

1. Confirm the acceptance criteria or the effective requirements being planned.
2. Inspect the closest existing implementation pattern before proposing the
   approach.
3. Define the implementation approach and affected project areas.
4. Identify likely files or file groups, keeping paths approximate when exact
   files still require implementation-time discovery.
5. Map `AC-*` items to implementation areas.
6. Describe dependencies or ordering between major steps.
7. Define the expected test strategy and verification expectations before
   coding.
8. Record risks, scope boundaries, and re-plan triggers.
9. For large or resumable stories, optionally write durable planning output to
   `.codex/work/<story-slug>/plan.md`.

## Scope Expansion Rule

Reconsider the plan instead of silently expanding it when implementation later
discovers materially larger scope, such as:

- Unexpected API contract changes.
- A new dependency.
- A shared abstraction affecting unrelated features.
- Substantially more files or areas than expected.
- A new independent implementation unit.

## Output Contract

Return or record:

- Implementation approach.
- Affected project areas and likely files/file groups.
- AC-to-area mapping.
- Major step order and dependencies.
- Test strategy and verification expectations.
- Risks and scope boundaries.
- Re-plan triggers.

## Boundaries

This skill must not:

- Modify application code.
- Weaken or reinterpret acceptance criteria.
- Generate microscopic tasks.
- Perform implementation.
- Perform convergence, verification, or PR review.
