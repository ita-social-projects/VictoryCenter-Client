# Epic Splitter - Improved Two-Level Structure Example

## Based on BA Feedback

This example shows the improved epic splitter output based on feedback from the Business Analyst:

### Key Improvements:
1. **Two-level story structure**: Business stories (BS) for stakeholders + Technical stories (TS) for developers
2. **MAPPING document**: Links business goals to technical implementation
3. **Test cases**: Included in every story
4. **Granular splitting**: Large components broken into sprint-sized deliverables

---

## Example: Hippotherapy Feature (Improved)

### Original Problem
The original split had **US08: Section Components (11 Sections)** as a single 25-hour story. This was:
- ❌ Too large to complete in one sprint
- ❌ Nothing to demo until all 11 sections complete
- ❌ No clear business value per sprint
- ❌ Difficult to assign and track

### Improved Solution
Split into **11 business stories** (one per section) with supporting technical stories.

---

## Output Structure

```
docs/hippotherapy/
├── README.md                              # Epic overview
├── MAPPING.md                             # BS → TS mapping
├── business-stories/
│   ├── BS01-title-section.md            # Sprint 1 (21h)
│   ├── BS02-testimonials-section.md     # Sprint 2 (18h)
│   ├── BS03-what-is-hippotherapy.md     # Sprint 3 (15h)
│   ├── BS04-ipoventia-section.md        # Sprint 4 (19h)
│   ├── BS05-approach-section.md         # Sprint 5 (22h)
│   └── ...                              # 11 total business stories
└── technical-stories/
    ├── TS01-foundation-types.md         # Foundation (4h)
    ├── TS02-validation-utils.md         # Foundation (3h)
    ├── TS03-api-service-base.md         # Foundation (6h)
    ├── TS04-text-input-component.md     # Shared (4h)
    ├── TS05-image-upload-component.md   # Shared (5h)
    ├── TS06-title-section-component.md  # BS01 (4h)
    ├── TS07-title-api-integration.md    # BS01 (4h)
    ├── TS08-title-tests.md              # BS01 (3h)
    └── ...                              # ~35 technical stories
```

---

## Sample Business Story

### BS01-title-section.md

```markdown
# BS01: Title Section Content Management

## User Story
**As an** admin user  
**I want** to manage the hippotherapy page title section (heading, description, hero image)  
**So that** I can control what visitors see when they first land on the hippotherapy page

## Business Value
The title section is the first impression for website visitors. Being able to update the heading, description, and hero image allows the marketing team to:
- Quickly update messaging for campaigns
- A/B test different headlines
- Refresh visual content seasonally
- Maintain brand consistency

## Acceptance Criteria
- [ ] Admin can edit title heading (max 50 characters)
- [ ] Admin can edit title description (max 300 characters)
- [ ] Admin can upload a hero image (1440×660px minimum)
- [ ] Admin can preview changes before publishing
- [ ] Admin can publish Ukrainian version
- [ ] Changes appear immediately on public site after publish
- [ ] Character counters show remaining space while typing
- [ ] Validation prevents publishing with empty required fields

## Sprint Demo Scenario
**Demo Flow**:
1. Open admin panel → Hippotherapy page
2. Edit title heading: "Іпотерапія в Центрі Перемоги"
3. Edit description: "Реабілітація через взаємодію з конем..."
4. Upload new hero image (show cropping interface)
5. Click "Preview" to see changes
6. Click "Publish" to make live
7. Open public site → Show updated title section

**Success Criteria**: Marketing team can independently update title section without developer help.

## Test Scenarios

### Scenario 1: Happy Path - Edit and Publish
**Given** I am logged in as admin  
**When** I edit the title heading to "Нова назва"  
**And** I edit the description  
**And** I upload a new image  
**And** I click "Publish"  
**Then** I see success confirmation  
**And** The public site shows my changes immediately

### Scenario 2: Validation - Character Limit
**Given** I am editing the title heading  
**When** I type 51 characters  
**Then** I see a validation error  
**And** The publish button is disabled  
**And** Character counter shows "51/50" in red

### Scenario 3: Edge Case - Image Upload Failure
**Given** I try to upload an image under 1440×660px  
**Then** I see an error "Image must be at least 1440×660px"  
**And** The old image remains unchanged  
**And** I can try again with a different image

### Scenario 4: Navigation - Unsaved Changes
**Given** I have edited the title but not published  
**When** I try to navigate away  
**Then** I see a confirmation dialog "Discard unsaved changes?"  
**And** I can choose to stay or discard

## Technical Implementation
This business story is implemented by the following technical stories:

- **TS01**: Foundation types for hippotherapy (4h) - *Prerequisite*
- **TS02**: Validation utilities (3h) - *Prerequisite*
- **TS04**: Text input component with character counter (4h) - *Prerequisite*
- **TS05**: Image upload component (5h) - *Prerequisite*
- **TS06**: Title section component (4h) - *BS01 specific*
- **TS07**: Title section API integration (4h) - *BS01 specific*
- **TS08**: Title section test coverage (3h) - *BS01 specific*

**Total Effort**: 21 hours (includes 16h of prerequisites that support multiple sections)

## Sprint Goal
By the end of Sprint 1, the admin panel has a fully functional title section editor, and admins can independently update the hippotherapy page header without developer assistance.

## Dependencies
**Business Dependencies**: None (this is the first section to implement)

**Technical Prerequisites**: 
- Backend API endpoint `/api/admin/hippotherapy/title` must exist
- Image storage service configured

## Notes for PO
- The foundation work (TS01-TS05) will accelerate future sections
- Once this sprint is complete, other sections follow the same pattern faster
- Consider doing user acceptance testing mid-sprint after TS06 is complete
```

---

## Sample Technical Story

### TS06-title-section-component.md

```markdown
# TS06: Title Section Component

## Implements
**Business Story**: BS01 - Title Section Content Management

## Technical Goal
Build the React component for the title section in the hippotherapy admin page. This component orchestrates the text inputs and image upload for the title section, handles form state, and integrates with the publish workflow.

## Acceptance Criteria
- [ ] Component renders with title heading, description, and image upload fields
- [ ] Uses TextInputField component for heading (50 char limit)
- [ ] Uses TextInputField component for description (300 char limit)
- [ ] Uses ImageUploadField component for hero image (1440×660px)
- [ ] Form validation prevents publishing with invalid data
- [ ] Character counters update in real-time
- [ ] Dirty state tracked (shows unsaved changes indicator)
- [ ] Preview functionality works
- [ ] Publish button triggers save with success/error toast
- [ ] TypeScript strict mode passes
- [ ] No ESLint warnings

## Implementation Details

### Files to Create
```
src/components/admin/hippotherapy/sections/title-section/
├── TitleSection.tsx
├── TitleSection.module.scss
├── TitleSection.test.tsx
└── index.ts
```

### Files to Modify
None (new component)

### Code Structure

```typescript
// TitleSection.tsx
import React from 'react';
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { TextInputField } from '@/components/admin/hippotherapy/shared/text-input-field';
import { ImageUploadField } from '@/components/admin/hippotherapy/shared/image-upload-field';
import { PublishButton } from '@/components/admin/hippotherapy/shared/publish-button';
import { titleSectionSchema } from '@/validation/admin/hippotherapy-schema';
import { VALIDATION_RULES, IMAGE_DIMENSIONS } from '@/const/admin/hippotherapy/validation-rules';
import styles from './TitleSection.module.scss';

export interface TitleSectionProps {
  initialData: TitleSectionData;
  onPublish: (data: TitleSectionData) => Promise<void>;
}

export const TitleSection: React.FC<TitleSectionProps> = ({ 
  initialData, 
  onPublish 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    watch
  } = useFormManager({
    schema: titleSectionSchema,
    defaultValues: initialData
  });

  const heading = watch('heading');
  const description = watch('description');

  const onSubmit = async (data: TitleSectionData) => {
    try {
      await onPublish(data);
    } catch (error) {
      console.error('Failed to publish title section:', error);
    }
  };

  return (
    <div className={styles.titleSection}>
      <h2>Title Section</h2>
      
      <TextInputField
        label="Heading"
        {...register('heading')}
        maxChars={VALIDATION_RULES.HEADING_MAX_CHARS}
        error={errors.heading?.message}
        required
      />

      <TextInputField
        label="Description"
        {...register('description')}
        maxChars={VALIDATION_RULES.DESCRIPTION_MAX_CHARS_MEDIUM}
        multiline
        rows={4}
        error={errors.description?.message}
        required
      />

      <ImageUploadField
        currentImageUrl={initialData.image?.url}
        onImageChange={(base64) => setValue('image', { url: base64, isDefault: false })}
        minWidth={IMAGE_DIMENSIONS.TITLE_HERO.width}
        minHeight={IMAGE_DIMENSIONS.TITLE_HERO.height}
        aspectRatio={IMAGE_DIMENSIONS.TITLE_HERO.width / IMAGE_DIMENSIONS.TITLE_HERO.height}
        error={errors.image?.message}
      />

      <PublishButton
        isValid={isValid}
        isDirty={isDirty}
        onPublish={handleSubmit(onSubmit)}
      />
    </div>
  );
};
```

### SCSS Styling
```scss
// TitleSection.module.scss
.titleSection {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: var(--color-background-paper);
  border-radius: 8px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}
```

## Test Cases

### Unit Tests (TitleSection.test.tsx)

```typescript
describe('TitleSection', () => {
  const mockInitialData = {
    heading: 'Test Heading',
    description: 'Test Description',
    image: { url: 'http://example.com/image.jpg', isDefault: false }
  };

  test('renders with initial data', () => {
    render(<TitleSection initialData={mockInitialData} onPublish={jest.fn()} />);
    
    expect(screen.getByLabelText('Heading')).toHaveValue('Test Heading');
    expect(screen.getByLabelText('Description')).toHaveValue('Test Description');
  });

  test('shows character counter for heading', () => {
    render(<TitleSection initialData={mockInitialData} onPublish={jest.fn()} />);
    
    expect(screen.getByText('12/50')).toBeInTheDocument();
  });

  test('publish button disabled when form invalid', async () => {
    render(<TitleSection initialData={{...mockInitialData, heading: ''}} onPublish={jest.fn()} />);
    
    const publishBtn = screen.getByRole('button', { name: /publish/i });
    expect(publishBtn).toBeDisabled();
  });

  test('calls onPublish with form data', async () => {
    const mockOnPublish = jest.fn();
    render(<TitleSection initialData={mockInitialData} onPublish={mockOnPublish} />);
    
    fireEvent.click(screen.getByRole('button', { name: /publish/i }));
    
    await waitFor(() => {
      expect(mockOnPublish).toHaveBeenCalledWith(mockInitialData);
    });
  });

  test('shows validation error for heading over 50 chars', async () => {
    render(<TitleSection initialData={mockInitialData} onPublish={jest.fn()} />);
    
    const input = screen.getByLabelText('Heading');
    fireEvent.change(input, { target: { value: 'a'.repeat(51) } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.getByText(/maximum 50 characters/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Tests
- Test form submission flow with mocked API
- Test dirty state tracking and navigation warnings
- Test image upload integration with ImageUploadField

## Dependencies

**Technical Dependencies**:
- **TS01**: Foundation types (must complete first) - provides `TitleSectionData` type
- **TS02**: Validation utilities (must complete first) - provides `titleSectionSchema`
- **TS04**: TextInputField component (must complete first)
- **TS05**: ImageUploadField component (must complete first)

**Business Context**: 
This technical story is part of **BS01: Title Section Content Management**. It's the core component that ties together the shared inputs (TS04, TS05) to deliver the business value.

## Estimated Effort
**4 hours**
- 1.5h: Component implementation
- 1h: Styling and responsive design
- 1h: Unit tests (5-6 test cases)
- 0.5h: Integration testing and fixes

## Technical Notes

### Patterns to Follow
- Follow the form management pattern from `src/pages/admin/programs/ProgramsPage.tsx`
- Use `useFormManager` hook (wraps React Hook Form)
- Character counters update on every keystroke (controlled inputs)
- Use `isDirty` to show unsaved changes indicator

### Architecture Decisions
- Component is controlled (no internal state for form values)
- Parent page handles API calls via `onPublish` callback
- Validation happens at schema level (Yup), not component level
- Image stored as base64 in form, converted to URL on server

### Performance Considerations
- Image preview uses memo to avoid re-renders
- Character counter uses watch() not re-render on every change
- Debounce validation if performance issues arise

### Risks & Mitigation
- **Risk**: Large base64 images may cause form state bloat
  - **Mitigation**: Consider storing image separately, only passing URL to form
- **Risk**: Character counter may not handle Unicode correctly
  - **Mitigation**: Use `[...value].length` instead of `value.length`

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (90%+ coverage for component logic)
- [ ] Integration test with form manager passing
- [ ] Component renders correctly in Storybook (if using)
- [ ] Code reviewed and approved
- [ ] No TypeScript errors in strict mode
- [ ] No ESLint warnings
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility checked (keyboard navigation, screen readers)
- [ ] Documentation updated (component props documented)
```

---

## Sample MAPPING Document

### MAPPING.md

```markdown
# Hippotherapy Feature - Business to Technical Story Mapping

## Purpose
This document maps business stories (for PO/stakeholders) to technical implementation (for developers).

**For Product Owner**: See what business value each sprint delivers  
**For Developers**: See which technical work supports each business goal  
**For New Team Members**: Understand feature through business context → technical tasks

---

## Sprint Overview

| Sprint | Business Story | Sprint Goal | Total Hours | Technical Stories |
|--------|----------------|-------------|-------------|-------------------|
| Sprint 1 | BS01: Title Section | Admin manages title section | 21h | TS01-TS08 |
| Sprint 2 | BS02: Testimonials | Admin manages testimonials | 18h | TS09-TS14 |
| Sprint 3 | BS03: What is Hippotherapy | Admin manages intro section | 15h | TS15-TS19 |
| Sprint 4 | BS04: Ipoventia Section | Admin manages ipoventia content | 19h | TS20-TS25 |
| ... | ... | ... | ... | ... |

**Total**: 11 Sprints, 11 Business Stories, ~35 Technical Stories, ~180 hours

---

## Detailed Mapping

### Sprint 1: Title Section Management

#### BS01: Title Section Content Management (21 hours)
**Business Value**: Marketing team can independently update the hippotherapy page title, tagline, and hero image

**Sprint Demo**: Admin edits title heading, description, uploads new hero image, publishes changes, and shows updated public site

**Technical Implementation**:
```
BS01 (21h)
├── Foundation (Prerequisite - Supports ALL Sections)
│   ├── TS01: Foundation types (4h)
│   │   └── Creates: types/admin/hippotherapy.types.ts
│   ├── TS02: Validation utilities (3h)
│   │   └── Creates: utils/functions/admin/hippotherapy/validation-helpers.ts
│   └── TS03: API service base (6h)
│       └── Creates: services/api/admin/hippotherapy-service.ts
│
├── Shared Components (Prerequisite - Supports Multiple Sections)
│   ├── TS04: Text input component (4h)
│   │   └── Creates: components/admin/hippotherapy/shared/text-input-field/
│   └── TS05: Image upload component (5h)
│       └── Creates: components/admin/hippotherapy/shared/image-upload-field/
│
└── Title-Specific (Delivers BS01 Value)
    ├── TS06: Title section component (4h)
    │   └── Creates: components/admin/hippotherapy/sections/title-section/
    ├── TS07: Title API integration (4h)
    │   └── Modifies: services/api/admin/hippotherapy-service.ts (add title endpoints)
    └── TS08: Title section tests (3h)
        └── Creates: Test files for title section component

Total: 21 hours (16h prerequisite + 11h specific = overlaps because prerequisites support multiple BS)
```

**Test Coverage**:
- User acceptance: Admin can edit, preview, publish title section
- Unit tests: Title component validation, character counters
- Integration tests: API calls, form submission, image upload

**Dependencies**: 
- Backend: `/api/admin/hippotherapy/title` endpoint must exist
- Design: Title section mockup finalized

---

### Sprint 2: Testimonials Section Management

#### BS02: Testimonials Section Content Management (18 hours)
**Business Value**: Admin can manage testimonials section (description, additional description, image)

**Sprint Demo**: Admin edits testimonials content, uploads testimonials image, publishes, shows on public site

**Technical Implementation**:
```
BS02 (18h)
├── Reuses Foundation (Already Complete from Sprint 1)
│   ├── TS01: Foundation types ✓
│   ├── TS02: Validation utilities ✓
│   └── TS03: API service base ✓
│
├── Reuses Shared Components (Already Complete from Sprint 1)
│   ├── TS04: Text input component ✓
│   └── TS05: Image upload component ✓
│
└── Testimonials-Specific (New Work for BS02)
    ├── TS09: Testimonials section component (4h)
    │   └── Creates: components/admin/hippotherapy/sections/testimonials-section/
    ├── TS10: Testimonials API integration (3h)
    │   └── Modifies: services/api/admin/hippotherapy-service.ts (add testimonials endpoints)
    └── TS11: Testimonials tests (3h)
        └── Creates: Test files for testimonials section

Total: 10 hours of new work (reuses 16h from Sprint 1)
Sprint Velocity: 18 hours (includes 8h of prerequisite refactoring/hardening)
```

**Acceleration**: Sprint 2 is faster because it reuses foundation from Sprint 1!

---

## Foundation Stories (Support Multiple Business Stories)

These technical stories are prerequisites that accelerate multiple business stories:

| Technical Story | Hours | Supports Business Stories | Purpose |
|-----------------|-------|---------------------------|---------|
| TS01: Foundation types | 4h | BS01-BS11 (ALL) | TypeScript interfaces for all sections |
| TS02: Validation utilities | 3h | BS01-BS11 (ALL) | Reusable validation functions |
| TS03: API service base | 6h | BS01-BS11 (ALL) | Base Axios client and common API logic |
| TS04: Text input component | 4h | BS01, BS02, BS03, BS04, BS05, BS06, BS07, BS09, BS11 | Reusable text field with character counter |
| TS05: Image upload component | 5h | BS01, BS02, BS04, BS05, BS09, BS11 | Reusable image uploader with cropper |

**Investment**: 22 hours of foundation work  
**Return**: Accelerates 11 business stories (saves ~50+ hours of duplication)

---

## Dependency Graph

### Business Story Dependencies
```
BS01 (Title) → BS02 (Testimonials) → BS03 (What is Hippotherapy)
                                     ↓
                                    BS04 (Ipoventia)
                                     ↓
                                    BS05 (Why This Approach)
                                     ↓
                                    ... (remaining sections)
```

Each business story depends on the previous sprint completing so the team learns patterns and accelerates.

### Technical Story Dependencies
```
TS01 (Types)
  ├→ TS02 (Validation)
  ├→ TS03 (API Base)
  ├→ TS04 (Text Input) ──→ TS06 (Title Component)
  ├→ TS05 (Image Upload) ─┘                │
  │                                        ↓
  │                                   TS07 (Title API) ──→ TS08 (Title Tests)
  │
  ├→ TS09 (Testimonials Component) ──→ TS10 (Testimonials API) ──→ TS11 (Testimonials Tests)
  │
  └→ ... (continues for all sections)
```

Foundation stories (TS01-TS05) must complete first. Section-specific stories can run in parallel across different sections if multiple developers available.

---

## Team Allocation (3 Developers)

### Sprint 1
- **Dev 1**: TS01-TS03 (Foundation) → TS06 (Title Component)
- **Dev 2**: TS04 (Text Input) → TS05 (Image Upload) → TS07 (Title API)
- **Dev 3**: Help with TS04-TS05 → TS08 (Title Tests)

### Sprint 2+
- **Dev 1, 2, 3**: Each takes one section (parallel development)
- Foundation complete, so each developer can work independently

---

## Progress Tracking

### Business Stories
- [ ] BS01: Title Section (Sprint 1)
- [ ] BS02: Testimonials Section (Sprint 2)
- [ ] BS03: What is Hippotherapy (Sprint 3)
- [ ] BS04: Ipoventia Section (Sprint 4)
- [ ] BS05: Why This Approach (Sprint 5)
- [ ] BS06: What Approach Shows (Sprint 6)
- [ ] BS07: Scientific Research (Sprint 7)
- [ ] BS08: Who Programs Suit (Sprint 8)
- [ ] BS09: Principles Section (Sprint 9)
- [ ] BS10: Translation System (Sprint 10)
- [ ] BS11: Testing & Polish (Sprint 11)

### Technical Stories
- [ ] TS01-TS08: Sprint 1 (Title Section)
- [ ] TS09-TS14: Sprint 2 (Testimonials)
- [ ] ... (continues)

---

## Questions?

**For PO**: "Which sprint delivers feature X?" → Check business stories section  
**For Developers**: "What technical work supports BS04?" → Check detailed mapping for BS04  
**For Planning**: "Can we parallelize work?" → Yes, after foundation (TS01-TS05) complete

```

---

## Key Benefits of This Approach

### For Product Owner
✅ Clear business value per sprint  
✅ Non-technical language in business stories  
✅ Can track progress without understanding implementation  
✅ Easy to prioritize or descope business stories  

### For Developers
✅ Full technical context via technical stories  
✅ Clear mapping shows how work supports business goals  
✅ Granular tasks (4-25h) easier to estimate and complete  
✅ Foundation work identified and reused  

### For Sprint Planning
✅ Each business story = one sprint = demo-ready value  
✅ Effort estimates realistic and traceable  
✅ Dependencies clear at both levels  
✅ Team can see acceleration after foundation complete  

### For Onboarding
✅ New developers: Business story → MAPPING → Technical tasks  
✅ Understand "why" before "how"  
✅ Context preserved in both business and technical layers  

---

## Comparison: Old vs New

### Old Approach (Single-Level)
```
docs/hippotherapy/
├── README.md
├── US01-foundation.md (4h)
├── US02-utilities.md (3h)
├── US03-api-services.md (6h)
├── US04-text-input.md (4h)
├── US05-image-upload.md (5h)
├── US06-shared-components.md (3h)
├── US07-scientific-references.md (8h)
├── US08-section-components.md (25h) ← TOO LARGE!
├── US09-translation-system.md (20h)
├── US10-main-page-integration.md (10h)
├── US11-routing.md (3h)
└── US12-testing.md (15h)
```

**Problems**:
- ❌ US08 too large (25h = all 11 sections in one story)
- ❌ No clear sprint-sized deliverables
- ❌ PO sees technical tasks, not business value
- ❌ Nothing to demo until US08 complete
- ❌ Developer doesn't see business context

### New Approach (Two-Level)
```
docs/hippotherapy/
├── README.md
├── MAPPING.md ← NEW!
├── business-stories/ ← NEW!
│   ├── BS01-title-section.md (21h, Sprint 1)
│   ├── BS02-testimonials-section.md (18h, Sprint 2)
│   ├── BS03-what-is-hippotherapy.md (15h, Sprint 3)
│   └── ... (11 business stories, one per sprint)
└── technical-stories/ ← NEW!
    ├── TS01-foundation-types.md (4h)
    ├── TS02-validation-utils.md (3h)
    ├── TS03-api-service.md (6h)
    ├── TS04-text-input.md (4h)
    ├── TS05-image-upload.md (5h)
    ├── TS06-title-component.md (4h)
    ├── TS07-title-api.md (4h)
    ├── TS08-title-tests.md (3h)
    └── ... (35 technical stories, granular 3-8h each)
```

**Benefits**:
- ✅ 11 business stories (one per section, sprint-sized)
- ✅ 35 technical stories (granular, 3-8h each)
- ✅ MAPPING shows business ↔ technical linkage
- ✅ PO works with business stories only
- ✅ Developer sees full technical scope + business context
- ✅ Demo-ready value every sprint
- ✅ Foundation work identified and reused

---

**This improved structure addresses all BA feedback and creates a better experience for both business stakeholders and technical team members!**
