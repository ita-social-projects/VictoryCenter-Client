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
3. **Generates two-level story structure**:
   - **Business Stories (BS)** - High-level stories for PO/stakeholders (non-technical)
   - **Technical Stories (TS)** - Detailed implementation tasks for developers
4. **Creates mapping document** - Links business stories to their technical implementation tasks
5. **Adds test cases** - Generates test scenarios for each story
6. **Ensures sprint-sized deliverables** - Each business story represents demonstrable value in one sprint
7. **Creates index/README** - Generates a master README with dependency graph and implementation sequence
8. **Validates structure** - Ensures stories follow project conventions and are implementable

## Output Structure
```
docs/[feature-name]/
├── README.md                           # Epic overview with dependency graph
├── MAPPING.md                          # Business → Technical story mapping
├── business-stories/
│   ├── BS01-[feature-name].md         # Business story 1
│   ├── BS02-[feature-name].md         # Business story 2
│   └── ...
└── technical-stories/
    ├── TS01-[implementation].md       # Technical story 1
    ├── TS02-[implementation].md       # Technical story 2
    └── ...
```

## Story Templates

### Business Story Template (for PO/Stakeholders)
- **Title**: BS##: [Feature Name]
- **User Story**: As a [user role], I want [goal], So that [business benefit]
- **Business Value**: Why this matters to users/business
- **Acceptance Criteria**: Non-technical, user-focused criteria
- **Demo Scenario**: What to show at sprint demo
- **Test Scenarios**: User acceptance test cases
- **Technical Stories**: References to TS## that implement this
- **Sprint Goal**: What value is delivered

### Technical Story Template (for Developers)
- **Title**: TS##: [Implementation Task]
- **Implements**: BS## (reference to business story)
- **Technical Goal**: What needs to be built
- **Acceptance Criteria**: Technical, testable requirements
- **Implementation Details**: File paths, code snippets, architecture
- **Files to Create/Modify**: Explicit list of file paths
- **Dependencies**: References to prerequisite technical stories
- **Estimated Effort**: Hours estimate
- **Test Cases**: Unit/integration test scenarios
- **Technical Notes**: Patterns, risks, performance considerations
- **Definition of Done**: Technical completion checklist

## Conventions
- **Business stories** are numbered BS01, BS02, ... (one per sprint-sized deliverable)
- **Technical stories** are numbered TS01, TS02, ... (4-25 hours each)
- Each business story maps to 1-5 technical stories
- Dependencies are tracked explicitly at both levels
- **Sprint-sized deliverables**: Each BS represents demonstrable value in one sprint
- **Granular technical tasks**: Break large components into smaller, testable pieces
- **Test cases included**: Every story has acceptance test scenarios
- Shared/foundation components come first
- Each story is independently reviewable
- Business stories use non-technical language
- Technical stories include implementation details

## Examples

### Example 1: Hippotherapy Title Section (Vertical Slice)
**Input**: Epic with 11 sections to build

**Business Story**:
- BS01: Title Section Content Management (8 hours to demo)

**Technical Stories** (mapped to BS01):
- TS01: Foundation types for title section (4h)
- TS02: Title section component with validation (8h)
- TS03: Image upload for title section (6h)
- TS04: Title section API integration (4h)
- TS05: Title section test coverage (3h)

**Sprint Demo**: Admin can fully manage title section content (heading, description, image) in Ukrainian

### Example 2: Multi-Section Feature
**Input**: Epic about building a form system

**Business Stories**:
- BS01: Basic Text Input Management (12 hours)
- BS02: Image Upload Management (10 hours)
- BS03: Form Publishing Workflow (8 hours)

**Technical Stories**:
- TS01-TS03: Foundation, validation, utilities (BS01)
- TS04-TS06: Text components, character counter (BS01)
- TS07-TS09: Image cropper, upload, validation (BS02)
- TS10-TS12: Publish button, state management (BS03)

### Example 3: Vertical Slice by Feature
**Input**: Epic about CRUD feature

**Business Stories**:
- BS01: View Existing Data (Sprint 1 - 15h)
- BS02: Create New Records (Sprint 2 - 18h)
- BS03: Edit Existing Records (Sprint 3 - 16h)
- BS04: Delete Records (Sprint 4 - 12h)

**Technical Stories**: Each BS has 3-5 TS covering backend + frontend + tests

## Best Practices
- **Sprint-sized business stories**: Each BS is demonstrable value in one sprint (8-25 hours total)
- **Granular technical stories**: Break down large components (e.g., 11 sections → 11 separate BS)
- **Vertical slices**: Each BS should deliver end-to-end functionality for one feature/section
- **Clear mapping**: MAPPING.md shows PO what technical work supports each business goal
- **Test cases everywhere**: Business acceptance tests + technical unit/integration tests
- **Two audiences**: Business stories for PO/stakeholders, technical stories for developers
- **Clear dependencies**: Make dependency chains explicit at both levels
- **Parallelization**: Identify stories that can be built concurrently
- **Risk flagging**: Call out technical risks and mitigation strategies

### Granularity Guidelines
❌ **Too Large**: BS01: All 11 Sections (200+ hours, can't demo in one sprint)
✅ **Just Right**: BS01: Title Section, BS02: Testimonials Section, ... (8-25h each, demo per sprint)

❌ **Too Large**: TS08: All Section Components (25 hours in one story)
✅ **Just Right**: TS08: Title Section Component (4h), TS09: Testimonials Component (4h), ...

## Agent Instructions
When this skill is invoked:

1. **Parse the epic document**:
   - Extract the overall goal and scope
   - Identify major phases or components
   - Note any existing structure (phases, sections, requirements)
   - Collect effort estimates if present

2. **Identify vertical slices** (Business Stories):
   - Look for end-to-end features that deliver user value
   - Each slice should be demonstrable in one sprint (8-25 total hours)
   - Break large features into smaller sections (e.g., 11 sections → 11 BS)
   - Prioritize complete workflows over horizontal layers
   - Example: "Title Section Management" not "All Image Uploads"

3. **Split technical implementation** (Technical Stories):
   - For each business story, identify 1-5 technical tasks
   - Each technical story should be 4-8 hours (small), 8-15 hours (medium), or 15-25 hours (large)
   - Break down large components into granular, testable pieces
   - Example: Instead of "TS08: All Section Components (25h)", create "TS08: Title Component (4h), TS09: Testimonials Component (4h)"
   - Foundation stories (types, utilities) come first and support multiple BS

4. **Generate business stories** (BS##-name.md):
   - Use non-technical language for PO/stakeholders
   - Focus on user value and business benefit
   - Include demo scenario (what to show at sprint review)
   - Add user acceptance test scenarios
   - Reference which technical stories implement this
   - Estimate total sprint effort (sum of related TS)

5. **Generate technical stories** (TS##-name.md):
   - Use technical language for developers
   - Reference which business story this supports
   - Include implementation details, file paths, code snippets
   - Add unit/integration test cases
   - Specify dependencies on other technical stories
   - Include Definition of Done checklist

6. **Create MAPPING.md document**:
   - Show which technical stories implement each business story
   - Visual representation (table or diagram)
   - Help PO understand technical scope
   - Help developers see business context
   - Example format:
     ```
     BS01: Title Section Management
     └── TS01: Foundation types (4h)
     └── TS08: Title component (4h)
     └── TS15: Image upload for title (6h)
     └── TS22: Title API integration (4h)
     └── TS29: Title tests (3h)
     Total: 21 hours
     ```

7. **Add test cases to every story**:
   - Business stories: User acceptance test scenarios
   - Technical stories: Unit/integration test cases
   - Make tests specific and actionable
   - Include expected results

8. **Create dependency graphs**:
   - Business story dependencies (which BS must complete first)
   - Technical story dependencies (which TS blocks others)
   - Identify critical path
   - Flag opportunities for parallel work

9. **Generate README/index**:
   - Epic overview and context
   - List all business stories with sprint assignment
   - List all technical stories grouped by BS
   - Dependency graphs (both levels)
   - Implementation sequence (sprint planning)
   - Team allocation suggestions
   - Risk summary
   - Definition of Done checklist

10. **Validate structure**:
    - Each business story fits in one sprint (8-25h total)
    - Technical stories are granular (4-25h each)
    - No story is too large to demo/test
    - All stories are testable and completable
    - Check for circular dependencies
    - Verify effort estimates are reasonable
    - Confirm file paths use project conventions

11. **Output organization**:
    - Create `docs/[feature-name]/` directory
    - Create `business-stories/` subdirectory with BS##-name.md files
    - Create `technical-stories/` subdirectory with TS##-name.md files
    - Create MAPPING.md at root level
    - Create README.md with full context
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
