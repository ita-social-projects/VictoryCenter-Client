# Epic Splitter

## Description
Analyzes an epic document (markdown file) and automatically splits it into a structured set of user stories. Each user story follows the project's conventions with acceptance criteria, technical details, dependencies, and estimates.

## When to Use
- When you have a large feature epic that needs to be broken down into implementable user stories
- When planning a new feature or major refactor that spans multiple phases
- When you need to create a sprint backlog from a high-level specification
- When converting technical specifications into developer-ready tasks

## Usage
```bash
/epic-splitter path/to/epic.md
```
or
```bash
/epic-splitter [epic-name]
```

## What It Does
1. **Reads the epic document** - Parses the markdown file to understand the scope, requirements, and structure
2. **Identifies logical boundaries** - Detects natural split points (phases, components, features, dependencies)
3. **Generates user stories** - Creates individual US files with:
   - User story format (As a... I want... So that...)
   - Acceptance criteria checklist
   - Technical implementation details
   - File paths and code snippets
   - Dependencies on other stories
   - Effort estimates
   - Testing requirements
   - Definition of Done
4. **Creates index/README** - Generates a master README with dependency graph and implementation sequence
5. **Validates structure** - Ensures stories follow project conventions and are implementable

## Output Structure
```
docs/[feature-name]/
├── README.md                    # Epic overview with dependency graph
├── US01-[name].md              # User story 1
├── US02-[name].md              # User story 2
├── US03-[name].md              # User story 3
└── ...
```

## User Story Template
Each generated story includes:
- **Title**: US##: [Descriptive Name]
- **User Story**: As a [role], I want [goal], So that [benefit]
- **Acceptance Criteria**: Checklist of testable requirements
- **Technical Details**: Implementation specifics, file paths, code examples
- **Files to Create/Modify**: Explicit list of file paths
- **Dependencies**: References to prerequisite stories
- **Estimated Effort**: Hours estimate
- **Technical Notes**: Architecture decisions, patterns, risks
- **Definition of Done**: Completion checklist

## Conventions
- Stories are numbered sequentially (US01, US02, ...)
- Dependencies are tracked explicitly (US03 depends on US01, US02)
- Effort estimates are in hours
- Stories should be completable in 4-25 hours each
- Complex phases are split into multiple stories
- Shared/foundation components come first
- Integration stories come last
- Each story is independently reviewable

## Examples

### Example 1: Component-based Split
Input: Epic about building a form system
Output:
- US01: Foundation types and validation
- US02: Text input component
- US03: Select input component
- US04: Form container component
- US05: Integration and testing

### Example 2: Phase-based Split
Input: Epic about feature with backend+frontend
Output:
- US01: API service layer
- US02: Data types and schemas
- US03: UI components
- US04: State management
- US05: Integration and routing

### Example 3: Vertical Slice Split
Input: Epic about end-to-end feature
Output:
- US01: Read-only display
- US02: Create functionality
- US03: Update functionality
- US04: Delete functionality
- US05: Permissions and validation

## Best Practices
- **Atomic stories**: Each story should deliver a testable increment
- **Clear dependencies**: Make dependency chains explicit and minimal
- **Parallelization**: Identify stories that can be built concurrently
- **Technical depth**: Include enough detail for implementation without over-specifying
- **Testing included**: Each story includes its own testing requirements
- **Risk flagging**: Call out technical risks and mitigation strategies

## Agent Instructions
When this skill is invoked:

1. **Parse the epic document**:
   - Extract the overall goal and scope
   - Identify major phases or components
   - Note any existing structure (phases, sections, requirements)
   - Collect effort estimates if present

2. **Identify split boundaries**:
   - Look for natural groupings (foundation → components → integration)
   - Identify shared/reusable pieces that should come first
   - Detect dependencies between pieces
   - Consider parallelization opportunities
   - Aim for stories in 4-25 hour range

3. **Generate user stories**:
   - Use the template structure above
   - Write clear "As a... I want... So that..." statements
   - Extract acceptance criteria from requirements
   - Include technical implementation details
   - Specify exact file paths to create/modify
   - Add code snippets where helpful
   - List dependencies explicitly
   - Estimate effort realistically
   - Include testing requirements

4. **Create dependency graph**:
   - Map out which stories depend on which
   - Identify critical path
   - Flag opportunities for parallel work
   - Suggest team allocation if multiple developers

5. **Generate README/index**:
   - Epic overview and context
   - List all stories with descriptions
   - Dependency graph (text/mermaid format)
   - Implementation sequence (sprint planning)
   - Team allocation suggestions
   - Risk summary
   - Definition of Done checklist

6. **Validate structure**:
   - Ensure all stories are testable and completable
   - Check for circular dependencies
   - Verify effort estimates are reasonable
   - Confirm file paths use project conventions
   - Validate against project CLAUDE.md patterns

7. **Output organization**:
   - Create a subdirectory in `docs/` for the epic
   - Generate all US files with consistent naming (US01, US02, ...)
   - Create the README with full context
   - Use markdown formatting for readability

## Notes
- The skill analyzes the project structure (CLAUDE.md, existing patterns) to ensure generated stories follow conventions
- If the epic is too large (>150 hours), suggest further decomposition or phasing
- If the epic lacks detail, ask clarifying questions before generating stories
- Stories should be implementable by a developer without additional context beyond CLAUDE.md
- Include enough detail in each story to start coding immediately
- Reference existing patterns in the codebase when applicable

## Related Skills
- `/codebase-scout` - Analyze codebase before splitting to understand patterns
- `/design-to-code-scout` - Extract requirements from design files
- `/handoff-pack-writer` - Create implementation guides from stories
