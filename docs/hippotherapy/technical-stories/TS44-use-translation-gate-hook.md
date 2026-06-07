# TS44: useTranslationGate Hook

## Implements
**Business Stories**: BS01-BS10 (all section translation features)

## Technical Goal
Create custom hook to manage translation gate state, fetch translation status, and handle modal open/close logic.

## Acceptance Criteria
- [ ] Hook fetches translation status for all sections
- [ ] Hook provides translationState for each section
- [ ] Hook provides openModal function for specific language
- [ ] Hook provides closeModal function
- [ ] Hook tracks which section/language is being edited
- [ ] Hook handles loading and error states
- [ ] Hook refetches status after save
- [ ] Hook is fully typed with TypeScript

## Implementation Details

### Files to Create
- `src/hooks/admin/use-translation-gate/useTranslationGate.ts`
- `src/hooks/admin/use-translation-gate/useTranslationGate.test.ts`

### Code Example

```typescript
import { useState, useEffect, useCallback } from 'react';
import { HippotherapyTranslationService } from '@/services/api/admin/hippotherapy-translation-service';
import { useAdminClient } from '@/hooks/admin/use-admin-client';
import {
  HippotherapySectionId,
  TranslationLanguage,
  SectionTranslationState,
} from '@/types/admin/hippotherapy-translation.types';

export interface UseTranslationGateReturn {
  translationStates: Record<HippotherapySectionId, SectionTranslationState>;
  loading: boolean;
  error: Error | null;
  openModal: (sectionId: HippotherapySectionId, language: TranslationLanguage) => void;
  closeModal: () => void;
  currentSection: HippotherapySectionId | null;
  currentLanguage: TranslationLanguage | null;
  modalOpen: boolean;
  refetch: () => Promise<void>;
}

export const useTranslationGate = (): UseTranslationGateReturn => {
  const { adminClient } = useAdminClient();
  const [service, setService] = useState<HippotherapyTranslationService | null>(null);
  const [translationStates, setTranslationStates] = useState<Record<HippotherapySectionId, SectionTranslationState>>({} as any);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<HippotherapySectionId | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<TranslationLanguage | null>(null);

  useEffect(() => {
    if (adminClient) {
      setService(new HippotherapyTranslationService(adminClient));
    }
  }, [adminClient]);

  const fetchTranslationStatus = useCallback(async () => {
    if (!service) return;

    setLoading(true);
    setError(null);

    try {
      const states = await service.getTranslationStatus();
      setTranslationStates(states);
    } catch (err) {
      console.error('Failed to fetch translation status:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchTranslationStatus();
  }, [fetchTranslationStatus]);

  const openModal = useCallback((sectionId: HippotherapySectionId, language: TranslationLanguage) => {
    setCurrentSection(sectionId);
    setCurrentLanguage(language);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setCurrentSection(null);
    setCurrentLanguage(null);
  }, []);

  const refetch = useCallback(async () => {
    await fetchTranslationStatus();
  }, [fetchTranslationStatus]);

  return {
    translationStates,
    loading,
    error,
    openModal,
    closeModal,
    currentSection,
    currentLanguage,
    modalOpen,
    refetch,
  };
};
```

## Test Cases

### Unit Tests
- Test hook fetches translation status on mount
- Test hook sets loading state
- Test hook handles fetch errors
- Test openModal sets currentSection and currentLanguage
- Test closeModal clears currentSection and currentLanguage
- Test refetch re-fetches translation status

### Integration Tests
- Test hook integrates with HippotherapyTranslationService
- Test hook integrates with translation gate component
- Test hook refetches after modal save

## Dependencies
- TS04: Translation Types
- TS06: Translation API Service

## Estimated Effort
**4 hours**

- Hook implementation: 2 hours
- State management: 1 hour
- Test cases: 1 hour

## Definition of Done
- [ ] Hook provides all required functions
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] No lint warnings
