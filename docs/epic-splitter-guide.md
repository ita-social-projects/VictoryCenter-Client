# Epic Splitter - Complete Guide

## Overview

The **Epic Splitter** is a specialized agent and skill that automatically breaks down large feature epics into structured, implementable user stories. It streamlines sprint planning by converting high-level specifications into developer-ready tasks with clear dependencies, estimates, and technical guidance.

---

## 🎯 What Problem Does It Solve?

### Before Epic Splitter
- ❌ Manual breakdown of epics takes hours
- ❌ Inconsistent story formats across features
- ❌ Missing dependencies cause blockers
- ❌ Unclear estimates make planning difficult
- ❌ Developers lack implementation guidance

### After Epic Splitter
- ✅ Automated splitting in minutes
- ✅ Consistent, detailed story format
- ✅ Clear dependency graphs
- ✅ Realistic effort estimates
- ✅ Complete technical implementation details

---

## 🚀 Quick Start

### 1. Create Your Epic
Create a markdown file in `docs/` with your feature specification:

```markdown
# My Feature Name

## Overview
High-level description of the feature...

## Requirements
- Requirement 1
- Requirement 2
...

## Technical Approach
- Architecture decisions
- Tech stack
- Integration points
...

## Estimated Effort
~X hours
```

### 2. Run the Skill
```bash
/epic-splitter docs/MyFeature-Epic.md
```

### 3. Get Structured Stories
The tool generates:
```
docs/my-feature/
├── README.md              # Epic overview, dependency graph, planning
├── US01-foundation.md     # First user story
├── US02-utilities.md      # Second user story
├── US03-api-services.md   # Third user story
└── ...
```

---

## 📋 What Gets Generated

### 1. README.md (Epic Index)
- **Epic Overview**: Context and goals
- **Total Effort**: Sum of all story estimates
- **User Stories Index**: List of all stories with descriptions
- **Dependency Graph**: Visual representation of dependencies
- **Implementation Sequence**: Sprint planning timeline
- **Team Allocation**: Suggestions for parallel work
- **Risks & Mitigation**: Technical risks and solutions
- **Progress Tracking**: Checklist for completion

### 2. User Story Files (US##-name.md)
Each story includes:

```markdown
# US##: Story Title

## User Story
**As a** [role]
**I want** [goal]
**So that** [benefit]

## Acceptance Criteria
- [ ] Testable criterion 1
- [ ] Testable criterion 2

## Technical Details
### Files to Create
- path/to/file1.ts
- path/to/file2.tsx

### Implementation Approach
[Detailed description with code examples]

## Dependencies
- US01 (types)
- US02 (utilities)

## Estimated Effort
**X hours**

## Technical Notes
- Patterns to follow
- Risks and mitigation
- Performance considerations

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Code reviewed
```

---

## 🎓 Real Example: Hippotherapy Feature

### Input
**File**: `docs/Hippotherapy-Implementation-Plan.md`
- 108-hour feature
- 11 phases
- Complex requirements: 11 sections, images, multilingual support

### Command
```bash
/epic-splitter docs/Hippotherapy-Implementation-Plan.md
```

### Output
**Location**: `docs/hippotherapy/`

**Generated Stories** (12 total):
1. **US01**: Foundation & Types (4h) - TypeScript interfaces, constants, validation
2. **US02**: Utility Functions (3h) - Space management, validation helpers
3. **US03**: API Services (6h) - Backend communication layer
4. **US04**: Text Input Field (4h) - Reusable text field with character counter
5. **US05**: Image Upload Field (5h) - Image upload with validation and cropper
6. **US06**: Shared Components (3h) - PublishButton, ConfirmationModal, Toast
7. **US07**: Scientific References (8h) - Dynamic CRUD interface for references
8. **US08**: Section Components (25h) - All 11 content sections
9. **US09**: Translation System (20h) - Translation icons, 8 modal variants
10. **US10**: Main Page Integration (10h) - Assemble all sections, form state
11. **US11**: Routing & Localization (3h) - Route registration, i18n files
12. **US12**: Testing (15h) - Comprehensive test coverage

**Dependency Graph**:
```
US01 (Foundation)
  ├─→ US02 (Utilities)
  │     ├─→ US04 (TextInput)
  │     └─→ US05 (ImageUpload)
  └─→ US03 (API Services)
        └─→ US09 (Translation)

US04 + US05 + US06
  ├─→ US07 (Scientific References)
  └─→ US08 (Sections)

US08 + US09
  └─→ US10 (Main Page)
        └─→ US11 (Routing)

US01-US11 → US12 (Testing)
```

**Team Allocation** (3 developers):
- **Dev 1**: US01-US03 → US10 (Foundation & Integration)
- **Dev 2**: US04-US06 → US07-US08 (Components)
- **Dev 3**: US09-US11 (Translation & Routing)

---

## 💡 Key Features

### 1. Intelligent Splitting
- Analyzes epic structure and complexity
- Identifies natural boundaries (layers, components, features)
- Creates stories in optimal order (foundation → features → integration)
- Sizes stories appropriately (4-25 hours each)

### 2. Dependency Management
- Maps dependencies between stories
- Identifies critical path
- Suggests parallelization opportunities
- Prevents circular dependencies

### 3. Technical Guidance
- Provides file paths to create/modify
- Includes code snippets and examples
- References existing patterns in codebase
- Flags risks with mitigation strategies

### 4. Effort Estimation
- Realistic hour estimates per story
- Accounts for complexity and unknowns
- Enables accurate sprint planning
- Tracks total epic effort

### 5. Project Integration
- Follows project conventions from CLAUDE.md
- Uses correct path aliases (`@/*`)
- Matches naming conventions
- References similar existing code

---

## 🔧 How It Works

### Step-by-Step Process

1. **Parse Epic Document**
   - Reads markdown file
   - Extracts requirements, phases, estimates
   - Identifies structure and complexity

2. **Analyze Codebase Context**
   - Reads CLAUDE.md for project conventions
   - Checks for similar existing features
   - Identifies reusable patterns

3. **Identify Split Boundaries**
   - Foundation vs. features vs. integration
   - Shared components vs. specific components
   - Sequential dependencies vs. parallel work
   - Appropriate story sizing (4-25 hours)

4. **Generate User Stories**
   - Creates structured markdown files
   - Adds detailed acceptance criteria
   - Includes technical implementation details
   - Specifies file paths and code examples
   - Lists dependencies explicitly

5. **Create Dependency Graph**
   - Maps which stories depend on which
   - Identifies critical path
   - Flags parallelization opportunities

6. **Generate README**
   - Epic overview and context
   - Complete story index
   - Dependency visualization
   - Implementation timeline
   - Team allocation suggestions

7. **Write Output Files**
   - Creates `docs/[epic-name]/` directory
   - Generates all US##-name.md files
   - Creates comprehensive README.md

---

## 📐 Splitting Strategies

### By Layer (Backend/Full-Stack)
```
US01: Database models and migrations
US02: Service layer (business logic)
US03: API endpoints and validation
US04: API documentation and contracts
US05: Integration tests
```

### By Component (Frontend)
```
US01: Foundation types and utilities
US02: Shared UI components
US03: Feature-specific components
US04: Integration and routing
US05: Testing
```

### By Feature Vertical
```
US01: Read-only display
US02: Create functionality
US03: Update functionality
US04: Delete functionality
US05: Permissions and validation
```

### By Complexity
```
US01: Simple sections (4-8h each)
US02: Medium sections (8-15h each)
US03: Complex sections (15-25h each)
US04: Integration
US05: Testing
```

---

## ✅ When to Use

### Perfect For:
- ✅ Large features spanning multiple components
- ✅ Converting technical specs into tasks
- ✅ Breaking down major refactors
- ✅ Sprint planning and backlog creation
- ✅ Onboarding to complex features

### Not Suitable For:
- ❌ Single-story work (<25 hours)
- ❌ Exploratory spikes or POCs
- ❌ Bug fixes or small changes
- ❌ Epics lacking sufficient detail

---

## 🎨 Best Practices

### Before Running

1. **Enrich Your Epic**
   - Add clear requirements
   - Include UI mockups or references
   - Document architecture decisions
   - List known constraints
   - Define success metrics

2. **Review Project Context**
   - Update CLAUDE.md with conventions
   - Document existing patterns
   - List reusable components

3. **Clarify Unknowns**
   - Resolve ambiguities first
   - Validate technical approach
   - Confirm dependencies

### After Running

1. **Review Stories**
   - Validate acceptance criteria
   - Check dependencies make sense
   - Adjust estimates based on team velocity

2. **Refine Details**
   - Add project-specific criteria
   - Link to mockups or specs
   - Flag known blockers

3. **Plan Sprints**
   - Use dependency graph for sequencing
   - Assign based on team allocation
   - Track progress in README

4. **Track Progress**
   - Update README checklist as stories complete
   - Adjust remaining estimates based on actuals
   - Conduct retrospectives on estimates

---

## 🔍 Advanced Usage

### Custom Story Template

Modify the agent to match your needs:

```markdown
# In .claude/agents/epic-splitter.md

Each story must include:
1. Jira-style ticket number (PROJ-123)
2. Story points (Fibonacci scale)
3. QA validation steps
4. Deployment checklist
5. Rollback plan
```

### Integration with Project Management

Export generated stories to your tools:

**GitHub Issues**:
```bash
# Convert each US file to a GitHub issue
gh issue create --title "US01: Foundation Types" \
  --body-file docs/feature/US01-foundation.md \
  --label "user-story" \
  --milestone "Sprint 23"
```

**Jira**:
```python
# Script to import stories into Jira
for story in glob('docs/feature/US*.md'):
    jira.create_issue(
        project='PROJ',
        summary=extract_title(story),
        description=extract_content(story),
        issuetype='Story'
    )
```

### Multi-Epic Projects

For very large projects, split into multiple epics:

```bash
# Epic 1: Core functionality
/epic-splitter docs/MyFeature-Core.md

# Epic 2: Advanced features
/epic-splitter docs/MyFeature-Advanced.md

# Epic 3: Admin tools
/epic-splitter docs/MyFeature-Admin.md
```

Then create a master plan linking them:
```markdown
# MyFeature - Master Plan

## Epic 1: Core (60h) - Sprint 1-2
See [docs/myfeature-core/README.md]

## Epic 2: Advanced (45h) - Sprint 3-4
Depends on: Epic 1 complete
See [docs/myfeature-advanced/README.md]

## Epic 3: Admin (30h) - Sprint 5
Depends on: Epic 1 & 2 complete
See [docs/myfeature-admin/README.md]
```

---

## 🐛 Troubleshooting

### Stories Too Small/Large

**Symptom**: 30+ stories <2h each, or 5 stories >40h each

**Solution**:
- Review epic detail level
- Adjust granularity in agent prompt
- Manually combine/split outliers

### Unclear Dependencies

**Symptom**: Circular dependencies or unclear order

**Solution**:
- Clarify architecture in epic
- Identify foundation vs. features
- Break dependency cycles by extracting shared code

### Missing Technical Details

**Symptom**: Stories lack implementation guidance

**Solution**:
- Add more technical depth to epic
- Include code examples in epic
- Reference patterns in CLAUDE.md
- Run `/codebase-scout` first to find patterns

### Estimates Too Optimistic

**Symptom**: Team consistently takes 2x story estimates

**Solution**:
- Adjust estimates by team velocity multiplier
- Include buffer for unknowns (×1.2-1.5)
- Review actuals in retrospectives
- Update epic with lessons learned

---

## 🤝 Integration with Other Skills

### Workflow: Design → Epic → Stories → Implementation

```bash
# 1. Extract requirements from design
/design-to-code-scout [figma-url]

# 2. Scout codebase for patterns
/codebase-scout [feature-area]

# 3. Split epic into stories
/epic-splitter docs/MyFeature-Epic.md

# 4. Generate implementation guide
/handoff-pack-writer docs/myfeature/US04-components.md

# 5. Validate approach
/poc-validator

# 6. Implement stories
# ... developer work ...

# 7. Review code
/code-review

# 8. Test manually
/verify
```

---

## 📊 Measuring Success

### Metrics to Track

1. **Planning Time Reduction**
   - Before: Manual breakdown takes 4-8 hours
   - After: Automated splitting takes <30 minutes
   - **Savings**: 90%+ time reduction

2. **Estimate Accuracy**
   - Track: Estimated hours vs. actual hours per story
   - Goal: ±20% accuracy after calibration
   - Review: In sprint retrospectives

3. **Developer Clarity**
   - Survey: "Story had enough detail to start coding"
   - Goal: 90%+ positive responses
   - Improve: Add more examples based on feedback

4. **Sprint Predictability**
   - Track: Stories completed vs. planned per sprint
   - Goal: 85%+ completion rate
   - Improve: Refine estimates based on velocity

5. **Dependency Accuracy**
   - Track: Blocker frequency due to missing dependencies
   - Goal: <5% of stories blocked
   - Improve: More thorough dependency analysis

---

## 🎯 Next Steps

### For Product Owners
1. Create detailed epic documents
2. Run epic splitter during planning
3. Review and refine generated stories
4. Use for sprint planning and estimation

### For Tech Leads
1. Define project conventions in CLAUDE.md
2. Document reusable patterns
3. Review dependency graphs
4. Assign stories using team allocation

### For Developers
1. Pick up stories from backlog
2. Follow technical guidance
3. Update progress in README
4. Provide feedback on estimates

### For the Team
1. Integrate into sprint planning ritual
2. Track estimate accuracy
3. Refine based on retrospectives
4. Share success stories

---

## 📚 Resources

- **Skill Definition**: `.claude/skills/epic-splitter/skill.md`
- **Agent Definition**: `.claude/agents/epic-splitter.md`
- **Full Documentation**: `.claude/skills/epic-splitter/README.md`
- **Usage Examples**: `.claude/skills/epic-splitter/EXAMPLE.md`
- **Real Example**: `docs/hippotherapy/` (12 generated stories)

---

## 🔄 Version History

- **v1.0.0** (2026-06-04): Initial release
  - Automated epic splitting
  - Dependency graph generation
  - Team allocation suggestions
  - Full technical details in stories

---

## 💬 Feedback & Contribution

To improve the epic splitter:
1. Review generated stories and provide feedback
2. Suggest improvements to story template
3. Add examples for new project types
4. Update dependency analysis logic

**Questions?** Ask Claude: "How do I use the epic splitter?"

---

**Maintained by**: Victory Center Team  
**Last Updated**: 2026-06-04
