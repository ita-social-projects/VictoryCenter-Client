# Hippotherapy Admin Page - User Stories

This folder contains all user stories for implementing the Hippotherapy admin page feature in the Victory Center Client application.

## Epic Overview

Build a comprehensive admin page for managing the "Hippotherapy" public page content, including 11 content sections, image management, multilingual translation support (Ukrainian/English), and full CRUD operations.

**Total Estimated Effort**: ~108 hours (13-14 days for 1 developer)

---

## User Stories Index

### Phase 1: Foundation (7 hours)
- **[US01: Foundation & Types](./US01-foundation-types.md)** (4 hours)
  - TypeScript interfaces, constants, validation schemas
  - Dependencies: None

- **[US02: Utility Functions](./US02-utility-functions.md)** (3 hours)
  - Space management and validation helpers
  - Dependencies: US01

### Phase 2: Infrastructure (6 hours)
- **[US03: API Services](./US03-api-services.md)** (6 hours)
  - API service layer for data fetching and mutations
  - Dependencies: US01
  - ⚠️ Risk: Backend APIs may not exist yet (use mocks)

### Phase 3: Shared Components (12 hours)
- **[US04: Text Input Field](./US04-text-input-field.md)** (4 hours)
  - Reusable text field with character counter and validation
  - Dependencies: US02

- **[US05: Image Upload Field](./US05-image-upload-field.md)** (5 hours)
  - Image upload with validation, cropper, and delete
  - Dependencies: US02

- **[US06: Shared Components](./US06-shared-components.md)** (3 hours)
  - PublishButton, ConfirmationModal, SuccessToast
  - Dependencies: None

### Phase 4: Complex Components (8 hours)
- **[US07: Scientific References Section](./US07-scientific-references-section.md)** (8 hours)
  - Dynamic CRUD interface for scientific references
  - Dependencies: US04, US06

### Phase 5: Section Components (25 hours)
- **[US08: Section Components](./US08-section-components.md)** (25 hours)
  - All 11 content sections (Title, WhatIsHippotherapy, Testimonials, etc.)
  - Dependencies: US04, US05, US07
  - ✅ Can parallelize: Multiple developers can build sections concurrently

### Phase 6: Translation System (20 hours)
- **[US09: Translation System](./US09-translation-system.md)** (20 hours)
  - Translation icons, 8 modal variants, translation gate logic
  - Dependencies: US03, US04, US06
  - ✅ Can parallelize: Can start after US03/US04, doesn't block US08

### Phase 7: Integration (10 hours)
- **[US10: Main Page Integration](./US10-main-page-integration.md)** (10 hours)
  - Assemble all sections, form state management, publish flow
  - Dependencies: US08, US09

### Phase 8: Deployment (3 hours)
- **[US11: Routing & Localization](./US11-routing-localization.md)** (3 hours)
  - Route registration, navigation, i18n files
  - Dependencies: US10

### Phase 9: Quality Assurance (15 hours)
- **[US12: Comprehensive Testing](./US12-testing.md)** (15 hours)
  - Unit, component, and integration tests
  - Dependencies: US01-US11
  - ✅ Ongoing: Can test components as they're built

---

## Dependency Graph

```
US01 (Foundation)
  ├─→ US02 (Utilities)
  │     ├─→ US04 (TextInput)
  │     └─→ US05 (ImageUpload)
  └─→ US03 (API Services)
        └─→ US09 (Translation)

US04 + US05 + US06 (Shared Components)
  ├─→ US07 (Scientific References)
  └─→ US08 (Sections)

US08 + US09 (Sections + Translation)
  └─→ US10 (Main Page)
        └─→ US11 (Routing)

US01-US11 → US12 (Testing - ongoing)
```

---

## Implementation Sequence

### Sprint 1 (Week 1)
1. US01: Foundation & Types
2. US02: Utility Functions
3. US03: API Services (with mocks)
4. US04: Text Input Field
5. US05: Image Upload Field
6. US06: Shared Components

**Deliverable**: All foundation and shared components ready

### Sprint 2 (Week 2)
7. US07: Scientific References Section
8. US08: Section Components (start with simpler sections)
   - Parallel work: 3 developers can split sections
9. US09: Translation System (can start after US03/US04)

**Deliverable**: All sections and translation system complete

### Sprint 3 (Week 3)
10. US08: Section Components (finish remaining sections)
11. US10: Main Page Integration
12. US11: Routing & Localization
13. US12: Testing (complete remaining tests)

**Deliverable**: Feature complete, tested, and deployed

---

## Team Allocation (3 developers)

### Developer 1: Foundation & Integration
- Week 1: US01, US02, US03
- Week 2: US09 (Translation System)
- Week 3: US10 (Main Page Integration)

### Developer 2: Shared Components & Sections
- Week 1: US04, US05, US06
- Week 2: US07, US08 (Sections 1-5)
- Week 3: US11, US12 (Testing)

### Developer 3: Sections & Testing
- Week 1: Help with US04-US06
- Week 2: US08 (Sections 6-11)
- Week 3: US12 (Testing)

---

## Definition of Done (All User Stories)

### Functional Requirements
- All acceptance criteria met
- Feature works as specified in Figma mockups
- No breaking bugs or regressions

### Technical Requirements
- Code follows project conventions (CLAUDE.md)
- All imports use `@/*` path aliases
- TypeScript strict mode passes
- No ESLint warnings (max 10 allowed)
- Prettier formatted
- 93%+ line coverage, 87%+ branch coverage

### Documentation
- Code is self-documenting with clear variable/function names
- Complex logic has explanatory comments
- API TODO comments where backend is pending

### Review
- Code review completed
- PR approved by at least one reviewer
- All review comments addressed

### Deployment
- Feature branch merged to main
- No CI/CD pipeline failures
- Feature accessible in staging environment

---

## Risks & Mitigation

### High Risk
1. **Backend API Availability**
   - Impact: Could delay Phase 2+ by days
   - Mitigation: Use mocks, document API contract, coordinate with backend team

2. **ImageCropper Integration**
   - Impact: Could add 5-8 hours to US05
   - Mitigation: Test cropper early with all aspect ratios

### Medium Risk
3. **Character Counter UX**
   - Impact: 2-3 hours iteration
   - Mitigation: Simple design (e.g., "45/50"), team review

4. **Translation Modal Complexity**
   - Impact: Could save 10-15 hours if base component used
   - Mitigation: Create base modal component for reuse

5. **Rich Text Toolbar Integration**
   - Impact: 3-5 hours edge case handling
   - Mitigation: Test early with character limits

---

## Quick Reference

### Character Limits
- Heading: 50 chars (min 5)
- Description (short): 100 chars (min 10)
- Description (medium): 300 chars (min 10)
- Description (long): 1000 chars (min 10)
- Additional Description: 50 chars (min 10)
- Reference Name: 150 chars (min 5)
- Reference Link: 1000 chars (min 5)

### Image Dimensions
- Title Hero: 1440×660px
- Center Ipoventia: 1440×420px
- Testimonials: 1400×800px
- Card Images: 360×430px
- Principles: 1440×800px

### Validation Rules
- Max file size: 5MB
- Allowed formats: jpeg, jpg, png, webp
- Min dimensions: As specified per section

---

## Related Documentation

- [Main Implementation Plan](../Hippotherapy-Implementation-Plan.md)
- [Technical Specification](../Hippothrapy%20Admin%20page%20spec+Loc.md)
- [Project CLAUDE.md](../../CLAUDE.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)

---

## Progress Tracking

Use this checklist to track completion:

- [ ] US01: Foundation & Types
- [ ] US02: Utility Functions
- [ ] US03: API Services
- [ ] US04: Text Input Field
- [ ] US05: Image Upload Field
- [ ] US06: Shared Components
- [ ] US07: Scientific References Section
- [ ] US08: Section Components (11 sections)
- [ ] US09: Translation System
- [ ] US10: Main Page Integration
- [ ] US11: Routing & Localization
- [ ] US12: Comprehensive Testing

**Last Updated**: 2026-06-04
