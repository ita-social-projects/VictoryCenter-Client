---
name: victory-center-docs
description: Search and retrieve documentation about the Victory Center project (architecture, tech stack, patterns, conventions)
invoked-by: both
tools:
  - read
  - search
---

# Victory Center Documentation Skill

This skill helps you search and retrieve documentation about the Victory Center project.

## What This Skill Does

When invoked, this skill searches through the Victory Center documentation files (CLAUDE.md, AGENTS.md, README.md) to answer questions about:
- Project architecture and structure
- Technology stack and versions
- Coding patterns and conventions
- Common workflows
- Domain terminology
- Best practices

## How to Use

**User invocation**: `/victory-center-docs [question]`

**Examples**:
- `/victory-center-docs how do I authenticate?`
- `/victory-center-docs what's the tech stack?`
- `/victory-center-docs how to create a new admin page?`

## Instructions

When this skill is invoked:

1. **Read Documentation Files**:
   - Read `CLAUDE.md` for concise project overview
   - Read `AGENTS.md` for detailed coding guidelines
   - Read `README.md` for setup instructions
   - Read any relevant files mentioned in the question

2. **Search for Relevant Information**:
   - If the question is about architecture, focus on CLAUDE.md architecture sections
   - If about coding patterns, check AGENTS.md code examples
   - If about setup/installation, check README.md
   - If about specific features, search both CLAUDE.md and AGENTS.md

3. **Provide Clear Answer**:
   - Quote relevant sections from documentation
   - Include file paths with markdown links: `[filename](path/to/file)`
   - Provide code examples if available in docs
   - Suggest related documentation sections

4. **Offer Follow-up**:
   - If documentation is unclear, suggest reading specific source files
   - If information is missing, suggest where to look in the codebase

## Context

This is the Victory Center project:
- React 19 + TypeScript SPA
- Public website + Admin CMS
- Backend API: https://backend.victorycenter.online/api
- Multilingual (Ukrainian/English)
- JWT authentication for admin

## Output Format

```markdown
## [Question Summary]

### Answer

[Clear, concise answer with quotes from documentation]

### References

- [CLAUDE.md](CLAUDE.md) - [specific section]
- [AGENTS.md](AGENTS.md) - [specific section]

### Related

[Suggest related documentation sections or source files to explore]
```

## Notes

- Always cite which documentation file you're quoting from
- If documentation doesn't cover the question, suggest specific source files to examine
- Keep answers concise but comprehensive
- This skill works with GitHub Copilot's read and search capabilities
