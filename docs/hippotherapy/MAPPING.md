# Business to Technical Story Mapping

## Overview
This document maps business stories (for PO/stakeholders) to their technical implementation (for developers). Each business story represents a sprint-sized, demonstrable feature. Each technical story is a granular implementation task.

**Total Business Stories**: 12  
**Total Technical Stories**: 47  
**Total Estimated Effort**: ~181 hours (22-23 days for 1 developer)

---

## Sprint 1: Foundation and Title Section (21 hours)

### BS01: Title Section Content Management
**Business Value**: Admin can manage hippotherapy page title, tagline, and hero image

**Technical Implementation**:
```
BS01 (21 hours)
├── TS01: Foundation types and constants (4h) ⭐ FOUNDATION
│   └── Creates: types/admin/hippotherapy.types.ts
│   └── Creates: const/admin/hippotherapy/*
├── TS02: Space management and validation utilities (6h) ⭐ FOUNDATION
│   └── Creates: utils/functions/admin/hippotherapy/*
├── TS08: Title section component (4h)
│   └── Creates: components/admin/hippotherapy/sections/title-section/*
├── TS15: Image upload field component (6h) ⭐ SHARED
│   └── Creates: components/admin/hippotherapy/shared/image-upload-field/*
└── TS30: Title section integration tests (3h)
    └── Creates: Test files for title section

Foundation stories (TS01, TS02) support ALL business stories
Shared components (TS15) support BS01, BS03, BS05, BS06, BS09, BS10
```

**Sprint Demo**: Show admin editing title section heading, description, and image. Publish changes. View on public site.

**Dependencies**: None (foundation sprint)

---

## Sprint 2: Educational Sections (22 hours)

### BS02: What Is Hippotherapy Section Management
**Business Value**: Admin can educate visitors about hippotherapy

**Technical Implementation**:
```
BS02 (14 hours)
├── TS09: What Is Hippotherapy section component (4h)
│   └── Creates: components/admin/hippotherapy/sections/what-is-hippotherapy-section/*
├── TS16: Text input field with rich text (8h) ⭐ SHARED
│   └── Creates: components/admin/hippotherapy/shared/text-input-field/*
│   └── Integrates: Lexical editor for bold/italic/link
└── TS31: Section integration tests (2h)
```

### BS04: What Is Ipoventia Section Management  
**Business Value**: Admin can explain the specialized Ipoventia approach

**Technical Implementation**:
```
BS04 (6 hours)
├── TS11: What Is Ipoventia section component (4h)
│   └── Creates: components/admin/hippotherapy/sections/what-is-ipoventia-section/*
└── TS33: Section integration tests (2h)
```

**Sprint Demo**: Show admin editing both "What Is Hippotherapy" and "What Is Ipoventia" sections with rich text formatting. Bold key terms, add research links. Publish and view formatted content on public page.

**Dependencies**: Sprint 1 (foundation and shared components)

---

## Sprint 3: Testimonials and Center Section (15 hours)

### BS03: Testimonials Section Management
**Business Value**: Admin can showcase participant testimonials with photos

**Technical Implementation**:
```
BS03 (7 hours)
├── TS10: Testimonials section component (4h)
│   └── Creates: components/admin/hippotherapy/sections/testimonials-section/*
│   └── Uses: TS15 (image upload), TS16 (text input)
└── TS32: Testimonials integration tests (3h)
```

### BS05: Center of Ipoventia Section Management
**Business Value**: Admin can highlight the patient-centered approach

**Technical Implementation**:
```
BS05 (8 hours)
├── TS12: Center of Ipoventia section component (5h)
│   └── Creates: components/admin/hippotherapy/sections/center-of-ipoventia-section/*
│   └── Uses: TS15 (image upload), TS16 (text input)
└── TS34: Section integration tests (3h)
```

**Sprint Demo**: Add testimonial with quote, author, and photo. Edit Center of Ipoventia section with main description, additional description, and image. Publish both.

**Dependencies**: Sprint 1 (TS15 image upload, TS16 text input)

---

## Sprint 4: Card-Based Sections (20 hours)

### BS06: Why This Approach Section Management
**Business Value**: Admin can highlight 4 key benefits with visual cards

**Technical Implementation**:
```
BS06 (10 hours)
├── TS13: Why This Approach section component (6h)
│   └── Creates: components/admin/hippotherapy/sections/why-this-approach-section/*
│   └── Uses: TS15 (image upload × 4), TS16 (text input × 4)
└── TS35: Section integration tests (4h)
```

### BS09: Who Programs Suit Section Management
**Business Value**: Admin can show 4 audience segments

**Technical Implementation**:
```
BS09 (10 hours)
├── TS18: Who Programs Suit section component (6h)
│   └── Creates: components/admin/hippotherapy/sections/who-programs-suit-section/*
│   └── Uses: TS15 (image upload × 4), TS16 (text input × 4)
└── TS38: Section integration tests (4h)
```

**Sprint Demo**: Edit "Why This Approach" with 4 benefit cards (images + descriptions). Edit "Who Programs Suit" with 4 audience cards. Show independent editing per card. Publish and view grid layout on public page.

**Dependencies**: Sprint 1 (shared components)

---

## Sprint 5: Outcomes and Principles (15 hours)

### BS07: What the Approach Shows Section Management
**Business Value**: Admin can showcase proven results

**Technical Implementation**:
```
BS07 (6 hours)
├── TS14: What the Approach Shows section component (4h)
│   └── Creates: components/admin/hippotherapy/sections/what-the-approach-shows-section/*
│   └── Uses: TS16 (text input with rich text)
└── TS36: Section integration tests (2h)
```

### BS10: Principles Section Management
**Business Value**: Admin can communicate 5 core principles with image

**Technical Implementation**:
```
BS10 (9 hours)
├── TS19: Principles section component (6h)
│   └── Creates: components/admin/hippotherapy/sections/principles-section/*
│   └── Uses: TS15 (image upload), TS16 (text input × 5)
└── TS39: Section integration tests (3h)
```

**Sprint Demo**: Edit outcomes section with statistics. Edit principles section with 5 descriptions and supporting image. Publish and view results-focused content.

**Dependencies**: Sprint 1 (shared components)

---

## Sprint 6: Scientific Research Section (15 hours)

### BS08: Scientific Research Section Management
**Business Value**: Admin can manage research bibliography with citations and links

**Technical Implementation**:
```
BS08 (15 hours)
├── TS04: Yup validation schema for hippotherapy (4h) ⭐ FOUNDATION
│   └── Creates: validation/admin/hippotherapy-schema.ts
│   └── Includes: URL validation for research links
├── TS05: Scientific Research section with references CRUD (8h)
│   └── Creates: components/admin/hippotherapy/sections/scientific-research-section/*
│   └── Features: Add/edit/delete references, expand/collapse, validation
├── TS17: Confirmation modal component (3h) ⭐ SHARED
│   └── Creates: components/admin/hippotherapy/shared/confirmation-modal/*
│   └── Used for: Delete confirmations across all sections
└── TS37: Scientific Research integration tests (4h) - included in 15h total
```

**Sprint Demo**: Edit section heading and description. Expand existing reference, edit name and URL. Add new research reference with validation. Try to add another (button disabled until current validated). Delete a reference with confirmation. Publish - public page shows clickable research links.

**Dependencies**: Sprint 1 (foundation)

---

## Sprint 7: Page Integration (26 hours)

### BS11: Page Integration and Publish Workflow
**Business Value**: All 11 sections integrated with unified publish workflow

**Technical Implementation**:
```
BS11 (26 hours)
├── TS20: Main hippotherapy admin page component (8h)
│   └── Creates: pages/admin/hippotherapy/HippotherapyAdminPage.tsx
│   └── Integrates: All 11 section components
│   └── Features: Scrollable page, unified state management
├── TS21: useHippotherapyAdmin custom hook (6h)
│   └── Creates: hooks/admin/hippotherapy/useHippotherapyAdmin.tsx
│   └── Features: Data fetching, dirty tracking, save orchestration
├── TS22: Hippotherapy admin API service (6h) ⭐ FOUNDATION
│   └── Creates: services/api/admin/hippotherapy-admin-service.ts
│   └── Creates: const/common/api-routes/hippotherapy-routes.ts
│   └── Features: GET/PUT endpoints, image upload, reference CRUD
├── TS24: Publish button component (4h) ⭐ SHARED
│   └── Creates: components/admin/hippotherapy/shared/publish-button/*
│   └── Features: Disabled/enabled states, loading, confirmation
├── TS25: Page routing and navigation (2h)
│   └── Modifies: routes/app-router/AppRouter.tsx
│   └── Adds: /admin-panel/hippotherapy route
└── TS45: End-to-end integration tests (6h) - included in 26h total
```

**Sprint Demo**: Navigate to `/admin-panel/hippotherapy`. Show all 11 sections loading. Edit Title, Testimonials, and Principles sections. Publish button enables. Click publish → confirmation → success toast. View public page with all changes. Return to admin - publish button disabled (clean state).

**Dependencies**: Sprints 1-6 (all section components must exist)

---

## Sprint 8-9: Translation System (51 hours)

### BS12: Translation System for English Content
**Business Value**: Admin can translate all sections to English after publishing Ukrainian

**Technical Implementation**:
```
BS12 (51 hours) - SPLIT INTO 2 SPRINTS

Sprint 8 Foundation (25 hours):
├── TS03: Translation types and constants (4h) ⭐ FOUNDATION
│   └── Creates: types/admin/hippotherapy-translation.types.ts
│   └── Defines: Translation modal types, translation data structure
├── TS23: Translation API service (5h) ⭐ FOUNDATION
│   └── Creates: services/api/admin/hippotherapy-translation-service.ts
│   └── Features: GET/POST/PUT translation endpoints, status checks
├── TS06: Translation icon component (3h)
│   └── Creates: components/admin/hippotherapy/translation/TranslationIcon.tsx
│   └── Features: Disabled/active/edit states, gate logic
├── TS07: Translation modal base component (4h)
│   └── Creates: components/admin/hippotherapy/translation/TranslationModalBase.tsx
│   └── Features: Header, language dropdown, footer, close confirmation
├── TS43: useTranslationGate hook (4h)
│   └── Creates: hooks/admin/hippotherapy/useTranslationGate.tsx
│   └── Features: Fetch publication status, enable/disable translation icons
└── TS44: useTranslationModal hook (4h)
    └── Creates: hooks/admin/hippotherapy/useTranslationModal.tsx
    └── Features: Modal state, save/cancel, load existing translations

Sprint 9 Modal Variants (26 hours):
├── TS26: Set1 translation modal (Title, What Is...) (3h)
│   └── Creates: components/admin/hippotherapy/translation/Set1TranslationModal.tsx
│   └── Fields: Heading + description (for 4 section types)
├── TS27: Testimonials translation modal (3h)
│   └── Creates: components/admin/hippotherapy/translation/TestimonialsTranslationModal.tsx
│   └── Fields: Description + additional description
├── TS28: Center of Ipoventia translation modal (3h)
│   └── Creates: components/admin/hippotherapy/translation/CenterIpoventiaTranslationModal.tsx
│   └── Fields: Heading + description + additional description
├── TS29: Card sections translation modal (Why/Who) (4h)
│   └── Creates: components/admin/hippotherapy/translation/CardSectionsTranslationModal.tsx
│   └── Fields: Heading + 4 descriptions (with readonly card images)
├── TS40: Scientific Research general translation modal (3h)
│   └── Creates: components/admin/hippotherapy/translation/ResearchGeneralTranslationModal.tsx
│   └── Fields: Heading + description
├── TS41: Scientific Research entry translation modal (2h)
│   └── Creates: components/admin/hippotherapy/translation/ResearchEntryTranslationModal.tsx
│   └── Fields: Name only (URLs are shared)
├── TS42: Principles translation modal (3h)
│   └── Creates: components/admin/hippotherapy/translation/PrinciplesTranslationModal.tsx
│   └── Fields: Heading + 5 descriptions
├── TS46: Translation system integration tests (6h)
│   └── Tests: Gate logic, all modal variants, save/cancel, validation
└── TS47: i18n files for hippotherapy admin (3h)
    └── Creates: locales/uk/hippotherapyAdminPage.json
    └── Creates: locales/en/hippotherapyAdminPage.json
```

**Sprint 8 Demo**: Show translation icons disabled on all sections. Publish Title section - its icon becomes active. Click icon → "Add Translation" modal opens. Fill English heading and description with validation. Save translation. Icon changes to "edit" state. Click again - "Edit Translation" modal opens with saved content. View `/en/hippotherapy` - English title displays.

**Sprint 9 Demo**: Translate all remaining sections using different modal variants. Show Scientific Research with 2 independent modals (section + per-entry). Show card sections with readonly images for context. Publish all translations. View complete English hippotherapy page.

**Dependencies**: Sprint 7 (main page must be functional with all sections)

---

## Foundation Technical Stories (Support Multiple BS)

These technical stories are prerequisites that support multiple business stories:

### Core Foundation (Built in Sprint 1)
- **TS01**: Foundation types and constants (4h) → Supports ALL BS
- **TS02**: Space management and validation utilities (6h) → Supports ALL BS

### API Layer (Built in Sprint 6-7)
- **TS04**: Yup validation schema (4h) → Supports ALL BS validation
- **TS22**: Hippotherapy admin API service (6h) → Supports BS01-BS11

### Shared Components (Built in Sprints 1-6)
- **TS15**: Image upload field component (6h) → Supports BS01, BS03, BS05, BS06, BS09, BS10
- **TS16**: Text input field with character counter (8h) → Supports ALL BS
- **TS17**: Confirmation modal component (3h) → Supports ALL BS (delete actions)
- **TS24**: Publish button component (4h) → Supports BS11

### Translation Foundation (Built in Sprint 8)
- **TS03**: Translation types and constants (4h) → Supports BS12
- **TS23**: Translation API service (5h) → Supports BS12
- **TS06**: Translation icon component (3h) → Supports BS12 (all sections)
- **TS07**: Translation modal base component (4h) → Supports BS12 (all modals)
- **TS43**: useTranslationGate hook (4h) → Supports BS12
- **TS44**: useTranslationModal hook (4h) → Supports BS12

---

## Dependency Graph

```
Foundation Layer (Sprint 1):
TS01 (types) ──┬──> All Section Components (TS08-TS19)
               └──> TS04 (validation)
               └──> TS22 (API service)

TS02 (utils) ──┬──> TS16 (text input)
               └──> TS04 (validation)

Shared Components Layer (Sprints 1-6):
TS15 (image upload) ──> BS01, BS03, BS05, BS06, BS09, BS10
TS16 (text input) ──> ALL BS
TS17 (confirmation) ──> BS08 (and available for all)

Section Components Layer (Sprints 2-6):
TS08, TS09, TS10, TS11, TS12, TS13, TS14, TS05, TS18, TS19
└──> Can be built in parallel once foundation + shared components exist

Page Integration Layer (Sprint 7):
TS20 (main page) ──> Requires ALL section components (TS08-TS19)
TS21 (hook) ──> Supports TS20
TS22 (API) ──> Supports TS20, TS21
TS24 (publish button) ──> Supports TS20
TS25 (routing) ──> Integrates TS20

Translation Layer (Sprints 8-9):
TS03 (translation types) ──> TS23, TS06, TS07, TS26-TS42
TS23 (translation API) ──> TS43, TS44
TS06 (icon) + TS07 (base modal) ──> TS26-TS42 (modal variants)
TS43 (gate hook) + TS44 (modal hook) ──> TS26-TS42
```

---

## Parallel Work Opportunities

### After Sprint 1 Foundation (TS01, TS02, TS15, TS16):
**Can build in parallel**:
- All section components (TS08-TS19) - 10 components
- Validation schema (TS04)
- API service (TS22)

**Team of 3 example**:
- Dev 1: TS08, TS09, TS10, TS11 (simple sections)
- Dev 2: TS12, TS13, TS14 (medium sections)
- Dev 3: TS05, TS18, TS19 (complex sections)

### After Sprint 7 Integration:
**Translation work (Sprint 8-9) can proceed independently** while continuing to refine/test main page

---

## Risk Mitigation

### High-Risk Technical Stories
1. **TS22 (API Service)**: Backend endpoints may not exist
   - **Mitigation**: Create mock service first, document API contract for backend team
   
2. **TS15 (Image Upload)**: ImageCropper integration with 5 different aspect ratios
   - **Mitigation**: Test cropper early with all sizes, extend if needed

3. **TS05 (Scientific Research)**: Complex CRUD with validation
   - **Mitigation**: Build incrementally (add → edit → delete → collapse)

4. **TS21 (useHippotherapyAdmin)**: Dirty state tracking across 11 sections
   - **Mitigation**: Use React Hook Form's built-in dirty tracking

### Medium-Risk Technical Stories
1. **TS16 (Text Input)**: Character counter + rich text + validation
   - **Mitigation**: Build plain text first, add rich text incrementally

2. **TS07 (Translation Modal Base)**: Needs to support 8 variants
   - **Mitigation**: Design flexible prop interface, test with 2 variants before building all

---

## Testing Strategy

### Unit Tests (Ongoing)
- TS02 (utilities): 100% coverage requirement
- All components: Props, state, handlers

### Integration Tests (Per Sprint)
- TS30-TS39: Section components with form integration
- TS45: End-to-end page workflow
- TS46: Translation system workflow

### Coverage Targets
- **Lines**: 93%+
- **Branches**: 87%+
- **Functions**: 90%+

---

## Success Metrics

### Sprint Completion Criteria
Each sprint delivers demo-ready business value:
- ✅ All technical stories in sprint are complete
- ✅ Unit tests pass with coverage targets
- ✅ Integration tests pass
- ✅ Demo scenario from business story works end-to-end
- ✅ No TypeScript errors, max 10 lint warnings
- ✅ Code reviewed and approved

### Epic Completion Criteria
- ✅ All 12 business stories complete
- ✅ All 47 technical stories complete  
- ✅ Admin can manage all 11 hippotherapy sections
- ✅ Admin can translate all sections to English
- ✅ Public pages display content correctly (UK and EN)
- ✅ Test coverage meets project standards
- ✅ Documentation complete
