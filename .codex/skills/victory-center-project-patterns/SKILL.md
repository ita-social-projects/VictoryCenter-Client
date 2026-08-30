---
name: victory-center-project-patterns
description: Find the closest existing Victory Center implementation pattern and related files for a requested feature, component, form, API flow, hook, validation rule, localization flow, test pattern, or similar task.
---

# Victory Center Project Patterns

Use this skill when Codex needs repository evidence for how Victory Center
already implements something similar. It supports planning, implementation,
convergence, and review, but it is not a mandatory stage for tiny edits when
the relevant pattern is already obvious from nearby files.

## Responsibility

Answer the question: "How does Victory Center already implement something like
this?"

Find the closest canonical implementation pattern and directly related files.
Prefer repository evidence over generic React or TypeScript advice.

## When To Use

Use this skill when:

- Planning a non-trivial feature.
- Implementation needs an existing example before creating a new approach.
- Repository structure is unfamiliar.
- Deciding whether a reusable component, hook, service, mapper, or abstraction
  already exists.
- Convergence needs supporting evidence for expected project behavior.
- Review needs to understand whether code departed from an established pattern.

Do not require it when the immediate files already make the pattern clear.

## Search Strategy

Use bounded repository inspection:

1. Start with direct names and domain terms from the request.
2. Find the closest domain or feature matches.
3. Inspect the strongest 1-3 candidate implementations.
4. Follow only direct supporting files relevant to the pattern.
5. Stop when there is enough evidence to identify the established approach.

Do not scan every component, API service, test, or locale file unless the user
explicitly asks for an exhaustive inventory.

## Related Files To Consider

Include only layers that matter to the request:

- Component or page.
- Hook or context.
- API service.
- Type or interface.
- Validation schema.
- Constants.
- Localization files.
- Styles.
- Tests or mocks.

For a form feature, usually inspect the form component, `useFormManager` usage,
validation, types, API mapping, locale keys, and tests. For a public fetch flow,
usually inspect the page/component, `useDataFetch`, API service, cancellation,
loading/error/empty handling, and tests. For an admin API flow, usually inspect
the caller, `useAdminClient()`, service method, request/response types,
error/user feedback, and tests.

These are discovery heuristics, not mandatory checklists.

## Choosing The Canonical Pattern

Do not blindly pick the first match. Prefer examples that are:

- Actively used.
- Structurally close to the requested work.
- Consistent with `AGENTS.md`.
- Repeated elsewhere in the repository.
- Reasonably current relative to surrounding code.

If existing implementations conflict, report the conflict concisely and prefer
the pattern best supported by current project conventions. Do not silently
invent a new standard.

## Output Contract

For a concrete question, return a concise result shaped like:

```markdown
### Closest existing pattern

- `src/.../Example.tsx` - why this is the closest match.

### Related implementation

- Type: `src/types/...`
- API: `src/services/api/...`
- Validation: `src/validation/...`
- Constants: `src/const/...`
- Locale keys: `src/locales/uk/...`, `src/locales/en/...`
- Styles/tests: relevant files only.

### Pattern to preserve

- Repository-specific rules demonstrated by the evidence.

### Differences / cautions

- Meaningful differences between the reference and requested change.
```

If no good pattern exists, say so clearly. Then identify the closest partial
references and the project conventions that still constrain a new
implementation.

## Discovery And Requirements

Project patterns provide technical evidence. They do not determine product
requirements and do not override this authority order:

```text
user story / explicit user clarification
-> acceptance criteria
-> implementation plan
-> tasks
-> implementation
```

Repository behavior may resolve technical questions such as which API client
pattern is standard, where validation lives, or how locale keys are structured.
It must not become a new product requirement unless the story or `AC-*` requires
it.

## Boundaries

This skill must not:

- Modify application files.
- Refactor code.
- Create new abstractions.
- Alter requirements.
- Update `AC-*` or `T-*`.
- Run convergence.
- Perform PR review.
- Generate temporary work artifacts merely for discovery.
- Run broad test, lint, build, typecheck, or coverage commands.
