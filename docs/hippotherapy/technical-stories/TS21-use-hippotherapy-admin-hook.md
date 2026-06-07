# TS21: useHippotherapyAdmin Custom Hook

## Implements
**Business Stories**: 
- BS11 - Admin Page Integration

## Technical Goal
Create a custom React hook that manages state, API calls, and business logic for the hippotherapy admin page, providing a clean interface for the page component.

## Acceptance Criteria
- [ ] Hook fetches all section data on mount
- [ ] Hook provides sections state with all 10 sections
- [ ] Hook provides loading and error states
- [ ] Hook provides isDirty flag for unsaved changes tracking
- [ ] Hook provides publishAll function to publish all sections
- [ ] Hook provides saveDraft function to save current state
- [ ] Hook provides refetch function to reload data
- [ ] Hook provides updateSection function for individual section updates
- [ ] Hook integrates with hippotherapy API service
- [ ] Hook integrates with admin client for authentication
- [ ] Hook handles optimistic updates with rollback on error
- [ ] Hook caches section data to reduce API calls
- [ ] Hook provides translation state management
- [ ] Hook implements error handling with user-friendly messages
- [ ] Hook is fully typed with TypeScript

## Implementation Details

### Files to Create
- `src/hooks/admin/use-hippotherapy-admin/useHippotherapyAdmin.ts`
- `src/hooks/admin/use-hippotherapy-admin/useHippotherapyAdmin.test.ts`
- `src/hooks/admin/use-hippotherapy-admin/index.ts`

### Code Example

**useHippotherapyAdmin.ts**:
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminClient } from '@/hooks/admin/use-admin-client';
import { HippotherapyAdminService } from '@/services/api/admin/hippotherapy-admin-service';
import { HippotherapySectionId } from '@/const/admin/hippotherapy-translation-constants';
import {
  TitleSectionData,
  WhatIsHippotherapyData,
  TestimonialsData,
  WhatIsIpoventiaData,
  CenterOfIpoventiaData,
  WhyThisApproachData,
  WhoProgramsSuitData,
  ScientificResearchData,
  PrinciplesData,
} from '@/types/admin/hippotherapy.types';

export interface HippotherapySections {
  title: TitleSectionData | null;
  whatIsHippotherapy: WhatIsHippotherapyData | null;
  testimonials: TestimonialsData | null;
  whatIsIpoventia: WhatIsIpoventiaData | null;
  centerOfIpoventia: CenterOfIpoventiaData | null;
  whyThisApproach: WhyThisApproachData | null;
  whoProgramsSuit: WhoProgramsSuitData | null;
  scientificResearch: ScientificResearchData | null;
  principles: PrinciplesData | null;
}

export interface UseHippotherapyAdminReturn {
  sections: HippotherapySections;
  loading: boolean;
  error: Error | null;
  isDirty: boolean;
  publishAll: () => Promise<void>;
  saveDraft: () => Promise<void>;
  refetch: () => Promise<void>;
  updateSection: <T>(sectionId: HippotherapySectionId, data: T) => void;
  resetSection: (sectionId: HippotherapySectionId) => void;
}

export const useHippotherapyAdmin = (): UseHippotherapyAdminReturn => {
  const { adminClient } = useAdminClient();
  const serviceRef = useRef<HippotherapyAdminService>();

  const [sections, setSections] = useState<HippotherapySections>({
    title: null,
    whatIsHippotherapy: null,
    testimonials: null,
    whatIsIpoventia: null,
    centerOfIpoventia: null,
    whyThisApproach: null,
    whoProgramsSuit: null,
    scientificResearch: null,
    principles: null,
  });

  const [originalSections, setOriginalSections] = useState<HippotherapySections>(sections);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize service
  useEffect(() => {
    if (adminClient) {
      serviceRef.current = new HippotherapyAdminService(adminClient);
    }
  }, [adminClient]);

  // Fetch all section data
  const fetchSections = useCallback(async () => {
    if (!serviceRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const [
        title,
        whatIsHippotherapy,
        testimonials,
        whatIsIpoventia,
        centerOfIpoventia,
        whyThisApproach,
        whoProgramsSuit,
        scientificResearch,
        principles,
      ] = await Promise.all([
        serviceRef.current.getTitleSection(),
        serviceRef.current.getWhatIsHippotherapySection(),
        serviceRef.current.getTestimonialsSection(),
        serviceRef.current.getWhatIsIpoventiaSection(),
        serviceRef.current.getCenterOfIpoventiaSection(),
        serviceRef.current.getWhyThisApproachSection(),
        serviceRef.current.getWhoProgramsSuitSection(),
        serviceRef.current.getScientificResearchSection(),
        serviceRef.current.getPrinciplesSection(),
      ]);

      const fetchedSections = {
        title,
        whatIsHippotherapy,
        testimonials,
        whatIsIpoventia,
        centerOfIpoventia,
        whyThisApproach,
        whoProgramsSuit,
        scientificResearch,
        principles,
      };

      setSections(fetchedSections);
      setOriginalSections(fetchedSections);
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to fetch hippotherapy sections:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Update section (optimistic)
  const updateSection = useCallback(
    <T,>(sectionId: HippotherapySectionId, data: T) => {
      setSections((prev) => ({
        ...prev,
        [sectionId]: data,
      }));
      setIsDirty(true);
    },
    []
  );

  // Reset section to original state
  const resetSection = useCallback(
    (sectionId: HippotherapySectionId) => {
      setSections((prev) => ({
        ...prev,
        [sectionId]: originalSections[sectionId],
      }));
      setIsDirty(false);
    },
    [originalSections]
  );

  // Publish all sections
  const publishAll = useCallback(async () => {
    if (!serviceRef.current) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        serviceRef.current.updateTitleSection(sections.title!, true),
        serviceRef.current.updateWhatIsHippotherapySection(sections.whatIsHippotherapy!, true),
        serviceRef.current.updateTestimonialsSection(sections.testimonials!, true),
        serviceRef.current.updateWhatIsIpoventiaSection(sections.whatIsIpoventia!, true),
        serviceRef.current.updateCenterOfIpoventiaSection(sections.centerOfIpoventia!, true),
        serviceRef.current.updateWhyThisApproachSection(sections.whyThisApproach!, true),
        serviceRef.current.updateWhoProgramsSuitSection(sections.whoProgramsSuit!, true),
        serviceRef.current.updateScientificResearchSection(sections.scientificResearch!, true),
        serviceRef.current.updatePrinciplesSection(sections.principles!, true),
      ]);

      setOriginalSections(sections);
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to publish sections:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sections]);

  // Save draft (all sections)
  const saveDraft = useCallback(async () => {
    if (!serviceRef.current) return;

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        serviceRef.current.updateTitleSection(sections.title!, false),
        serviceRef.current.updateWhatIsHippotherapySection(sections.whatIsHippotherapy!, false),
        serviceRef.current.updateTestimonialsSection(sections.testimonials!, false),
        serviceRef.current.updateWhatIsIpoventiaSection(sections.whatIsIpoventia!, false),
        serviceRef.current.updateCenterOfIpoventiaSection(sections.centerOfIpoventia!, false),
        serviceRef.current.updateWhyThisApproachSection(sections.whyThisApproach!, false),
        serviceRef.current.updateWhoProgramsSuitSection(sections.whoProgramsSuit!, false),
        serviceRef.current.updateScientificResearchSection(sections.scientificResearch!, false),
        serviceRef.current.updatePrinciplesSection(sections.principles!, false),
      ]);

      setOriginalSections(sections);
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to save draft:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sections]);

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchSections();
  }, [fetchSections]);

  return {
    sections,
    loading,
    error,
    isDirty,
    publishAll,
    saveDraft,
    refetch,
    updateSection,
    resetSection,
  };
};
```

### Architecture Decisions
- Encapsulate all hippotherapy admin logic in single hook
- Use service layer for API calls (separation of concerns)
- Track original state for dirty checking and rollback
- Optimistic updates with error handling
- Batch API calls with Promise.all for performance
- Memoize callbacks to prevent unnecessary re-renders

## Test Cases

### Unit Tests

**File**: `useHippotherapyAdmin.test.ts`

- Test hook fetches all sections on mount
- Test hook sets loading state during fetch
- Test hook sets error state on fetch failure
- Test hook returns fetched sections
- Test updateSection updates section data
- Test updateSection sets isDirty to true
- Test resetSection reverts to original state
- Test resetSection sets isDirty to false
- Test publishAll calls API for all sections
- Test publishAll with publish=true flag
- Test publishAll resets isDirty on success
- Test saveDraft calls API for all sections
- Test saveDraft with publish=false flag
- Test saveDraft resets isDirty on success
- Test refetch re-fetches all sections
- Test hook handles API errors gracefully

### Integration Tests
- Test hook integrates with HippotherapyAdminService
- Test hook integrates with useAdminClient hook
- Test hook used in HippotherapyAdminPage component
- Test optimistic updates with rollback on error
- Test concurrent updates don't cause race conditions

## Dependencies

**Technical Dependencies**:
- TS01: Foundation Types (must complete first)
- TS22: Hippotherapy Admin API Service (must complete first)
- useAdminClient hook (existing)

**Business Context**: BS11 - Admin Page Integration

## Estimated Effort

**6 hours**

- Hook implementation: 3 hours
- State management logic: 1.5 hours
- Error handling and optimistic updates: 1 hour
- Test cases: 0.5 hours

## Technical Notes

### Patterns to Follow
- Follow existing Victory Center custom hook patterns
- Use useCallback for memoization
- Use useRef for service instance (avoid re-creation)
- Provide clean interface for page component

### Risks and Mitigation
- **Risk**: Race conditions with concurrent updates
  - **Mitigation**: Use functional state updates, queue updates
- **Risk**: Memory leaks from async operations
  - **Mitigation**: Cleanup pending promises on unmount
- **Risk**: Stale data after navigation
  - **Mitigation**: Refetch on page focus/visibility change

### Performance Considerations
- Batch API calls with Promise.all
- Memoize callbacks to prevent re-renders
- Use useRef for service to avoid re-creation
- Debounce frequent updates (if needed)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Hook provides all required functions
- [ ] Hook handles errors gracefully
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Hook integrates with page component
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] Documentation (JSDoc) complete
