# Epic Splitter - BA Feedback Implementation

## Summary of Improvements

Based on feedback from the Business Analyst, the epic-splitter skill and agent have been significantly enhanced to better serve both business stakeholders and technical teams.

---

## What Changed

### 1. Two-Level Story Structure ✅

**Before**: Single-level technical user stories (US01, US02, ...)  
**After**: Two-level structure with business stories (BS) and technical stories (TS)

**Benefits**:
- **For PO/Stakeholders**: Work with business stories in non-technical language
- **For Developers**: Full technical details in technical stories
- **For Everyone**: Clear separation of business context from implementation

### 2. MAPPING Document ✅

**New Addition**: `MAPPING.md` file that bridges business and technical perspectives

**Contents**:
- Links each business story to its implementing technical stories
- Shows which technical work supports which business goal
- Visual representation (tree structure or table)
- Sprint allocation and effort estimates
- Foundation stories that support multiple BS

**Benefits**:
- PO understands technical scope without reading technical details
- Developers see business context for their work
- New team members have clear entry path: Business Story → MAPPING → Technical Tasks
- Everyone understands dependencies and acceleration after foundation complete

### 3. Test Cases in Every Story ✅

**Business Stories Get**:
- User acceptance test scenarios
- Given-When-Then format
- Happy path + edge cases
- Demo scenarios for sprint review

**Technical Stories Get**:
- Unit test cases (what to test)
- Integration test cases
- Expected coverage targets
- Test patterns to follow

**Benefits**:
- QA team has clear test requirements
- Developers know what to test before coding
- Acceptance criteria are testable and measurable
- Sprint demos have predefined success criteria

### 4. Granular Story Splitting ✅

**Before**: 
- ❌ US08: All 11 Section Components (25 hours in one story)
- ❌ Too large for one sprint
- ❌ Nothing to demo until all complete

**After**:
- ✅ BS01: Title Section (21h), BS02: Testimonials (18h), ... (11 separate business stories)
- ✅ TS06: Title Component (4h), TS09: Testimonials Component (4h), ... (granular technical tasks)
- ✅ Each BS fits in one sprint with demonstrable value
- ✅ Each TS is small enough to complete and test independently

**Benefits**:
- Sprint-sized deliverables (8-25 hours per BS)
- Demo-ready value every sprint
- Easier estimation and tracking
- Parallel work opportunities identified
- Progress visible and measurable

---

## File Structure Changes

### Before
```
docs/[feature-name]/
├── README.md
├── US01-foundation.md
├── US02-utilities.md
├── US03-api-services.md
└── ...
```

### After
```
docs/[feature-name]/
├── README.md                    # Epic overview
├── MAPPING.md                   # NEW: BS → TS mapping
├── business-stories/            # NEW: For PO/stakeholders
│   ├── BS01-feature-1.md
│   ├── BS02-feature-2.md
│   └── ...
└── technical-stories/           # NEW: For developers
    ├── TS01-foundation.md
    ├── TS02-component-a.md
    └── ...
```

---

## Story Template Changes

### Business Story Template (NEW)

```markdown
# BS##: [Feature Name]

## User Story
**As a** [user role]
**I want** [goal]
**So that** [business benefit]

## Business Value
[Why this matters]

## Acceptance Criteria
- [ ] Non-technical, user-focused criteria

## Sprint Demo Scenario
[What to show at sprint review]

## Test Scenarios
### Scenario 1: Happy Path
**Given** [context]
**When** [action]
**Then** [expected result]

## Technical Implementation
- TS##: [Technical task] (Xh)
- Total Effort: X hours

## Sprint Goal
[What user value is delivered]
```

### Technical Story Template (ENHANCED)

```markdown
# TS##: [Implementation Task]

## Implements
**Business Story**: BS## - [Feature Name]

## Technical Goal
[What needs to be built]

## Acceptance Criteria
- [ ] Technical, testable criteria

## Implementation Details
- Files to create/modify
- Code examples
- Architecture decisions

## Test Cases
### Unit Tests
- Test case 1
- Test case 2

### Integration Tests
- Test case 1

## Dependencies
- TS## (prerequisite)
- Part of BS## sprint goal

## Estimated Effort
**X hours**
```

---

## Improved Validation

The epic-splitter now validates:

**Business Stories**:
- [ ] Each BS fits in one sprint (8-25 hours total)
- [ ] Each BS delivers demonstrable user value
- [ ] Each BS has non-technical acceptance criteria
- [ ] Each BS has demo scenario for sprint review
- [ ] Each BS has user acceptance test scenarios
- [ ] Large features are split into multiple BS

**Technical Stories**:
- [ ] Each TS is granular (4-25 hours max)
- [ ] Large components are split properly
- [ ] Each TS has technical acceptance criteria
- [ ] Each TS references which BS it implements
- [ ] Each TS has unit/integration test cases
- [ ] Each TS has file paths and implementation details

**Overall**:
- [ ] MAPPING.md links all BS to their TS
- [ ] Dependencies tracked at both levels
- [ ] Directory structure follows conventions
- [ ] Foundation work identified and reused

---

## Real Example: Hippotherapy

### Original Split (Before)
- **US08**: Section Components (11 Sections) - 25 hours
- **Problem**: Too large, no demo until complete, unclear business value

### Improved Split (After)
- **BS01**: Title Section - 21h (Sprint 1)
- **BS02**: Testimonials Section - 18h (Sprint 2)
- **BS03**: What is Hippotherapy - 15h (Sprint 3)
- **BS04**: Ipoventia Section - 19h (Sprint 4)
- ... (11 business stories total)

Each business story supported by 3-5 technical stories (TS06-TS08 for BS01, etc.)

**Result**:
- ✅ Demo-ready value every sprint
- ✅ PO can track business progress
- ✅ Developers have clear technical tasks
- ✅ Foundation work (TS01-TS05) identified and reused
- ✅ Team accelerates after Sprint 1

---

## Workflow Changes

### Sprint Planning (Before)
1. Look at technical user stories
2. Try to understand business value
3. Guess which stories fit in sprint
4. Hope there's something to demo

### Sprint Planning (After)
1. **PO reviews business stories** - picks one for sprint
2. **Check MAPPING** - see which technical stories implement it
3. **Validate prerequisites** - foundation stories complete?
4. **Assign technical stories** - developers know exactly what to build
5. **Sprint goal clear** - everyone knows what will be demoed

### Demo (Before)
- "We completed infrastructure work this sprint"
- Nothing visible to show stakeholders
- Business value unclear

### Demo (After)
- **Follow demo scenario from BS**
- Show working feature (e.g., "Admin can now manage title section")
- Demonstrate end-to-end workflow
- Stakeholders see tangible value

---

## Updated Documentation

All documentation has been updated:

1. **Skill Definition** (`.claude/skills/epic-splitter/skill.md`)
   - Two-level structure explained
   - New output format
   - Updated templates
   - Granularity guidelines

2. **Agent Definition** (`.claude/agents/epic-splitter.md`)
   - Enhanced instructions for BS and TS generation
   - MAPPING document creation
   - Test case generation
   - Updated validation checklist

3. **Examples**:
   - `IMPROVED-EXAMPLE.md` - Detailed before/after comparison
   - Shows complete BS, TS, and MAPPING documents
   - Real hippotherapy feature example

4. **Guides**:
   - `README.md` - Updated with new approach
   - `EXAMPLE.md` - Real usage examples
   - `epic-splitter-guide.md` - Comprehensive guide

---

## How to Use

### For BA/PO
```bash
/epic-splitter docs/MyFeature-Epic.md
```

You'll get:
- `business-stories/` - Your sprint backlog (non-technical)
- `MAPPING.md` - Understand technical scope
- Can prioritize/descope business stories without technical knowledge

### For Developers
After BA runs epic-splitter:
1. Read business story (BS##) to understand context
2. Check MAPPING to see your technical tasks
3. Implement technical story (TS##) with full details
4. Contribute to BS sprint goal

### For Team Leads
Use MAPPING.md to:
- Identify foundation work
- Allocate parallel work
- Track dependencies
- Plan team capacity

---

## Benefits Summary

### For Product Owners
✅ Work with business stories in familiar language  
✅ Clear sprint goals and demo scenarios  
✅ Can prioritize without technical knowledge  
✅ See progress through business value delivered  

### For Business Analysts
✅ Write business stories once, technical details auto-generated  
✅ MAPPING shows full implementation scope  
✅ Test scenarios included automatically  
✅ Can validate completeness at business level  

### For Developers
✅ Clear technical tasks with implementation details  
✅ Understand business context for your work  
✅ Granular stories (4-25h) easier to estimate  
✅ Foundation work identified and reused  

### For QA/Testing
✅ Every story has test cases  
✅ Business acceptance tests + technical unit tests  
✅ Demo scenarios provide user workflows  
✅ Clear expected behavior for each story  

### For Scrum Masters
✅ Sprint planning faster and clearer  
✅ Demo-ready value every sprint  
✅ Dependencies visible at both levels  
✅ Team velocity easier to track  

---

## Migration Path

### For Existing Epics
1. Re-run epic-splitter on existing epics
2. Get improved two-level structure
3. Use MAPPING to see business ↔ technical linkage
4. No need to rewrite existing work, just reorganize

### For New Features
1. Write epic with business requirements
2. Run `/epic-splitter docs/epic.md`
3. Get complete BS + TS + MAPPING structure
4. Start sprint planning immediately

---

## Questions & Answers

**Q: Do I need both business and technical stories?**  
A: Yes! They serve different audiences. PO works with BS, developers work with TS, MAPPING connects them.

**Q: What if my epic is small (<30 hours)?**  
A: You might get 1-2 business stories with 3-6 technical stories. Structure still helpful for clarity.

**Q: Can I customize the templates?**  
A: Yes! Modify the agent definition to match your organization's story format.

**Q: What about test cases?**  
A: Every story now includes test cases. Business stories get acceptance tests, technical stories get unit/integration tests.

**Q: How granular should technical stories be?**  
A: Aim for 4-25 hours each. If a story is >25 hours, split it further. Each TS should be completable and testable independently.

**Q: How do foundation stories work?**  
A: Foundation TS (types, utilities, services) are identified as supporting multiple BS. They're completed early and accelerate later sprints.

---

## Feedback Loop

The epic-splitter continues to improve based on real usage. Please provide feedback on:
- Story granularity (too large/small?)
- MAPPING document clarity
- Test case usefulness
- Business/technical separation
- Any missing elements

**Contact**: Share feedback in team retrospectives or update the agent definition directly.

---

## Next Steps

1. ✅ **Skill and agent updated** with BA feedback
2. ✅ **Documentation updated** with examples and guides
3. ⏭️ **Try it on a real epic** - Test the improved structure
4. ⏭️ **Gather team feedback** - PO, developers, QA perspectives
5. ⏭️ **Refine templates** - Adjust based on actual usage
6. ⏭️ **Train team** - Show everyone how to use the two-level structure

---

**Last Updated**: 2026-06-07  
**Contributors**: Development Team + Business Analyst Feedback  
**Version**: 2.0 (Two-Level Structure)
