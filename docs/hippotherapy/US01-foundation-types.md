# US01: Foundation & Types Setup

## User Story
**As a** developer  
**I want** to set up the foundation types, interfaces, and constants for the Hippotherapy admin page  
**So that** all subsequent components have a consistent data structure and validation rules to work with

## Acceptance Criteria
- [ ] All TypeScript interfaces are defined for Hippotherapy data structures
- [ ] Constants for validation rules are centralized and reusable
- [ ] Section configurations are defined with consistent structure
- [ ] Translation modal type mappings are established
- [ ] Yup validation schema is complete and tested
- [ ] All types compile without errors in TypeScript strict mode
- [ ] Code follows existing project patterns from programs/team pages

## Technical Details

### Files to Create
1. **src/types/admin/hippotherapy.types.ts**
   - `HippotherapySection` (base interface)
   - `HippotherapySectionWithImage` (extends base + image)
   - `HippotherapyCard` (for card-based sections)
   - `ScientificReference` interface
   - `TranslationModalType` enum
   - `HippotherapyData` (aggregate type)
   - `ImageData` interface
   - `TranslationState` interface

2. **src/const/admin/hippotherapy/validation-rules.ts**
   ```typescript
   export const VALIDATION_RULES = {
     HEADING_MAX_CHARS: 50,
     HEADING_MIN_CHARS: 5,
     DESCRIPTION_MAX_CHARS_SHORT: 100,
     DESCRIPTION_MAX_CHARS_MEDIUM: 300,
     DESCRIPTION_MAX_CHARS_LONG: 1000,
     DESCRIPTION_MIN_CHARS: 10,
     ADDITIONAL_DESC_MAX_CHARS: 50,
     ADDITIONAL_DESC_MIN_CHARS: 10,
     REFERENCE_NAME_MAX_CHARS: 150,
     REFERENCE_NAME_MIN_CHARS: 5,
     REFERENCE_LINK_MAX_CHARS: 1000,
     REFERENCE_LINK_MIN_CHARS: 5,
     IMAGE_MAX_SIZE_MB: 5,
     ALLOWED_IMAGE_FORMATS: ['jpeg', 'jpg', 'png', 'webp']
   };
   
   export const IMAGE_DIMENSIONS = {
     TITLE_HERO: { width: 1440, height: 660 },
     CENTER_IPOVENTIA: { width: 1440, height: 420 },
     TESTIMONIALS: { width: 1400, height: 800 },
     CARD: { width: 360, height: 430 },
     PRINCIPLES: { width: 1440, height: 800 }
   };
   ```

3. **src/const/admin/hippotherapy/section-configs.ts**
   ```typescript
   export const SECTION_IDS = {
     TITLE: 'title',
     WHAT_IS_HIPPOTHERAPY: 'whatIsHippotherapy',
     TESTIMONIALS_1: 'testimonials1',
     WHAT_IS_IPOVENTIA: 'whatIsIpoventia',
     CENTER_IPOVENTIA: 'centerIpoventia',
     WHY_THIS_APPROACH: 'whyThisApproach',
     WHAT_APPROACH_SHOWS: 'whatApproachShows',
     SCIENTIFIC_RESEARCH: 'scientificResearch',
     TESTIMONIALS_2: 'testimonials2',
     WHO_PROGRAMS_SUIT: 'whoProgramsSuit',
     PRINCIPLES: 'principles'
   };
   ```

4. **src/const/admin/hippotherapy/translation-modal-types.ts**
   ```typescript
   export enum TranslationModalType {
     SET1 = 'set1', // heading + description
     TITLE = 'title', // heading + description (no image)
     TESTIMONIALS = 'testimonials', // description + additional
     CENTER_IPOVENTIA = 'centerIpoventia', // heading + desc + additional
     SET2 = 'set2', // heading + 4× (image + description)
     RESEARCH_GENERAL = 'researchGeneral', // heading + description
     RESEARCH_ENTRY = 'researchEntry', // name only
     PRINCIPLES = 'principles' // heading + 5× description
   }
   ```

5. **src/validation/admin/hippotherapy-schema.ts**
   - Yup schema following pattern from `program-schema.ts`
   - Per-field validation with min/max character limits
   - Nested validation for cards and references arrays
   - URL format validation for reference links
   - Required field validation

### Example Interface Structure
```typescript
export interface HippotherapyData {
  title: {
    heading: string;
    description: string;
    image: ImageData;
  };
  whatIsHippotherapy: {
    heading: string;
    description: string;
  };
  testimonials1: {
    description: string;
    additionalDescription: string;
    image: ImageData;
  };
  // ... other sections
  scientificResearch: {
    heading: string;
    description: string;
    references: ScientificReference[];
  };
}

export interface ScientificReference {
  id: string;
  name: string;
  link: string;
  isExpanded: boolean;
}

export interface ImageData {
  url: string | null;
  isDefault: boolean;
}
```

## Dependencies
- None (foundation layer)

## Estimated Effort
**4 hours**

## Testing Requirements
- Validation schema unit tests
- Type checking passes in strict mode
- Constants are properly exported and importable

## Definition of Done
- All types compile without errors
- Validation schema covers all fields with correct rules
- Constants match specification requirements
- Code review completed
- No ESLint warnings
