# Victory Center GitHub Copilot Agent Skills

This directory contains Agent Skills for GitHub Copilot to help with the Victory Center project.

## What are Agent Skills?

Agent Skills are specialized capabilities that GitHub Copilot can load when relevant to perform specific tasks. They contain instructions, code examples, and resources that help Copilot understand project-specific patterns and workflows.

## Available Skills

### 6. `/victory-center-pr-review`
**Purpose**: Full PR review workflow — analyze changed files, fix issues, run typecheck/lint, manage tests and code smells.

**Use when**:
- Reviewing a branch before raising a PR
- Addressing code review feedback
- Checking for code smells, render-safety bugs, or test gaps
- Running the complete quality gate (lint → tests → coverage)

**Examples**:
```
/victory-center-pr-review main
/victory-center-pr-review release/1.0.0
/victory-center-pr-review issue-123
```

---

### 1. `/victory-center-docs`
**Purpose**: Search and retrieve documentation about the Victory Center project.

**Use when**:
- Understanding project architecture
- Looking for coding conventions
- Wanting to know tech stack details
- Needing setup instructions

**Examples**:
```
/victory-center-docs how do I authenticate?
/victory-center-docs what's the tech stack?
/victory-center-docs how to create a new admin page?
```

---

### 2. `/victory-center-structure`
**Purpose**: Navigate and explore the codebase structure, find files by pattern.

**Use when**:
- Finding specific components or files
- Understanding directory organization
- Locating related files (component + test + styles)
- Exploring feature implementations

**Examples**:
```
/victory-center-structure find all program components
/victory-center-structure where are the admin forms?
/victory-center-structure show me the FAQ page structure
/victory-center-structure find rich text editor plugins
```

---

### 3. `/victory-center-api`
**Purpose**: Help with API endpoints, services, authentication, and data fetching.

**Use when**:
- Understanding API endpoint structure
- Learning authentication patterns
- Implementing data fetching
- Adding new API services

**Examples**:
```
/victory-center-api how to call admin programs endpoint?
/victory-center-api show me authentication pattern
/victory-center-api how to add a new API service?
/victory-center-api what endpoints are available for FAQ?
```

---

### 4. `/victory-center-components`
**Purpose**: Find and understand components, create new components following patterns.

**Use when**:
- Looking for existing components
- Understanding component structure
- Creating new components
- Finding reusable UI elements

**Examples**:
```
/victory-center-components show me the rich text editor
/victory-center-components how to create a new admin form component?
/victory-center-components find all modal components
/victory-center-components what input components are available?
```

---

### 5. `/victory-center-forms`
**Purpose**: Work with forms, validation schemas, React Hook Form patterns.

**Use when**:
- Creating new forms
- Understanding validation
- Handling multilingual form fields
- Using form input components

**Examples**:
```
/victory-center-forms how to create a new form with validation?
/victory-center-forms show me program form validation
/victory-center-forms how to handle multilingual fields?
/victory-center-forms what validation schemas exist?
```

---

## How Agent Skills Work

1. **Auto-loading**: Copilot may automatically load a skill when it's relevant to your conversation
2. **Manual invocation**: Use `/skill-name` to explicitly invoke a skill
3. **Context-aware**: Skills have access to project-specific knowledge and patterns

## Skill Structure

Each skill is defined in a `.md` file with:
- **YAML frontmatter**: Metadata (name, description, invocation rules, allowed tools)
- **Markdown content**: Instructions for Copilot on how to use the skill

## Compatibility

These Agent Skills use the **open standard** format, which means:
- ✅ Works with GitHub Copilot in VS Code
- ✅ Works with GitHub Copilot CLI
- ✅ Works with GitHub Copilot coding agent
- ✅ Also compatible with Claude Code (skills in `.claude/skills/`)

## Installation

**Current Location**: `.github/skills/` (project-specific, automatically discovered)

**Global Installation** (optional):
Copy this directory to `~/.copilot/skills/victory-center/` to use across all projects.

## Difference from Custom Instructions

**Custom Instructions** (`.github/copilot-instructions.md`):
- Always-on background guidance
- Project-wide coding standards
- General architecture notes

**Agent Skills** (this directory):
- Loaded on-demand when relevant
- Specialized capabilities for specific tasks
- Can include code examples and detailed workflows

## Maintenance

Update skills when:
- Project structure changes significantly
- New major features are added
- Coding conventions evolve
- Tech stack is upgraded

## Best Practices

- Use skills for complex, multi-step queries
- Skills provide more context-aware responses than general prompts
- Combine skills with Copilot's built-in slash commands:
  - `/explain` - Explain code
  - `/fix` - Suggest fixes
  - `/tests` - Generate tests
  - `/doc` - Add documentation
  - `/optimize` - Improve performance

---

**Created**: 2026-02-07
**Project**: Victory Center
**Copilot Version**: VS Code 1.108+ (December 2025)
**Status**: Experimental feature

## Additional Resources

- [GitHub Copilot Agent Skills Documentation](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Use Agent Skills in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Awesome Copilot Skills Collection](https://github.com/github/awesome-copilot)
