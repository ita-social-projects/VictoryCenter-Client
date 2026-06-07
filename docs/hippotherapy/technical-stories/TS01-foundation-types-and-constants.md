# TS01: Foundation Types and Constants

## Implements
**Business Story**: Foundation for BS01-BS11

## Technical Goal
Create TypeScript types, interfaces, and constants that define the data structures and validation rules for the hippotherapy admin feature.

## Acceptance Criteria
- [ ] All TypeScript types are defined in `src/types/admin/hippotherapy.types.ts`
- [ ] Types follow project naming conventions (PascalCase)
- [ ] Validation constants are defined in `src/const/admin/hippotherapy/`
- [ ] Section configuration constants are defined
- [ ] All types are exported with named exports
- [ ] No TypeScript errors or warnings
- [ ] Types are documented with JSDoc comments

## Implementation Details

### Files to Create
- `src/types/admin/hippotherapy.types.ts`
- `src/const/admin/hippotherapy/validation-rules.ts`
- `src/const/admin/hippotherapy/section-configs.ts`
- `src/const/admin/hippotherapy/index.ts`

### Code Structure

**src/types/admin/hippotherapy.types.ts**
```typescript
/**
 * Base section with heading and description
 */
export interface HippotherapySection {
  id: string;
  heading: string;
  description: string;
}

/**
 * Section with image support
 */
export interface HippotherapySectionWithImage extends HippotherapySection {
  image: ImageData;
}

/**
 * Image data structure
 */
export interface ImageData {
  url: string | null;
  isDefault: boolean;
}

/**
 * Card for Why This Approach and Who Programs Suit sections
 */
export interface HippotherapyCard {
  id: string;
  image: ImageData;
  description: string;
}

/**
 * Scientific research reference entry
 */
export interface ScientificReference {
  id: string;
  name: string;
  link: string;
  isExpanded: boolean;
}

/**
 * Complete hippotherapy page data
 */
export interface HippotherapyData {
  title: HippotherapySectionWithImage & {
    additionalDescription?: string;
  };
  whatIsHippotherapy: HippotherapySection;
  testimonials1: {
    description: string;
    additionalDescription: string;
    image: ImageData;
  };
  whatIsIpoventia: HippotherapySection;
  centerOfIpoventia: HippotherapySectionWithImage & {
    additionalDescription: string;
  };
  whyThisApproach: {
    heading: string;
    cards: HippotherapyCard[];
  };
  whatTheApproachShows: HippotherapySection;
  scientificResearch: HippotherapySection & {
    references: ScientificReference[];
  };
  testimonials2: {
    description: string;
    additionalDescription: string;
    image: ImageData;
  };
  whoProgramsSuit: {
    heading: string;
    cards: HippotherapyCard[];
  };
  principles: HippotherapySectionWithImage & {
    descriptions: string[];
  };
}

/**
 * API response types
 */
export interface HippotherapyApiResponse {
  data: HippotherapyData;
  status: string;
}

/**
 * Form state
 */
export interface HippotherapyFormState {
  isDirty: boolean;
  isValid: boolean;
  isLoading: boolean;
  errors: Record<string, string>;
}
```

**src/const/admin/hippotherapy/validation-rules.ts**
```typescript
export const VALIDATION_RULES = {
  HEADING: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 50,
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
  },
  DESCRIPTION_SHORT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 300,
  },
  DESCRIPTION_MEDIUM: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 100,
  },
  ADDITIONAL_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 50,
  },
  REFERENCE_NAME: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 150,
  },
  REFERENCE_LINK: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 1000,
  },
  IMAGE: {
    MAX_SIZE_MB: 5,
    ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    MIN_DIMENSIONS: {
      TITLE: { width: 1440, height: 660 },
      CENTER_IPOVENTIA: { width: 1440, height: 420 },
      TESTIMONIALS: { width: 1400, height: 800 },
      CARD: { width: 360, height: 430 },
      PRINCIPLES: { width: 1440, height: 800 },
    },
  },
} as const;

export const ERROR_MESSAGES = {
  REQUIRED: 'Field is required',
  MIN_LENGTH_5: 'Minimum 5 characters',
  MIN_LENGTH_10: 'Minimum 10 characters',
  IMAGE_TOO_LARGE: 'Image must be under 5 MB',
  IMAGE_INVALID_FORMAT: 'Invalid format, allowed: jpeg, jpg, png, webp',
  IMAGE_TOO_SMALL: 'Image must be at least the recommended size',
  URL_INVALID: 'Invalid URL format',
} as const;
```

**src/const/admin/hippotherapy/section-configs.ts**
```typescript
import { VALIDATION_RULES } from './validation-rules';

export const SECTION_IDS = {
  TITLE: 'title',
  WHAT_IS_HIPPOTHERAPY: 'whatIsHippotherapy',
  TESTIMONIALS_1: 'testimonials1',
  WHAT_IS_IPOVENTIA: 'whatIsIpoventia',
  CENTER_OF_IPOVENTIA: 'centerOfIpoventia',
  WHY_THIS_APPROACH: 'whyThisApproach',
  WHAT_THE_APPROACH_SHOWS: 'whatTheApproachShows',
  SCIENTIFIC_RESEARCH: 'scientificResearch',
  TESTIMONIALS_2: 'testimonials2',
  WHO_PROGRAMS_SUIT: 'whoProgramsSuit',
  PRINCIPLES: 'principles',
} as const;

export const SECTION_ORDER = [
  SECTION_IDS.TITLE,
  SECTION_IDS.WHAT_IS_HIPPOTHERAPY,
  SECTION_IDS.TESTIMONIALS_1,
  SECTION_IDS.WHAT_IS_IPOVENTIA,
  SECTION_IDS.CENTER_OF_IPOVENTIA,
  SECTION_IDS.WHY_THIS_APPROACH,
  SECTION_IDS.WHAT_THE_APPROACH_SHOWS,
  SECTION_IDS.SCIENTIFIC_RESEARCH,
  SECTION_IDS.TESTIMONIALS_2,
  SECTION_IDS.WHO_PROGRAMS_SUIT,
  SECTION_IDS.PRINCIPLES,
] as const;

export const IMAGE_DIMENSIONS = VALIDATION_RULES.IMAGE.MIN_DIMENSIONS;
```

### Architecture Decisions
- Use TypeScript `const` assertions for constant objects to ensure type safety
- Separate validation rules from business logic for reusability
- Use named exports (not default exports) following project conventions
- Document all interfaces with JSDoc for better IDE support
- Create index file for convenient imports

## Test Cases

### Unit Tests
Create `src/types/admin/hippotherapy.types.test.ts`:
- Test type structure: Ensure all required properties exist
- Test const assertions: Verify constants are readonly
- Test validation rules: Check all limits are numbers
- Test section configs: Verify section order is correct

## Dependencies
**Technical Dependencies**: None (foundation)

**Business Context**: This is the foundation for all hippotherapy stories (BS01-BS11)

## Estimated Effort
**4 hours**

## Technical Notes
- Follow existing type patterns from `src/types/admin/` (e.g., program types)
- Use path alias `@/types/admin/hippotherapy.types` in imports
- Ensure types support both create and update operations
- Consider future extensibility (e.g., adding new sections)

## Definition of Done
- [ ] All types created and exported
- [ ] All constants defined and typed
- [ ] No TypeScript errors
- [ ] Unit tests pass
- [ ] Code reviewed
- [ ] Documentation complete
