# Hippotherapy Admin Page - Epic Documentation

**Project**: Victory Center Client  
**Feature**: Hippotherapy Admin Page with Localization  
**Epic ID**: HIPPO-001  
**Created**: 2026-06-07  
**Status**: Ready for Development

---

## Epic Overview

Implement a comprehensive admin page for managing the hippotherapy program content on the Victory Center public website. The admin page allows content managers to edit 11 sections of hippotherapy content in Ukrainian, publish changes, and translate all content to English.

### What is Being Built
- Admin page at `/admin-panel/hippotherapy` with 11 editable content sections
- Rich text editing with character counters and validation
- Image upload with cropping and dimension validation
- Dynamic scientific research reference management
- Unified publish workflow with dirty state tracking
- Complete translation system for English localization
- Translation gate logic (translate only after Ukrainian is published)
- 8 specialized translation modal variants

### Why This Matters
- **For Visitors**: Access professional, accurate hippotherapy program information
- **For International Audiences**: English translation expands reach
- **For Admin**: Efficient content management without developer involvement
- **For Victory Center**: Showcase therapeutic programs and build credibility

---

## Total Effort Estimate

| Level | Stories | Estimated Hours | Sprints (2 weeks each) |
|-------|---------|----------------|------------------------|
| **Business Stories** | 12 | ~175 hours business value | 9 sprints |
| **Technical Stories** | 47 | ~181 hours implementation | 9 sprints |
| **Total Epic** | 59 | ~181 hours (overlapping) | **22-23 days (1 dev)** |

**Team Acceleration**:
- 2 developers: ~11-12 days
- 3 developers: ~8-9 days (with good parallelization)

---

## Business Stories Index

### Sprint 1: Foundation and Title Section (21h)
- **BS01**: Title Section Content Management
  - Admin can manage page title, tagline, and hero image
  - Validation for text (5-300 chars) and image (1440×660px, max 5MB)
  - **Demo**: Edit title, upload image, publish, view on public site

### Sprint 2: Educational Content (22h)
- **BS02**: What Is Hippotherapy Section Management
  - Admin can explain hippotherapy with rich text (1000 chars)
  - **Demo**: Edit with bold/italic/links, publish formatted content
  
- **BS04**: What Is Ipoventia Section Management
  - Admin can explain Ipoventia methodology with rich text
  - **Demo**: Similar to BS02, separate section

### Sprint 3: Social Proof and Philosophy (15h)
- **BS03**: Testimonials Section Management
  - Admin can showcase participant testimonials with photos
  - **Demo**: Add quote, author, photo; publish testimonial
  
- **BS05**: Center of Ipoventia Section Management
  - Admin can highlight patient-centered approach
  - **Demo**: Edit heading, 2 descriptions, upload image

### Sprint 4: Benefit Communication (20h)
- **BS06**: Why This Approach Section Management
  - Admin can highlight 4 key benefits with visual cards
  - **Demo**: Edit 4 cards (image + description each)
  
- **BS09**: Who Programs Suit Section Management
  - Admin can show 4 audience segments with cards
  - **Demo**: Similar to BS06, different content focus

### Sprint 5: Outcomes and Values (15h)
- **BS07**: What the Approach Shows Section Management
  - Admin can showcase proven results and outcomes
  - **Demo**: Edit with statistics and evidence
  
- **BS10**: Principles Section Management
  - Admin can communicate 5 core principles with image
  - **Demo**: Edit 5 principles + supporting image

### Sprint 6: Research Bibliography (15h)
- **BS08**: Scientific Research Section Management
  - Admin can manage dynamic reference list with citations
  - **Demo**: Add/edit/delete references, publish clickable links

### Sprint 7: Page Integration (26h)
- **BS11**: Page Integration and Publish Workflow
  - All 11 sections on one page with unified publish
  - **Demo**: Edit multiple sections, publish all at once, view on public site

### Sprints 8-9: Multilingual Support (51h)
- **BS12**: Translation System for English Content
  - Admin can translate all sections to English
  - Translation gate: can only translate after Ukrainian is published
  - **Demo Sprint 8**: Translate Title section, view on `/en/hippotherapy`
  - **Demo Sprint 9**: Complete all translations with 8 modal variants

---

## Technical Stories Index

### Foundation Layer (18h)
- **TS01**: Foundation types and constants (4h)
- **TS02**: Space management and validation utilities (6h)
- **TS03**: Translation types and constants (4h)
- **TS04**: Yup validation schema (4h)

### API Layer (11h)
- **TS22**: Hippotherapy admin API service (6h)
- **TS23**: Translation API service (5h)

### Shared Components (21h)
- **TS15**: Image upload field component (6h)
- **TS16**: Text input field with character counter (8h)
- **TS17**: Confirmation modal component (3h)
- **TS24**: Publish button component (4h)

### Section Components (49h)
- **TS08**: Title section component (4h)
- **TS09**: What Is Hippotherapy section component (4h)
- **TS10**: Testimonials section component (4h)
- **TS11**: What Is Ipoventia section component (4h)
- **TS12**: Center of Ipoventia section component (5h)
- **TS13**: Why This Approach section component (6h)
- **TS14**: What the Approach Shows section component (4h)
- **TS05**: Scientific Research section with CRUD (8h)
- **TS18**: Who Programs Suit section component (6h)
- **TS19**: Principles section component (6h)

### Page Integration (16h)
- **TS20**: Main hippotherapy admin page component (8h)
- **TS21**: useHippotherapyAdmin custom hook (6h)
- **TS25**: Page routing and navigation (2h)

### Translation System (36h)
- **TS06**: Translation icon component (3h)
- **TS07**: Translation modal base component (4h)
- **TS26**: Set1 translation modal (Title, What Is...) (3h)
- **TS27**: Testimonials translation modal (3h)
- **TS28**: Center of Ipoventia translation modal (3h)
- **TS29**: Card sections translation modal (4h)
- **TS40**: Scientific Research general translation modal (3h)
- **TS41**: Scientific Research entry translation modal (2h)
- **TS42**: Principles translation modal (3h)
- **TS43**: useTranslationGate hook (4h)
- **TS44**: useTranslationModal hook (4h)

### Testing (33h)
- **TS30-TS39**: Section integration tests (30h total)
- **TS45**: End-to-end integration tests (6h)
- **TS46**: Translation system integration tests (6h)

### Localization (3h)
- **TS47**: i18n files for hippotherapy admin (3h)

**Total**: 47 technical stories, ~181 hours

---

## Dependency Graph

### Visual Dependency Flow

```
Foundation (Sprint 1)
├─ TS01 (types) ─────────┬─> TS04 (validation)
│                         ├─> TS22 (API)
│                         └─> ALL section components
│
├─ TS02 (utils) ─────────┬─> TS16 (text input)
│                         └─> TS04 (validation)
│
└─ TS15, TS16 (shared) ──┴─> ALL section components

Section Components (Sprints 2-6) - CAN BUILD IN PARALLEL
├─ TS08 (Title) ─────────────> BS01
├─ TS09 (What Is Hippo) ─────> BS02
├─ TS10 (Testimonials) ──────> BS03
├─ TS11 (What Is Ipoventia) ─> BS04
├─ TS12 (Center) ────────────> BS05
├─ TS13 (Why Approach) ──────> BS06
├─ TS14 (What Shows) ────────> BS07
├─ TS05 (Research) ──────────> BS08
├─ TS18 (Who Suits) ─────────> BS09
└─ TS19 (Principles) ────────> BS10

Page Integration (Sprint 7) - REQUIRES ALL SECTIONS
└─ TS20 (main page) + TS21 (hook) + TS22 (API) + TS24 (publish) ─> BS11

Translation Foundation (Sprint 8)
└─ TS03, TS23, TS06, TS07, TS43, TS44 ─┬─> TS26-TS42 (modals)
                                        └─> BS12

Translation Modals (Sprint 9) - CAN BUILD IN PARALLEL
└─ TS26, TS27, TS28, TS29, TS40, TS41, TS42 ─> BS12
```

### Critical Path
1. **Sprint 1**: Foundation (TS01, TS02) → Shared components (TS15, TS16) → Title section (TS08, BS01)
2. **Sprints 2-6**: Section components can build in parallel
3. **Sprint 7**: Page integration requires all sections complete
4. **Sprint 8**: Translation foundation
5. **Sprint 9**: Translation modals (parallel)

### Parallel Work Opportunities
- **After Foundation (Sprint 1)**: All 10 section components can be built simultaneously
- **After Page Integration (Sprint 7)**: Translation modal variants can be built simultaneously
- **Ongoing**: Testing can proceed as components are completed

---

## Implementation Sequence

### Phase 1: Foundation (Sprint 1 - Week 1-2)
**Goal**: Establish types, utilities, and core shared components

**Sequence**:
1. TS01 (types) → TS02 (utils) → TS04 (validation)
2. TS15 (image upload) + TS16 (text input) - can build in parallel
3. TS08 (title section) + TS30 (tests)
4. **Milestone**: BS01 demo-ready

### Phase 2: Content Sections (Sprints 2-6 - Weeks 3-12)
**Goal**: Build all 11 section components

**Sequence** (parallelizable):
- Sprint 2: TS09 + TS11 (simple sections)
- Sprint 3: TS10 + TS12 (sections with images)
- Sprint 4: TS13 + TS18 (card-based sections)
- Sprint 5: TS14 + TS19 (outcomes + principles)
- Sprint 6: TS05 + TS17 (complex research section)

**Milestones**: BS02-BS10 demo-ready

### Phase 3: Integration (Sprint 7 - Weeks 13-14)
**Goal**: Assemble all sections into unified admin page

**Sequence**:
1. TS22 (API service)
2. TS21 (admin hook)
3. TS20 (main page component)
4. TS24 (publish button) + TS25 (routing)
5. TS45 (E2E tests)

**Milestone**: BS11 demo-ready, full Ukrainian admin page functional

### Phase 4: Translation (Sprints 8-9 - Weeks 15-18)
**Goal**: Add English translation capability

**Sprint 8 Sequence**:
1. TS03 (translation types)
2. TS23 (translation API)
3. TS43 + TS44 (hooks) - can build in parallel
4. TS06 (icon) + TS07 (base modal)

**Sprint 9 Sequence** (parallelizable):
- TS26, TS27, TS28, TS29 (modal variants 1-4)
- TS40, TS41, TS42 (modal variants 5-7)
- TS46 (integration tests)
- TS47 (i18n files)

**Milestone**: BS12 demo-ready, full English translation system

---

## Team Allocation Suggestions

### Option 1: Single Developer (22-23 days)
**Sequential execution**, follows implementation sequence above

### Option 2: Two Developers (11-12 days)
**Dev 1** (Backend-focused):
- Sprint 1: TS01, TS02, TS04 (foundation)
- Sprint 2-6: TS22 (API), TS05 (research), TS17 (modal), TS21 (hook)
- Sprint 7: TS20 (main page integration)
- Sprint 8-9: TS23 (translation API), TS43, TS44 (hooks)

**Dev 2** (Frontend-focused):
- Sprint 1: TS15, TS16 (shared components), TS08 (title)
- Sprint 2-6: TS09-TS14, TS18-TS19 (all section components)
- Sprint 7: TS24 (publish button), TS25 (routing)
- Sprint 8-9: TS06, TS07, TS26-TS42 (translation UI)

### Option 3: Three Developers (8-9 days)
**Dev 1** (API/State):
- TS01, TS02, TS04, TS22, TS21, TS23, TS43, TS44

**Dev 2** (Sections 1-5):
- TS15, TS16, TS08, TS09, TS10, TS11, TS12

**Dev 3** (Sections 6-11 + Translation):
- TS13, TS14, TS05, TS18, TS19, TS06, TS07, TS26-TS42

**All**: Testing (TS30-TS46) and integration

---

## Risks and Mitigation

### High-Risk Items

#### 1. Backend API Availability
**Risk**: Hippotherapy endpoints may not exist  
**Impact**: Could delay Sprint 7+ by days  
**Mitigation**:
- Create mock API service in Sprint 1
- Document API contract for backend team
- Use mock data until backend ready
- Add `// TODO: replace mock with real API` comments

#### 2. ImageCropper Integration
**Risk**: Existing cropper may not handle all 5 aspect ratios  
**Impact**: Could add 5-8 hours to Sprint 1  
**Mitigation**:
- Test cropper early with all sizes (1440×660, 1440×420, 1400×800, 360×430, 1440×800)
- Extend cropper component if needed
- Consider using react-easy-crop if existing solution insufficient

### Medium-Risk Items

#### 3. Translation Modal Complexity
**Risk**: 8 different modal variants may have duplicated logic  
**Impact**: Could add 10-15 hours if poorly designed  
**Mitigation**:
- Design flexible base modal (TS07) with configurable fields
- Test base modal with 2 variants before building all 8
- Extract common logic to useTranslationModal hook (TS44)

#### 4. Rich Text Toolbar + Character Limits
**Risk**: Lexical formatting may conflict with character counting  
**Impact**: 3-5 hours to handle edge cases  
**Mitigation**:
- Count plain text length (strip HTML/formatting)
- Test early with Lexical integration
- Reference existing Lexical usage in project

#### 5. Dirty State Tracking Across 11 Sections
**Risk**: Complex state management may cause bugs  
**Impact**: Could add 5-8 hours debugging  
**Mitigation**:
- Use React Hook Form's built-in isDirty per field
- Aggregate dirty state in useHippotherapyAdmin hook
- Test dirty state thoroughly in TS45

### Low-Risk Items

#### 6. Space Management Performance
**Risk**: Cleaning text on every keystroke may lag on slow devices  
**Impact**: 1-2 hours to optimize  
**Mitigation**:
- Clean on blur (not on change) for most cases
- Debounce if needed
- Profile performance on target devices

---

## Definition of Done

### Per Business Story
- [ ] All acceptance criteria met
- [ ] All technical stories for the BS are complete
- [ ] Unit tests pass with 93%+ coverage
- [ ] Integration tests pass
- [ ] Sprint demo scenario works end-to-end
- [ ] No TypeScript errors, max 10 lint warnings
- [ ] Code reviewed and approved
- [ ] User can perform the business story on dev environment

### Per Technical Story
- [ ] All acceptance criteria met
- [ ] Code follows project conventions (PascalCase, camelCase, path aliases)
- [ ] Unit tests written and passing
- [ ] JSDoc comments added
- [ ] No TypeScript errors
- [ ] ESLint passes (max 10 warnings)
- [ ] Code reviewed
- [ ] Integrates with existing codebase

### Epic Completion
- [ ] All 12 business stories complete
- [ ] All 47 technical stories complete
- [ ] Admin can manage all 11 hippotherapy sections in Ukrainian
- [ ] Admin can translate all sections to English
- [ ] Published content appears on public pages `/hippotherapy` and `/en/hippotherapy`
- [ ] Translation gate logic works (disable until Ukrainian published)
- [ ] All validation rules enforced
- [ ] Character counters work correctly
- [ ] Image upload/crop/delete works for all sections
- [ ] Scientific references CRUD works (add/edit/delete/collapse)
- [ ] Publish workflow works (dirty state, confirmation, save all)
- [ ] Test coverage: 93%+ lines, 87%+ branches
- [ ] No TypeScript errors, max 10 lint warnings
- [ ] Documentation complete (this README, MAPPING.md, business stories, technical stories)
- [ ] Stakeholder acceptance (PO demo approval)

---

## Progress Tracking

### Business Stories Status
- [ ] BS01: Title Section Content Management (21h)
- [ ] BS02: What Is Hippotherapy Section Management (14h)
- [ ] BS03: Testimonials Section Management (7h)
- [ ] BS04: What Is Ipoventia Section Management (6h)
- [ ] BS05: Center of Ipoventia Section Management (8h)
- [ ] BS06: Why This Approach Section Management (10h)
- [ ] BS07: What the Approach Shows Section Management (6h)
- [ ] BS08: Scientific Research Section Management (15h)
- [ ] BS09: Who Programs Suit Section Management (10h)
- [ ] BS10: Principles Section Management (9h)
- [ ] BS11: Page Integration and Publish Workflow (26h)
- [ ] BS12: Translation System for English Content (51h)

**Total**: 0/12 complete (0%)

### Technical Stories Status by Category

**Foundation (18h)**:
- [ ] TS01: Foundation types and constants (4h)
- [ ] TS02: Space management utilities (6h)
- [ ] TS03: Translation types (4h)
- [ ] TS04: Yup validation schema (4h)

**API Layer (11h)**:
- [ ] TS22: Hippotherapy API service (6h)
- [ ] TS23: Translation API service (5h)

**Shared Components (21h)**:
- [ ] TS15: Image upload field (6h)
- [ ] TS16: Text input field (8h)
- [ ] TS17: Confirmation modal (3h)
- [ ] TS24: Publish button (4h)

**Section Components (49h)**:
- [ ] TS08: Title section (4h)
- [ ] TS09: What Is Hippotherapy section (4h)
- [ ] TS10: Testimonials section (4h)
- [ ] TS11: What Is Ipoventia section (4h)
- [ ] TS12: Center of Ipoventia section (5h)
- [ ] TS13: Why This Approach section (6h)
- [ ] TS14: What the Approach Shows section (4h)
- [ ] TS05: Scientific Research section (8h)
- [ ] TS18: Who Programs Suit section (6h)
- [ ] TS19: Principles section (6h)

**Page Integration (16h)**:
- [ ] TS20: Main page component (8h)
- [ ] TS21: useHippotherapyAdmin hook (6h)
- [ ] TS25: Routing (2h)

**Translation (36h)**:
- [ ] TS06: Translation icon (3h)
- [ ] TS07: Translation modal base (4h)
- [ ] TS26: Set1 translation modal (3h)
- [ ] TS27: Testimonials translation modal (3h)
- [ ] TS28: Center translation modal (3h)
- [ ] TS29: Card translation modal (4h)
- [ ] TS40: Research general modal (3h)
- [ ] TS41: Research entry modal (2h)
- [ ] TS42: Principles translation modal (3h)
- [ ] TS43: useTranslationGate hook (4h)
- [ ] TS44: useTranslationModal hook (4h)

**Testing (33h)**:
- [ ] TS30-TS39: Section tests (30h)
- [ ] TS45: E2E tests (6h)
- [ ] TS46: Translation tests (6h)

**Localization (3h)**:
- [ ] TS47: i18n files (3h)

**Total**: 0/47 complete (0%)

---

## File Structure

```
docs/hippotherapy/
├── README.md                           # This file - epic overview
├── MAPPING.md                          # Business ↔ Technical mapping
├── business-stories/
│   ├── BS01-title-section.md
│   ├── BS02-what-is-hippotherapy-section.md
│   ├── BS03-testimonials-section.md
│   ├── BS04-what-is-ipoventia-section.md
│   ├── BS05-center-of-ipoventia-section.md
│   ├── BS06-why-this-approach-section.md
│   ├── BS07-what-approach-shows-section.md
│   ├── BS08-scientific-research-section.md
│   ├── BS09-who-programs-suit-section.md
│   ├── BS10-principles-section.md
│   ├── BS11-page-integration-and-publish.md
│   └── BS12-translation-system.md
└── technical-stories/
    ├── _TECHNICAL_STORIES_SUMMARY.md  # Quick reference
    ├── TS01-foundation-types-and-constants.md
    ├── TS02-utility-functions.md
    └── ... (additional TS files as created)
```

**Actual Implementation Code** (created during development):
```
src/
├── pages/admin/hippotherapy/
│   ├── HippotherapyAdminPage.tsx
│   ├── components/sections/          # 11 section components
│   ├── components/translation/       # Translation icons + 8 modals
│   └── components/shared/            # Reusable fields + buttons
├── types/admin/
│   ├── hippotherapy.types.ts
│   └── hippotherapy-translation.types.ts
├── const/admin/hippotherapy/
│   ├── validation-rules.ts
│   ├── section-configs.ts
│   └── index.ts
├── utils/functions/admin/hippotherapy/
│   ├── space-management.ts
│   └── validation-helpers.ts
├── services/api/admin/
│   ├── hippotherapy-admin-service.ts
│   └── hippotherapy-translation-service.ts
├── hooks/admin/hippotherapy/
│   ├── useHippotherapyAdmin.tsx
│   ├── useTranslationGate.tsx
│   └── useTranslationModal.tsx
├── validation/admin/
│   └── hippotherapy-schema.ts
└── locales/
    ├── uk/hippotherapyAdminPage.json
    └── en/hippotherapyAdminPage.json
```

---

## Quick Start Guide

### For Product Owner
1. Review business stories in `business-stories/` folder
2. Each BS has acceptance criteria and demo scenario
3. Use MAPPING.md to understand technical effort per BS
4. Prioritize sprints based on business value

### For Developers
1. Read this README for epic context
2. Review MAPPING.md for dependency graph
3. Start with TS01 (foundation types)
4. Follow implementation sequence by sprint
5. Refer to individual TS files for detailed specs
6. See `technical-stories/_TECHNICAL_STORIES_SUMMARY.md` for quick reference

### For QA/Testers
1. Each BS has test scenarios
2. Each TS has test cases (unit + integration)
3. Focus on acceptance criteria per story
4. Test demo scenarios at sprint end

### For New Developers
1. Entry path: BS01 → MAPPING.md → TS01, TS02, TS08
2. Understand the two-level structure (business vs technical)
3. Review existing patterns in CLAUDE.md
4. Ask questions if TS files lack detail

---

## References

- **Specification**: `docs/Hippothrapy Admin page spec+Loc.md`
- **Original Implementation Plan**: `docs/Hippotherapy-Implementation-Plan.md`
- **Project Context**: `CLAUDE.md`
- **Figma Mockups**:
  - Default admin page: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=23699-17654
  - With localization: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=22841-17329

---

## Contact and Support

For questions about:
- **Business Stories**: Contact Product Owner
- **Technical Stories**: Contact Tech Lead
- **API Endpoints**: Contact Backend Team
- **Design/UX**: Reference Figma mockups

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-07  
**Epic Status**: Ready for Development  
**Estimated Start Date**: TBD  
**Estimated Completion Date**: TBD + 22-23 days (1 dev) or 8-12 days (team)
