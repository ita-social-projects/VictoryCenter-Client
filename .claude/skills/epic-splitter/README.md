# Epic Splitter Skill

## Overview

The **Epic Splitter** skill automatically analyzes large feature epics and breaks them down into structured, implementable user stories. It's designed to accelerate sprint planning by converting high-level specifications into developer-ready tasks with clear dependencies and estimates.

## Usage

### Basic Invocation

```bash
/epic-splitter docs/MyFeature-Epic.md
```

### With Epic Name (will search for matching file)

```bash
/epic-splitter hippotherapy
```

## What It Does

1. **Reads** the epic document (markdown format)
2. **Analyzes** requirements, phases, and complexity
3. **Identifies** logical boundaries for splitting (components, layers, features)
4. **Generates** structured user stories (US01, US02, ...) with:
   - User story format (As a... I want... So that...)
   - Acceptance criteria checklist
   - Technical implementation details with file paths
   - Code snippets and examples
   - Dependencies on other stories
   - Realistic effort estimates
   - Testing requirements
   - Definition of Done
5. **Creates** a README with:
   - Epic overview
   - Dependency graph
   - Implementation sequence
   - Team allocation suggestions
   - Risk summary

## Output Structure

```
docs/[feature-name]/
├── README.md                      # Epic overview and planning doc
├── US01-foundation-types.md       # Foundation story
├── US02-utilities.md              # Utilities story
├── US03-api-services.md           # API story
├── US04-shared-components.md      # Shared components
├── US05-feature-components.md     # Feature-specific components
├── US06-integration.md            # Integration story
└── US07-testing.md                # Testing story
```

## Real Example

The Hippotherapy feature was split using this approach:

### Input
[Hippotherapy-Implementation-Plan.md](../../../docs/Hippotherapy-Implementation-Plan.md) - A 108-hour epic with 11 phases

### Output
[docs/hippotherapy/](../../../docs/hippotherapy/) folder containing:
- **README.md** - Epic overview with dependency graph, team allocation, risks
- **US01** - Foundation & Types (4 hours)
- **US02** - Utility Functions (3 hours)
- **US03** - API Services (6 hours)
- **US04** - Text Input Field (4 hours)
- **US05** - Image Upload Field (5 hours)
- **US06** - Shared Components (3 hours)
- **US07** - Scientific References (8 hours)
- **US08** - Section Components (25 hours)
- **US09** - Translation System (20 hours)
- **US10** - Main Page Integration (10 hours)
- **US11** - Routing & Localization (3 hours)
- **US12** - Testing (15 hours)

Total: 12 stories, 106 hours, clear dependencies, parallel work identified

## Story Structure

Each generated user story follows this template:

```markdown
# US##: [Story Name]

## User Story
**As a** [role]  
**I want** [goal]  
**So that** [benefit]

## Acceptance Criteria
- [ ] Testable criterion 1
- [ ] Testable criterion 2
- [ ] Testable criterion 3

## Technical Details

### Files to Create
- path/to/file1.ts
- path/to/file2.tsx
- path/to/file3.module.scss

### Implementation Approach
[Detailed description with code examples]

## Dependencies
- US01 (types)
- US02 (utilities)

## Estimated Effort
**X hours**

## Technical Notes
- Architecture decisions
- Risks and mitigation
- Performance considerations

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
```

## Splitting Strategy

### Story Sizing
- **Small**: 4-8 hours (single component, utility)
- **Medium**: 8-15 hours (complex component, service layer)
- **Large**: 15-25 hours (multiple components, integration)
- **Too Large**: >25 hours → split further

### Priority Order
1. **Foundation** - Types, interfaces, constants
2. **Utilities** - Helper functions, validators
3. **Services** - API layer, data fetching
4. **Shared Components** - Reusable UI components
5. **Feature Components** - Feature-specific implementations
6. **Integration** - Wiring, routing, state management
7. **Testing** - Comprehensive test coverage

### Parallelization
The skill identifies which stories can be built concurrently:
- Stories with no dependencies can start immediately
- Stories with the same dependencies can run in parallel
- Suggests team allocation for multi-developer work

## Benefits

### For Product Owners
- ✅ Clear visibility into implementation scope
- ✅ Realistic effort estimates for planning
- ✅ Understanding of dependencies and risks
- ✅ Ability to prioritize or descope stories

### For Developers
- ✅ Detailed implementation guidance
- ✅ Clear acceptance criteria
- ✅ Code examples and patterns to follow
- ✅ Known dependencies and prerequisites
- ✅ Testable, reviewable increments

### For Tech Leads
- ✅ Dependency graphs for critical path analysis
- ✅ Team allocation suggestions
- ✅ Risk identification and mitigation
- ✅ Consistency across feature work

## When to Use

✅ **Use this skill when:**
- Planning a new feature that spans multiple components
- Converting a technical specification into tasks
- Breaking down a large refactor into manageable chunks
- Creating sprint backlog from high-level requirements
- Onboarding developers to a complex feature

❌ **Don't use this skill when:**
- The work is already a single user story (<25 hours)
- The epic lacks sufficient detail (clarify first)
- The feature is exploratory (spike/POC)
- You just need to estimate without splitting

## Best Practices

### Before Running
1. **Ensure epic has enough detail** - Requirements, mockups, architecture decisions
2. **Review CLAUDE.md** - Make sure project conventions are documented
3. **Check for patterns** - Look at similar features for reference
4. **Clarify unknowns** - Resolve ambiguities in the spec first

### After Running
1. **Review dependencies** - Ensure they make sense
2. **Validate estimates** - Adjust if needed based on team velocity
3. **Identify risks** - Add mitigation for flagged risks
4. **Assign owners** - Use team allocation suggestions
5. **Update README** - Track progress as stories complete

## Customization

The skill adapts to different project types:

### Frontend-Heavy
- Splits by component hierarchy
- Separates UI from logic/hooks
- Plans for responsive design
- Includes visual testing

### Backend-Heavy
- Splits by layer (models → services → routes)
- Separates read from write operations
- Plans for database migrations
- Includes API contract docs

### Full-Stack
- Starts with API contract
- Builds backend first
- Then frontend components
- Finally integration testing
- Suggests mocking for parallel work

## Troubleshooting

### "Epic not found"
- Check the file path is correct
- Use relative path from project root
- Try searching by epic name without path

### "Stories too large"
- The epic may be too complex
- Consider breaking into multiple epics
- Review and manually split large stories

### "Missing technical details"
- The epic may lack implementation specifics
- Add more detail to the epic document
- Reference existing patterns in CLAUDE.md

### "Circular dependencies"
- Review the dependency graph
- Refactor to break cycles
- Consider extracting shared foundations

## Integration with Other Skills

- **`/codebase-scout`** - Analyze codebase patterns before splitting
- **`/design-to-code-scout`** - Extract requirements from Figma/designs
- **`/handoff-pack-writer`** - Create detailed guides from generated stories
- **`/poc-validator`** - Validate technical approach before splitting
- **`/refinement-validator`** - Ensure stories are ready for sprint

## Examples by Project Type

### React Component Library
```
US01: Foundation types and interfaces
US02: Theme system and design tokens
US03: Button component
US04: Input component
US05: Select component
US06: Storybook integration
US07: Testing and documentation
```

### REST API Feature
```
US01: Database schema and migrations
US02: Data models and validation
US03: Service layer (business logic)
US04: Controller endpoints
US05: API documentation
US06: Integration tests
```

### Admin Dashboard Feature
```
US01: Types and API services
US02: Shared form components
US03: Data table component
US04: CRUD pages
US05: Routing and navigation
US06: Permissions and guards
US07: Testing
```

## Contributing

To improve the epic-splitter skill:
1. Review generated stories and provide feedback
2. Suggest improvements to the template
3. Add examples for new project types
4. Update dependency analysis logic

---

**Version**: 1.0.0  
**Last Updated**: 2026-06-04  
**Maintainer**: Victory Center Team
