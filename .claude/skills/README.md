# Victory Center Claude Skills

This directory contains custom Claude Code skills for the Victory Center project.

## Available Skills

### 1. `/victory-center-docs`
**Purpose**: Search and retrieve documentation about the Victory Center project.

**Use when**:
- You need to understand project architecture
- Looking for coding conventions
- Want to know tech stack details
- Need setup instructions

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

## How Skills Work

1. **Auto-loading**: Claude may automatically load a skill when it's relevant to your conversation
2. **Manual invocation**: Use `/skill-name` to explicitly invoke a skill
3. **Context-aware**: Skills have access to project-specific knowledge and patterns

## Skill Structure

Each skill is defined in a `.md` file with:
- **YAML frontmatter**: Metadata (name, description, invocation rules, allowed tools)
- **Markdown content**: Instructions for Claude on how to use the skill

## Installation

These skills are **project-specific** and located in `.claude/skills/` in the project root.

To make them **globally available** (across all projects):
1. Copy this entire directory to `~/.claude/skills/victory-center/`
2. Claude Code will automatically discover them

## Maintenance

Update skills when:
- Project structure changes significantly
- New major features are added
- Coding conventions evolve
- Tech stack is upgraded

## Best Practices

- Use skills for complex, multi-step queries
- Skills provide more context-aware responses than general prompts
- Combine skills with direct questions for best results
- Skills respect tool restrictions for focused behavior

---

**Created**: 2026-02-07
**Project**: Victory Center
**Claude Code Version**: 2.1.3+
