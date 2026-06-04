# 📋 Hippotherapy Admin Page - Implementation Plan

**Project**: Victory Center Client  
**Feature**: Hippotherapy Admin Page with Localization  
**Date**: 2026-06-04  
**Estimated Effort**: ~108 hours (13-14 days for 1 developer)

---

## 🔍 Existing Patterns to Reuse

### ✅ Already Available
- **Form Management**: `useFormManager` hook with React Hook Form + Yup validation (src/hooks/admin/use-form-manager/useFormManager.tsx)
- **API Client**: `useAdminClient` hook for authenticated requests (src/hooks/admin/use-admin-client/useAdminClient.tsx)
- **Toasts**: `useToast` from ToastContext (src/contexts/admin/toast-context-provider/ToastContextProvider.tsx)
- **Rich Text**: Lexical-based `RichTextInput` component (src/components/admin/rich-text-input/)
- **Image Upload**: `ImageCropper` component (src/components/admin/image-cropper/)
- **Path Aliases**: `@/*` configured in tsconfig and webpack
- **Confirmation Modals**: `ConfirmationModal` pattern used in programs/team pages
- **Translation Pattern**: i18next with `useTranslation` hook

### 🔨 Need to Build
- Hippotherapy-specific sections (11 total)
- Character counter UI for text fields
- Space management utilities
- Scientific references CRUD interface
- Translation modals (8 variants)
- Translation gate logic (isUkrainianPublished checks)
- Specialized validation for hippotherapy fields

---

## 📝 Implementation Phases

### **Phase 1: Foundation & Types** (Simple)
**Goal**: Set up data structures and API contracts  
**Estimated Effort**: 4 hours

**Tasks**:
1. Create `src/types/admin/hippotherapy.types.ts` with interfaces for:
   - HippotherapySection (base interface)
   - HippotherapySectionWithImage (extends base + image)
   - HippotherapyCard (for "Why This Approach" and "Who Programs Suit" sections)
   - ScientificReference interface
   - TranslationModalType enum
   - Full HippotherapyData aggregate type

2. Create `src/const/admin/hippotherapy/` with constants:
   - `validation-rules.ts`: character limits, file size/type rules
   - `section-configs.ts`: section IDs, display names, field configurations
   - `translation-modal-types.ts`: modal variant mappings

3. Create `src/validation/admin/hippotherapy-schema.ts`:
   - Yup schema following pattern from `src/validation/admin/program-schema.ts`
   - Per-field validation (min chars, required, URL format for references)
   - Nested object validation for cards and references arrays

**Files to Create**:
- src/types/admin/hippotherapy.types.ts
- src/const/admin/hippotherapy/validation-rules.ts
- src/const/admin/hippotherapy/section-configs.ts
- src/const/admin/hippotherapy/translation-modal-types.ts
- src/validation/admin/hippotherapy-schema.ts

**Dependencies**: None

---

### **Phase 2: Utility Functions** (Simple)
**Goal**: Build reusable helpers for space management and validation  
**Estimated Effort**: 3 hours

**Tasks**:
1. Create `src/utils/functions/admin/hippotherapy/space-management.ts`:
   - `trimLeadingTrailingSpaces(value: string): string`
   - `preventLeadingSpace(value: string): string`
   - `collapseMultipleSpaces(value: string): string`
   - `cleanTextInput(value: string): string` (combines all three)

2. Create `src/utils/functions/admin/hippotherapy/validation-helpers.ts`:
   - `validateImageDimensions(file: File, minWidth: number, minHeight: number): Promise<boolean>`
   - `validateImageFile(file: File): { valid: boolean; error?: string }`
   - `getRemainingCharacters(current: number, max: number): number`

**Files to Create**:
- src/utils/functions/admin/hippotherapy/space-management.ts
- src/utils/functions/admin/hippotherapy/validation-helpers.ts

**Dependencies**: Phase 1 (types and constants)

---

### **Phase 3: API Service Layer** (Medium)
**Goal**: Create service functions for backend communication  
**Estimated Effort**: 6 hours

**Tasks**:
1. Create `src/services/api/admin/hippotherapy-admin-service.ts` following pattern from `src/services/api/admin/programs-admin-service.ts`:
   - `getHippotherapyData(adminClient: AxiosInstance): Promise<HippotherapyData>`
   - `updateHippotherapySection(adminClient, sectionId, data): Promise<void>`
   - `uploadHippotherapyImage(adminClient, sectionId, file): Promise<string>`
   - `deleteHippotherapyImage(adminClient, sectionId, imageId): Promise<void>`
   - `createScientificReference(adminClient, reference): Promise<ScientificReference>`
   - `updateScientificReference(adminClient, id, reference): Promise<void>`
   - `deleteScientificReference(adminClient, id): Promise<void>`

2. Create `src/services/api/admin/hippotherapy-translation-service.ts`:
   - `getTranslation(adminClient, locale, sectionId): Promise<TranslationData>`
   - `saveTranslation(adminClient, locale, sectionId, data): Promise<void>`
   - `checkUkrainianPublished(adminClient, sectionId): Promise<boolean>`

**Files to Create**:
- src/services/api/admin/hippotherapy-admin-service.ts
- src/services/api/admin/hippotherapy-translation-service.ts
- src/const/common/api-routes/hippotherapy-routes.ts (API endpoints)

**Dependencies**: Phase 1 (types)

**⚠️ Risk**: Backend API endpoints may not exist yet. Consider using mock responses initially.

---

### **Phase 4: Shared Components** (Medium-Complex)
**Goal**: Build reusable UI components for fields and actions  
**Estimated Effort**: 12 hours

**Tasks**:
1. Create `TextInputField` component (src/components/admin/hippotherapy/shared/text-input-field/):
   - Wrap MUI TextField with character counter UI
   - Integrate `cleanTextInput` on blur
   - Support optional RichTextInput mode (bold/italic/link toolbar)
   - Props: label, value, onChange, maxChars, multiline, required, error

2. Create `ImageUploadField` component (src/components/admin/hippotherapy/shared/image-upload-field/):
   - Reuse existing `ImageCropper` from src/components/admin/image-cropper/
   - Drag-drop zone with file validation
   - Preview with delete confirmation
   - Props: currentImageUrl, onImageChange, minWidth, minHeight, aspectRatio

3. Create `PublishButton` component (src/components/admin/hippotherapy/shared/publish-button/):
   - Disabled state based on form validation + dirty state
   - Loading state during save
   - Success toast integration
   - Props: isValid, isDirty, onPublish, isLoading

4. Create `ConfirmationModal` component (src/components/admin/hippotherapy/shared/confirmation-modal/):
   - Generic modal for delete confirmations
   - Props: open, title, message, onConfirm, onCancel

**Files to Create**:
- src/components/admin/hippotherapy/shared/text-input-field/TextInputField.tsx
- src/components/admin/hippotherapy/shared/text-input-field/TextInputField.module.scss
- src/components/admin/hippotherapy/shared/text-input-field/TextInputField.test.tsx
- src/components/admin/hippotherapy/shared/image-upload-field/ImageUploadField.tsx
- src/components/admin/hippotherapy/shared/image-upload-field/ImageUploadField.module.scss
- src/components/admin/hippotherapy/shared/publish-button/PublishButton.tsx
- src/components/admin/hippotherapy/shared/publish-button/PublishButton.module.scss
- src/components/admin/hippotherapy/shared/confirmation-modal/ConfirmationModal.tsx
- src/components/admin/hippotherapy/shared/confirmation-modal/ConfirmationModal.module.scss

**Dependencies**: Phase 2 (utilities)

**⚠️ Risk**: Character counter UI design may need UX review. ImageCropper integration may require adjustments.

---

### **Phase 5: Scientific References Section** (Medium)
**Goal**: Build dynamic collapsible CRUD interface for references  
**Estimated Effort**: 8 hours

**Tasks**:
1. Create `ScientificReferencesSection` component:
   - Accordion/collapsible list of reference entries
   - Each entry: name (150 chars), link (1000 chars) with validation
   - Add button (creates new entry)
   - Delete button per entry (with confirmation)
   - Validation messages on blur
   - Auto-save or controlled save via parent form

2. Create `ScientificReferenceEntry` sub-component:
   - Collapsible header showing reference name
   - Expanded view with TextInputField for name + link
   - Delete action with ConfirmationModal
   - Validation state display

**Files to Create**:
- src/components/admin/hippotherapy/sections/scientific-references/ScientificReferencesSection.tsx
- src/components/admin/hippotherapy/sections/scientific-references/ScientificReferencesSection.module.scss
- src/components/admin/hippotherapy/sections/scientific-references/ScientificReferenceEntry.tsx
- src/components/admin/hippotherapy/sections/scientific-references/ScientificReferenceEntry.module.scss

**Dependencies**: Phase 4 (TextInputField, ConfirmationModal)

---

### **Phase 6: Section Components (11 Total)** (Complex)
**Goal**: Build all content section components  
**Estimated Effort**: 25 hours

**Tasks** (each section follows similar pattern):
1. **TitleSection** (heading + description + image):
   - TextInputField for heading (50 chars)
   - TextInputField for description (300 chars, multiline)
   - ImageUploadField (1440×660px)

2. **WhatIsHippotherapySection** (heading + description):
   - TextInputField for heading (50 chars)
   - TextInputField for description (1000 chars, multiline, rich text)

3. **TestimonialsSection** (description + additional description + image):
   - TextInputField for description (100 chars)
   - TextInputField for additional description (50 chars)
   - ImageUploadField (1400×800px)

4. **WhatIsIpoventiaSection** (heading + description):
   - Same as WhatIsHippotherapy

5. **CenterOfIpoventiaSection** (heading + description + additional description + image):
   - TextInputField for heading (50 chars)
   - TextInputField for description (300 chars)
   - TextInputField for additional description (50 chars)
   - ImageUploadField (1440×420px)

6. **WhyThisApproachSection** (heading + 4 cards with image + description):
   - TextInputField for section heading (50 chars)
   - Map over 4 cards: ImageUploadField (360×430px) + TextInputField for description (300 chars)

7. **WhatTheApproachShowsSection** (heading + description):
   - Same as WhatIsHippotherapy

8. **ScientificResearchSection** (heading + description + dynamic references):
   - TextInputField for heading (50 chars)
   - TextInputField for description (300 chars)
   - ScientificReferencesSection component (from Phase 5)

9. **TestimonialsSection2** (duplicate of #3)

10. **WhoProgramsSuitSection** (heading + 4 cards with image + description):
    - Same structure as WhyThisApproachSection

11. **PrinciplesSection** (heading + 5 descriptions + image):
    - TextInputField for heading (50 chars)
    - 5× TextInputField for descriptions (300 chars each)
    - ImageUploadField (1440×800px)

**Files to Create** (each section):
- src/components/admin/hippotherapy/sections/[section-name]/[SectionName].tsx
- src/components/admin/hippotherapy/sections/[section-name]/[SectionName].module.scss
- src/components/admin/hippotherapy/sections/[section-name]/[SectionName].test.tsx

**Total Files**: 33 files (11 sections × 3 files each)

**Dependencies**: Phase 4 (TextInputField, ImageUploadField), Phase 5 (ScientificReferencesSection)

**⚠️ Complexity**: This is the bulk of the work. Sections can be built in parallel once Phase 4/5 are complete.

---

### **Phase 7: Translation System** (Complex)
**Goal**: Build translation modals and gate logic  
**Estimated Effort**: 20 hours

**Tasks**:
1. Create `TranslationIcon` component:
   - Icon button per section (disabled if Ukrainian not published)
   - Opens appropriate modal variant based on section type
   - Props: sectionId, modalType, isUkrainianPublished, currentTranslation

2. Create 8 modal variants in `src/components/admin/hippotherapy/translation/`:
   - `Set1Modal` (heading + description): for WhatIsHippotherapy, WhatIsIpoventia, WhatTheApproachShows
   - `TestimonialsModal` (description + additional description): for Testimonials sections
   - `CenterIpoventiaModal` (heading + description + additional description): for CenterOfIpoventia
   - `Set2Modal` (heading + 4× readonly image + description): for WhyThisApproach, WhoProgramsSuit
   - `ResearchGeneralModal` (heading + description): for ScientificResearch section heading/description
   - `ResearchEntryModal` (name only): for individual scientific reference entries
   - `PrinciplesModal` (heading + 5× description): for Principles section
   - `TitleModal` (heading + description): for Title section (no image translation)

3. Create `useTranslationGate` hook:
   - Fetches isUkrainianPublished status per section
   - Returns gate state and enableTranslation function

4. Create `useTranslationModal` hook:
   - Manages modal open/close state
   - Loads current translation data
   - Handles save/cancel actions
   - Integrates with hippotherapy-translation-service

**Files to Create**:
- src/components/admin/hippotherapy/translation/TranslationIcon.tsx
- src/components/admin/hippotherapy/translation/TranslationIcon.module.scss
- src/components/admin/hippotherapy/translation/Set1Modal.tsx
- src/components/admin/hippotherapy/translation/TestimonialsModal.tsx
- src/components/admin/hippotherapy/translation/CenterIpoventiaModal.tsx
- src/components/admin/hippotherapy/translation/Set2Modal.tsx
- src/components/admin/hippotherapy/translation/ResearchGeneralModal.tsx
- src/components/admin/hippotherapy/translation/ResearchEntryModal.tsx
- src/components/admin/hippotherapy/translation/PrinciplesModal.tsx
- src/components/admin/hippotherapy/translation/TitleModal.tsx
- src/components/admin/hippotherapy/translation/[ModalName].module.scss (8 files)
- src/hooks/admin/hippotherapy/useTranslationGate.tsx
- src/hooks/admin/hippotherapy/useTranslationModal.tsx

**Total Files**: 18 files (8 modals × 2 files + 2 hooks)

**Dependencies**: Phase 3 (translation service), Phase 4 (TextInputField)

**⚠️ Complexity**: Modal variants share similar structure. Consider creating a base modal component to reduce duplication.

---

### **Phase 8: Main Page Integration** (Complex)
**Goal**: Assemble all components into the main admin page  
**Estimated Effort**: 10 hours

**Tasks**:
1. Create `HippotherapyAdminPage.tsx`:
   - Use `useFormManager` with hippotherapy schema
   - Fetch data on mount via `getHippotherapyData`
   - Render all 11 section components in order
   - Integrate PublishButton with form state
   - Handle save action (updateHippotherapySection for each dirty section)
   - Toast notifications for success/error states
   - Translation icons per section

2. Create `useHippotherapyAdmin` custom hook:
   - Encapsulates data fetching, form state, save logic
   - Returns section data, handlers, loading states
   - Manages dirty state tracking per section

**Files to Create**:
- src/pages/admin/hippotherapy/HippotherapyAdminPage.tsx
- src/pages/admin/hippotherapy/HippotherapyAdminPage.module.scss
- src/hooks/admin/hippotherapy/useHippotherapyAdmin.tsx

**Dependencies**: Phases 6 (sections), 7 (translations), 4 (PublishButton)

---

### **Phase 9: Routing & Navigation** (Simple)
**Goal**: Wire up the new page in the admin router  
**Estimated Effort**: 2 hours

**Tasks**:
1. Add route to `src/routes/app-router/AppRouter.tsx`:
   ```typescript
   <Route path="/admin-panel/hippotherapy" element={<PrivateRoute><HippotherapyAdminPage /></PrivateRoute>} />
   ```

2. Add navigation link in admin sidebar/header (if applicable)

3. Update `src/const/common/api-routes/main-api.ts` with hippotherapy endpoints

**Files to Modify**:
- src/routes/app-router/AppRouter.tsx
- src/const/common/api-routes/main-api.ts
- (Possibly admin navigation component if exists)

**Dependencies**: Phase 8 (page exists)

---

### **Phase 10: Localization Files** (Simple)
**Goal**: Add i18n translations for admin page UI  
**Estimated Effort**: 3 hours

**Tasks**:
1. Create `src/locales/uk/hippotherapyAdminPage.json`:
   - Section labels, field labels, button text, validation messages, modal text

2. Create `src/locales/en/hippotherapyAdminPage.json`:
   - English translations

**Files to Create**:
- src/locales/uk/hippotherapyAdminPage.json
- src/locales/en/hippotherapyAdminPage.json

**Dependencies**: Phases 4-8 (know what text needs translation)

---

### **Phase 11: Testing** (Medium-Complex)
**Goal**: Ensure quality and coverage  
**Estimated Effort**: 15 hours

**Tasks**:
1. Unit tests for utilities (Phase 2):
   - space-management.test.ts
   - validation-helpers.test.ts

2. Component tests for shared components (Phase 4):
   - TextInputField.test.tsx
   - ImageUploadField.test.tsx
   - PublishButton.test.tsx

3. Component tests for section components (Phase 6):
   - Test rendering, validation, state changes
   - Mock form context

4. Integration tests for main page (Phase 8):
   - Mock API responses
   - Test save flow, error handling, translation gate logic

**Test Files**: 40+ test files across components and utilities

**Dependencies**: Phases 2-8 (components exist)

**⚠️ Coverage Target**: 93%+ lines, 87%+ branches per project standards

---

## 📊 Complexity Estimates

| Phase | Complexity | Estimated Effort | Can Parallelize? |
|-------|-----------|------------------|------------------|
| 1. Foundation & Types | Simple | 4 hours | No (foundation) |
| 2. Utilities | Simple | 3 hours | After Phase 1 |
| 3. API Services | Medium | 6 hours | After Phase 1 |
| 4. Shared Components | Medium-Complex | 12 hours | After Phase 2 |
| 5. Scientific References | Medium | 8 hours | After Phase 4 |
| 6. Section Components | Complex | 25 hours | After Phase 4/5 (can build sections in parallel) |
| 7. Translation System | Complex | 20 hours | After Phase 3/4 |
| 8. Main Page Integration | Complex | 10 hours | After Phase 6/7 |
| 9. Routing & Navigation | Simple | 2 hours | After Phase 8 |
| 10. Localization Files | Simple | 3 hours | Anytime after Phase 4 |
| 11. Testing | Medium-Complex | 15 hours | After each phase (ongoing) |

**Total Estimated Effort**: ~108 hours (13-14 days for 1 developer)

---

## ⚠️ Risks & Unknowns

### High Risk
1. **Backend API Availability**: Hippotherapy endpoints may not exist yet
   - **Mitigation**: Start with mock data/services, create API contract document for backend team
   - **Impact**: Could delay Phase 3+ by days if backend development is needed

2. **ImageCropper Integration**: Existing cropper may not handle all required aspect ratios (1440×660, 1400×800, 360×430, 1440×420, 1440×800)
   - **Mitigation**: Test cropper early in Phase 4, may need to extend component
   - **Impact**: Medium - could add 5-8 hours to Phase 4

### Medium Risk
3. **Character Counter UX**: No existing pattern for live character counters with validation
   - **Mitigation**: Design simple counter UI (e.g., "45/50" below field), review with team
   - **Impact**: Low - mostly cosmetic, 2-3 hours to iterate

4. **Translation Modal Complexity**: 8 different modal variants may have overlapping logic
   - **Mitigation**: Create base modal component with configurable fields to reduce duplication
   - **Impact**: Medium - could save 10-15 hours in Phase 7 if done right

5. **Rich Text Toolbar Integration**: Lexical toolbar may conflict with character limits
   - **Mitigation**: Test early, may need to count plain text length vs formatted
   - **Impact**: Low-Medium - 3-5 hours to handle edge cases

### Low Risk
6. **Form State Management**: Tracking dirty state across 11 sections may get complex
   - **Mitigation**: Use React Hook Form's isDirty per field, aggregate in custom hook
   - **Impact**: Low - existing pattern handles this

7. **Space Management Performance**: Cleaning text on every blur may cause lag on slow devices
   - **Mitigation**: Debounce or only clean on save if needed
   - **Impact**: Low - edge case, 1-2 hours to optimize

---

## 🔄 Parallel Work Opportunities

### Can Build Concurrently (after dependencies met):
- **Phase 6 (Sections)**: Once Phase 4/5 are done, all 11 section components can be built in parallel by multiple developers
- **Phase 7 (Translations)**: Can start after Phase 3/4, doesn't block Phase 6
- **Phase 10 (Localization)**: Can start anytime after Phase 4, doesn't block other work
- **Phase 11 (Testing)**: Ongoing after each phase completes

### Sequential (must wait):
- Phase 1 → Phase 2 → Phase 4 (foundation)
- Phase 3 (services) depends on Phase 1 (types)
- Phase 8 (main page) depends on Phase 6/7 completing
- Phase 9 (routing) depends on Phase 8

### Suggested Team Split (if 3 developers):
- **Dev 1**: Phases 1-3 (foundation, types, services) → Phase 8 (main page integration)
- **Dev 2**: Phases 4-5 (shared components, scientific references) → Phase 6 (sections 1-5)
- **Dev 3**: Phase 6 (sections 6-11) → Phase 7 (translation system)
- **All**: Phase 11 (testing their own work)

---

## ✅ Definition of Done

### Functional Requirements
- All 11 content sections render and accept input with validation
- Character counters display live feedback
- Space management prevents invalid input patterns
- Images upload, crop, validate dimensions, and delete with confirmation
- Scientific references support CRUD operations with collapsible UI
- Translation icons gate correctly based on Ukrainian publish status
- All 8 translation modal variants open and save correctly
- Publish button enables/disables based on validation + dirty state
- Success/error toasts display for save operations
- Form persists data via API (or mocks if backend not ready)

### Technical Requirements
- 93%+ line coverage, 87%+ branch coverage
- No ESLint warnings (max 10 allowed)
- Prettier formatted
- TypeScript strict mode passes
- All imports use `@/*` path aliases
- Responsive design (mobile + desktop)
- i18n works for UK/EN locales

### User Acceptance
- Admin can edit all hippotherapy content fields
- Admin can translate content to English after publishing Ukrainian
- Admin sees validation errors on blur with helpful messages
- Admin can upload/delete images with visual feedback
- Admin can add/edit/delete scientific references dynamically
- Unsaved changes are indicated (dirty state)
- Save operation shows loading state + success confirmation

---

## 🚀 Recommended Start

### Immediate Next Steps
1. **Confirm backend API status**: Check with backend team if hippotherapy endpoints exist or need to be built
2. **Create mock API responses**: Document expected data structures and create mock responses for Phase 3 development
3. **Design character counter UI**: Quick mockup/wireframe for TextInputField with counter
4. **Test ImageCropper**: Verify it can handle all required aspect ratios (5 different sizes)
5. **Set up branch**: Create feature branch following project conventions (e.g., `feature/hippotherapy-admin`)

### First Sprint (Week 1)
- Complete Phases 1-3 (foundation, types, utilities, services with mocks)
- Complete Phase 4 (shared components) and test ImageCropper integration
- Start Phase 10 (localization files) since it doesn't block other work

### Second Sprint (Week 2)
- Complete Phase 5 (scientific references)
- Start Phase 6 (section components) - prioritize simpler sections first
- Parallel: Start Phase 7 (translation system)

---

## 📁 File Structure Overview

```
src/pages/admin/hippotherapy/
├── HippotherapyAdminPage.tsx
├── HippotherapyAdminPage.module.scss
├── components/
│   ├── sections/
│   │   ├── title-section/
│   │   ├── what-is-hippotherapy-section/
│   │   ├── testimonials-section/
│   │   ├── what-is-ipoventia-section/
│   │   ├── center-of-ipoventia-section/
│   │   ├── why-this-approach-section/
│   │   ├── what-the-approach-shows-section/
│   │   ├── scientific-research-section/
│   │   ├── who-programs-suit-section/
│   │   └── principles-section/
│   ├── translation/
│   │   ├── TranslationIcon.tsx
│   │   ├── Set1Modal.tsx
│   │   ├── TestimonialsModal.tsx
│   │   ├── CenterIpoventiaModal.tsx
│   │   ├── Set2Modal.tsx
│   │   ├── ResearchGeneralModal.tsx
│   │   ├── ResearchEntryModal.tsx
│   │   ├── PrinciplesModal.tsx
│   │   └── TitleModal.tsx
│   └── shared/
│       ├── text-input-field/
│       ├── image-upload-field/
│       ├── publish-button/
│       └── confirmation-modal/
├── hooks/
│   ├── useHippotherapyAdmin.tsx
│   ├── useTranslationGate.tsx
│   └── useTranslationModal.tsx
├── services/
│   ├── hippotherapy-admin-service.ts
│   └── hippotherapy-translation-service.ts
├── types/
│   └── hippotherapy.types.ts
├── utils/
│   ├── space-management.ts
│   └── validation-helpers.ts
└── validation/
    └── hippotherapy-schema.ts
```

---

This plan provides a structured approach while acknowledging the complexity and risks. The key is to build the foundation (Phases 1-4) solidly so that the bulk of the work (sections and translations) can proceed efficiently and in parallel.
