# TS04: Translation Types and Constants

## Implements
**Business Stories**: 
- BS01 - Title Section Content Management
- BS02 - What Is Hippotherapy Content
- BS03 - Testimonials Section Management
- BS04 - What Is Ipoventia Content
- BS05 - Center of Ipoventia Section
- BS06 - Why This Approach Content
- BS07 - What This Approach Shows
- BS08 - Scientific Research Management
- BS09 - Who Programs Suit Content
- BS10 - Hippotherapy Principles Section
- BS11 - Admin Page Integration

## Technical Goal
Define TypeScript types and constants for the translation system, enabling admins to manage Ukrainian and English content for all hippotherapy sections.

## Acceptance Criteria
- [ ] TranslationStatus enum defined (COMPLETE, INCOMPLETE, NOT_STARTED)
- [ ] TranslationLanguage type defined ('uk' | 'en')
- [ ] TranslationState interface includes language, status, lastModified
- [ ] SectionTranslationState interface tracks translation per section
- [ ] TranslationModalProps interface for modal components
- [ ] TranslationGateProps interface for translation gate component
- [ ] Constants for default translation states
- [ ] Constants for translation status labels (i18n keys)
- [ ] Helper type guards (isTranslationComplete, etc.)
- [ ] Export all types from single barrel file
- [ ] Types support all 10 hippotherapy sections
- [ ] Types integrate with existing i18n system (i18next)
- [ ] Documentation includes usage examples
- [ ] Types are compatible with React Hook Form

## Implementation Details

### Files to Create
- `src/types/admin/hippotherapy-translation.types.ts`
- `src/const/admin/hippotherapy-translation-constants.ts`

### Code Example

**types/admin/hippotherapy-translation.types.ts**:
```typescript
/**
 * Translation system types for Hippotherapy Admin
 * Supports Ukrainian (default) and English translations
 */

export type TranslationLanguage = 'uk' | 'en';

export enum TranslationStatus {
  COMPLETE = 'COMPLETE',
  INCOMPLETE = 'INCOMPLETE',
  NOT_STARTED = 'NOT_STARTED',
}

/**
 * Translation state for a single language
 */
export interface TranslationState {
  language: TranslationLanguage;
  status: TranslationStatus;
  lastModified?: Date;
  completionPercentage: number; // 0-100
}

/**
 * Translation state for a section supporting multiple languages
 */
export interface SectionTranslationState {
  uk: TranslationState;
  en: TranslationState;
}

/**
 * Props for translation modal components
 */
export interface TranslationModalProps {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  currentLanguage: TranslationLanguage;
  onSave: (language: TranslationLanguage, data: any) => Promise<void>;
  loading?: boolean;
}

/**
 * Props for translation gate component
 * Shows translation status and opens modal
 */
export interface TranslationGateProps {
  sectionId: string;
  sectionName: string;
  translationState: SectionTranslationState;
  onOpenModal: (language: TranslationLanguage) => void;
  disabled?: boolean;
}

/**
 * Translation data structure for API
 */
export interface TranslationData<T = any> {
  language: TranslationLanguage;
  data: T;
  status: TranslationStatus;
  lastModified: string; // ISO date string
}

/**
 * Translation history entry
 */
export interface TranslationHistoryEntry {
  id: string;
  language: TranslationLanguage;
  modifiedBy: string;
  modifiedAt: Date;
  changes: string[]; // List of changed fields
}

/**
 * Translation validation result
 */
export interface TranslationValidation {
  isValid: boolean;
  missingFields: string[];
  status: TranslationStatus;
}

// Type guards
export const isTranslationComplete = (state: TranslationState): boolean => {
  return state.status === TranslationStatus.COMPLETE && state.completionPercentage === 100;
};

export const isTranslationIncomplete = (state: TranslationState): boolean => {
  return state.status === TranslationStatus.INCOMPLETE;
};

export const isTranslationNotStarted = (state: TranslationState): boolean => {
  return state.status === TranslationStatus.NOT_STARTED;
};

export const getTranslationStatusColor = (status: TranslationStatus): string => {
  switch (status) {
    case TranslationStatus.COMPLETE:
      return 'success';
    case TranslationStatus.INCOMPLETE:
      return 'warning';
    case TranslationStatus.NOT_STARTED:
      return 'error';
    default:
      return 'default';
  }
};
```

**const/admin/hippotherapy-translation-constants.ts**:
```typescript
import { TranslationStatus, TranslationLanguage, TranslationState, SectionTranslationState } from '@/types/admin/hippotherapy-translation.types';

/**
 * Default translation state for a new section
 */
export const DEFAULT_TRANSLATION_STATE: TranslationState = {
  language: 'uk',
  status: TranslationStatus.NOT_STARTED,
  lastModified: undefined,
  completionPercentage: 0,
};

/**
 * Default section translation state (both languages)
 */
export const DEFAULT_SECTION_TRANSLATION_STATE: SectionTranslationState = {
  uk: {
    language: 'uk',
    status: TranslationStatus.NOT_STARTED,
    completionPercentage: 0,
  },
  en: {
    language: 'en',
    status: TranslationStatus.NOT_STARTED,
    completionPercentage: 0,
  },
};

/**
 * Translation status labels (i18n keys)
 */
export const TRANSLATION_STATUS_LABELS: Record<TranslationStatus, string> = {
  [TranslationStatus.COMPLETE]: 'hippotherapyAdmin.translation.status.complete',
  [TranslationStatus.INCOMPLETE]: 'hippotherapyAdmin.translation.status.incomplete',
  [TranslationStatus.NOT_STARTED]: 'hippotherapyAdmin.translation.status.notStarted',
};

/**
 * Language labels (i18n keys)
 */
export const TRANSLATION_LANGUAGE_LABELS: Record<TranslationLanguage, string> = {
  uk: 'hippotherapyAdmin.translation.language.ukrainian',
  en: 'hippotherapyAdmin.translation.language.english',
};

/**
 * Language flags (emoji or icon codes)
 */
export const TRANSLATION_LANGUAGE_FLAGS: Record<TranslationLanguage, string> = {
  uk: '🇺🇦',
  en: '🇬🇧',
};

/**
 * Section IDs for all hippotherapy sections
 */
export const HIPPOTHERAPY_SECTION_IDS = {
  TITLE: 'title',
  WHAT_IS_HIPPOTHERAPY: 'whatIsHippotherapy',
  TESTIMONIALS: 'testimonials',
  WHAT_IS_IPOVENTIA: 'whatIsIpoventia',
  CENTER_OF_IPOVENTIA: 'centerOfIpoventia',
  WHY_THIS_APPROACH: 'whyThisApproach',
  WHO_PROGRAMS_SUIT: 'whoProgramsSuit',
  SCIENTIFIC_RESEARCH: 'scientificResearch',
  PRINCIPLES: 'principles',
} as const;

export type HippotherapySectionId = typeof HIPPOTHERAPY_SECTION_IDS[keyof typeof HIPPOTHERAPY_SECTION_IDS];

/**
 * Section names for display (i18n keys)
 */
export const HIPPOTHERAPY_SECTION_NAMES: Record<HippotherapySectionId, string> = {
  title: 'hippotherapyAdmin.sections.title',
  whatIsHippotherapy: 'hippotherapyAdmin.sections.whatIsHippotherapy',
  testimonials: 'hippotherapyAdmin.sections.testimonials',
  whatIsIpoventia: 'hippotherapyAdmin.sections.whatIsIpoventia',
  centerOfIpoventia: 'hippotherapyAdmin.sections.centerOfIpoventia',
  whyThisApproach: 'hippotherapyAdmin.sections.whyThisApproach',
  whoProgramsSuit: 'hippotherapyAdmin.sections.whoProgramsSuit',
  scientificResearch: 'hippotherapyAdmin.sections.scientificResearch',
  principles: 'hippotherapyAdmin.sections.principles',
};

/**
 * Required fields per section (for validation)
 */
export const SECTION_REQUIRED_FIELDS: Record<HippotherapySectionId, string[]> = {
  title: ['heading', 'description', 'image'],
  whatIsHippotherapy: ['heading', 'description', 'image'],
  testimonials: ['testimonials'],
  whatIsIpoventia: ['heading', 'description'],
  centerOfIpoventia: ['heading', 'description', 'image'],
  whyThisApproach: ['heading', 'description'],
  whoProgramsSuit: ['heading', 'description'],
  scientificResearch: ['generalText', 'researchEntries'],
  principles: ['principles'],
};

/**
 * Translation modal titles (i18n keys)
 */
export const TRANSLATION_MODAL_TITLES: Record<HippotherapySectionId, string> = {
  title: 'hippotherapyAdmin.translation.modal.title',
  whatIsHippotherapy: 'hippotherapyAdmin.translation.modal.whatIsHippotherapy',
  testimonials: 'hippotherapyAdmin.translation.modal.testimonials',
  whatIsIpoventia: 'hippotherapyAdmin.translation.modal.whatIsIpoventia',
  centerOfIpoventia: 'hippotherapyAdmin.translation.modal.centerOfIpoventia',
  whyThisApproach: 'hippotherapyAdmin.translation.modal.whyThisApproach',
  whoProgramsSuit: 'hippotherapyAdmin.translation.modal.whoProgramsSuit',
  scientificResearch: 'hippotherapyAdmin.translation.modal.scientificResearch',
  principles: 'hippotherapyAdmin.translation.modal.principles',
};
```

### Architecture Decisions
- Use TypeScript enums for translation status (type-safe)
- Use string literal union for languages (simple, extensible)
- Separate types from constants for clear separation of concerns
- Include type guards for runtime checks
- Support both UK and EN languages (matches project i18n)
- Translation state includes completion percentage for progress tracking
- Constants use i18n keys for labels (not hard-coded strings)

## Test Cases

### Unit Tests

**File**: `src/types/admin/hippotherapy-translation.types.test.ts`

- Test isTranslationComplete returns true for COMPLETE status
- Test isTranslationComplete returns false for INCOMPLETE status
- Test isTranslationNotStarted returns true for NOT_STARTED status
- Test getTranslationStatusColor returns correct color for each status
- Test type guards with all TranslationStatus values

**File**: `src/const/admin/hippotherapy-translation-constants.test.ts`

- Test DEFAULT_TRANSLATION_STATE has correct structure
- Test DEFAULT_SECTION_TRANSLATION_STATE includes both uk and en
- Test TRANSLATION_STATUS_LABELS includes all enum values
- Test TRANSLATION_LANGUAGE_LABELS includes all languages
- Test HIPPOTHERAPY_SECTION_IDS includes all 9 sections
- Test SECTION_REQUIRED_FIELDS matches section schemas
- Test all constants are frozen (Object.isFrozen)

### Integration Tests
- Test types integrate with React components (TypeScript compilation)
- Test constants used in translation modals render correctly
- Test type guards work with API response data

## Dependencies

**Technical Dependencies**:
- TS01: Foundation Types (must complete first - provides base interfaces)

**Business Context**: Foundation for ALL business stories (BS01-BS11), especially translation features

## Estimated Effort

**4 hours**

- Type definitions: 1.5 hours
- Constants definition: 1.5 hours
- Type guards and helpers: 0.5 hours
- Test cases: 0.5 hours

## Technical Notes

### Patterns to Follow
- Follow existing Victory Center type patterns (see `src/types/admin/`)
- Use const assertions for section IDs (`as const`)
- Export types and constants from barrel files
- Use i18n keys instead of hard-coded strings

### Risks and Mitigation
- **Risk**: Translation system complexity grows with more languages
  - **Mitigation**: Keep language type as union, easy to extend
- **Risk**: Section IDs mismatch with actual section names
  - **Mitigation**: Use constants everywhere, not magic strings
- **Risk**: Required fields list gets out of sync with schemas
  - **Mitigation**: Reference from validation schemas in tests

### Performance Considerations
- Types have zero runtime cost (TypeScript compilation)
- Constants are frozen and reused
- Type guards are simple boolean checks

### Extensibility
- Easy to add new languages (add to TranslationLanguage union)
- Easy to add new sections (add to HIPPOTHERAPY_SECTION_IDS)
- Easy to add new translation statuses (add to enum)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Types defined for all translation concepts
- [ ] Constants defined for all sections and labels
- [ ] Type guards implemented and tested
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Types integrate with React components (no TypeScript errors)
- [ ] Documentation includes usage examples
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] Types exported from barrel file
