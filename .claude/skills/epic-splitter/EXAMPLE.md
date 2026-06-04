# Epic Splitter - Usage Example

## Quick Start

### Step 1: Prepare Your Epic
Create a markdown file in `docs/` with your feature specification. For example:

```markdown
# My Feature Epic

## Overview
Build a new admin panel for managing user permissions...

## Requirements
- User can view permissions
- User can edit permissions
- User can assign roles
...

## Technical Approach
- Use React + TypeScript
- Material-UI components
- REST API integration
...

## Estimated Effort
~50 hours
```

### Step 2: Run the Skill
```bash
/epic-splitter docs/MyFeature-Epic.md
```

Or search by name:
```bash
/epic-splitter my-feature
```

### Step 3: Review Generated Stories
The skill will create:
```
docs/my-feature/
├── README.md
├── US01-foundation.md
├── US02-api-services.md
├── US03-ui-components.md
├── US04-integration.md
└── US05-testing.md
```

## Real Example: Hippotherapy Feature

### Input Epic
**File**: [docs/Hippotherapy-Implementation-Plan.md](../../../docs/Hippotherapy-Implementation-Plan.md)

**Content Summary**:
- 108-hour feature for hippotherapy admin page
- 11 phases (foundation, utilities, API, components, translation, integration, testing)
- Complex requirements: 11 sections, image management, multilingual support
- Existing patterns to follow from programs/team pages

### Invocation
```bash
/epic-splitter docs/Hippotherapy-Implementation-Plan.md
```

### Generated Output

#### 1. README.md
```markdown
# Hippotherapy Admin Page - User Stories

## Epic Overview
Build a comprehensive admin page for managing "Hippotherapy" content...

## Total Effort: 108 hours

## User Stories Index
- US01: Foundation & Types (4h)
- US02: Utility Functions (3h)
- US03: API Services (6h)
...

## Dependency Graph
US01 → US02 → US04
US01 → US03 → US09
US04 + US05 → US07 → US08
US08 + US09 → US10 → US11

## Implementation Sequence
### Sprint 1 (Week 1): Foundation
- US01, US02, US03, US04, US05, US06

### Sprint 2 (Week 2): Components
- US07, US08 (parallel), US09 (parallel)

### Sprint 3 (Week 3): Integration
- US10, US11, US12
```

#### 2. US01-foundation-types.md
```markdown
# US01: Foundation & Types Setup

## User Story
**As a** developer  
**I want** to set up foundation types and constants  
**So that** all components have consistent data structures

## Acceptance Criteria
- [ ] All TypeScript interfaces defined
- [ ] Constants for validation rules centralized
- [ ] Yup schema complete
- [ ] Types compile without errors

## Technical Details

### Files to Create
- src/types/admin/hippotherapy.types.ts
- src/const/admin/hippotherapy/validation-rules.ts
- src/validation/admin/hippotherapy-schema.ts

### Implementation
```typescript
export interface HippotherapyData {
  title: {
    heading: string;
    description: string;
    image: ImageData;
  };
  // ... other sections
}
```

## Dependencies
None (foundation layer)

## Estimated Effort
**4 hours**

## Definition of Done
- [ ] All types compile
- [ ] Schema validates correctly
- [ ] Tests pass
```

#### 3. US02-utility-functions.md
```markdown
# US02: Utility Functions

## User Story
**As a** developer  
**I want** reusable utility functions  
**So that** text processing and validation are consistent

## Acceptance Criteria
- [ ] Space management functions work
- [ ] Validation helpers work
- [ ] Unit tests pass with 100% coverage

## Technical Details

### Files to Create
- src/utils/functions/admin/hippotherapy/space-management.ts
- src/utils/functions/admin/hippotherapy/validation-helpers.ts

### Implementation
```typescript
export const cleanTextInput = (value: string): string => {
  return collapseMultipleSpaces(
    trimLeadingTrailingSpaces(value)
  );
};
```

## Dependencies
- US01 (needs types and constants)

## Estimated Effort
**3 hours**
```

... and so on for all 12 stories.

## Workflow Integration Example

### Sprint Planning Session

1. **Product Owner** shares the epic document
2. **Tech Lead** runs `/epic-splitter docs/feature-epic.md`
3. **Team reviews** generated stories in standup:
   - Validate acceptance criteria
   - Adjust estimates based on team velocity
   - Identify blockers or unknowns
4. **Stories are assigned** using team allocation suggestions
5. **Sprint starts** with clear, implementable tasks

### During Development

Developer picks up US04:
1. Opens `docs/feature/US04-text-input-field.md`
2. Reviews acceptance criteria and technical details
3. Checks dependencies (US02 is done ✅)
4. Follows file paths and code examples
5. Implements, tests, and marks story complete

### Sprint Review

- Check off completed stories in README.md
- Review dependency graph to see what's unblocked
- Adjust remaining estimates based on actuals
- Plan next sprint with remaining stories

## Advanced Usage

### Custom Story Template

If your project needs different story structure, modify the agent:

```markdown
# In .claude/agents/epic-splitter.md

## User Story Structure
Each story you generate must include:
1. Title with Jira-style ticket number
2. Story points instead of hours
3. QA validation steps
4. Deployment checklist
```

### Team Size Adaptation

The skill adjusts suggestions based on team size:

**Single developer**:
```
Week 1: US01-US03 (foundation)
Week 2: US04-US06 (components)
Week 3: US07-US08 (integration)
```

**3 developers**:
```
Dev 1: US01-US03 → US08 (integration)
Dev 2: US04-US05 → US06-US07 (components A)
Dev 3: US09-US10 (components B) → US11 (testing)
```

### Epic Too Large?

If the skill detects >150 hours:
```
⚠️ This epic is very large (180 hours).
Consider splitting into multiple epics:
- Epic 1: Core functionality (80h)
- Epic 2: Advanced features (60h)
- Epic 3: Admin tools (40h)
```

## Tips & Tricks

### 1. Enrich Your Epic First
Better input = better output. Include:
- Clear requirements and acceptance criteria
- UI mockups or references
- Architecture decisions
- Known constraints or risks
- Success metrics

### 2. Run Early in Planning
Don't wait until implementation starts. Run the skill during:
- Pre-refinement preparation
- Epic breakdown sessions
- Technical design reviews

### 3. Iterate on Stories
Generated stories are a starting point. Refine them:
- Adjust estimates based on team velocity
- Add project-specific acceptance criteria
- Include links to mockups or specs
- Flag known risks or blockers

### 4. Track Progress
Update the README.md as work progresses:
```markdown
## Progress Tracking
- [x] US01: Foundation & Types
- [x] US02: Utility Functions
- [ ] US03: API Services (In Progress - John)
- [ ] US04: Text Input Field
```

### 5. Use with Other Skills
Combine with other skills for complete workflow:
```bash
# 1. Scout the codebase for patterns
/codebase-scout hippotherapy

# 2. Split the epic
/epic-splitter docs/Hippotherapy-Epic.md

# 3. Generate detailed guides
/handoff-pack-writer docs/hippotherapy/US04-text-input-field.md

# 4. Validate implementation
/poc-validator
```

## Troubleshooting

### Issue: Stories too granular
**Symptom**: 30+ stories with <2 hour estimates each

**Solution**: 
- The epic may have too much detail
- Combine related tasks into larger stories
- Aim for 4-25 hour range per story

### Issue: Unclear dependencies
**Symptom**: Circular dependencies or unclear order

**Solution**:
- Review the epic's architecture
- Identify foundation vs. feature work
- Manually specify dependency order in epic

### Issue: Missing technical details
**Symptom**: Stories lack implementation guidance

**Solution**:
- Add more technical detail to the epic
- Include code examples or references
- Link to existing patterns in CLAUDE.md

### Issue: Estimates way off
**Symptom**: Team velocity doesn't match estimates

**Solution**:
- Adjust multiplier based on team velocity
- Review completed stories for calibration
- Include buffer for unknowns/risks

## Next Steps

After generating stories:

1. **Review with team** - Validate stories and estimates
2. **Refine acceptance criteria** - Add project-specific details
3. **Assign ownership** - Use team allocation suggestions
4. **Add to backlog** - Import into Jira/Linear/GitHub Projects
5. **Start sprint** - Begin with foundation stories
6. **Track progress** - Update README as work completes
7. **Retrospective** - Review estimates vs. actuals

---

**Questions?** Check the [main README](./README.md) or ask Claude for help.
