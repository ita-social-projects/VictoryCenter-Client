# TS45: useTranslationModal Hook

## Implements
**Business Stories**: BS01-BS10 (all section translation features)

## Technical Goal
Create custom hook to manage translation modal state, data fetching, and save logic with validation and error handling.

## Acceptance Criteria
- [ ] Hook fetches existing translation data for section/language
- [ ] Hook provides form state management
- [ ] Hook provides save function with validation
- [ ] Hook handles loading and error states
- [ ] Hook integrates with translation API service
- [ ] Hook updates translation status after save
- [ ] Hook provides optimistic updates
- [ ] Hook is fully typed with TypeScript

## Implementation Details

### Files to Create
- `src/hooks/admin/use-translation-modal/useTranslationModal.ts`
- `src/hooks/admin/use-translation-modal/useTranslationModal.test.ts`

### Code Example

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { HippotherapyTranslationService } from '@/services/api/admin/hippotherapy-translation-service';
import { useAdminClient } from '@/hooks/admin/use-admin-client';
import { useToast } from '@/contexts/admin/toast-context-provider';
import {
  HippotherapySectionId,
  TranslationLanguage,
} from '@/types/admin/hippotherapy-translation.types';

export interface UseTranslationModalReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  save: (data: T) => Promise<void>;
  form: any; // React Hook Form instance
}

export const useTranslationModal = <T,>(
  sectionId: HippotherapySectionId,
  language: TranslationLanguage,
  validationSchema: any
): UseTranslationModalReturn<T> => {
  const { adminClient } = useAdminClient();
  const { showToast } = useToast();
  const [service, setService] = useState<HippotherapyTranslationService | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<T>({
    resolver: validationSchema,
  });

  useEffect(() => {
    if (adminClient) {
      setService(new HippotherapyTranslationService(adminClient));
    }
  }, [adminClient]);

  useEffect(() => {
    const fetchData = async () => {
      if (!service) return;

      setLoading(true);
      setError(null);

      try {
        const translation = await service.getTranslation<T>(sectionId, language);
        setData(translation.data);
        form.reset(translation.data);
      } catch (err) {
        console.error('Failed to fetch translation:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [service, sectionId, language, form]);

  const save = useCallback(
    async (data: T) => {
      if (!service) return;

      setLoading(true);
      setError(null);

      try {
        await service.updateTranslation<T>(sectionId, language, data);
        showToast('Translation saved successfully', 'success');
      } catch (err) {
        console.error('Failed to save translation:', err);
        setError(err as Error);
        showToast('Failed to save translation', 'error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service, sectionId, language, showToast]
  );

  return {
    data,
    loading,
    error,
    save,
    form,
  };
};
```

## Test Cases

### Unit Tests
- Test hook fetches translation data on mount
- Test hook resets form with fetched data
- Test save function calls API service
- Test save function shows success toast
- Test save function shows error toast on failure
- Test hook handles fetch errors

### Integration Tests
- Test hook integrates with translation modal
- Test hook integrates with HippotherapyTranslationService
- Test hook integrates with toast context

## Dependencies
- TS04: Translation Types
- TS06: Translation API Service
- TS24: Toast context

## Estimated Effort
**4 hours**

- Hook implementation: 2 hours
- Form integration: 1 hour
- Test cases: 1 hour

## Definition of Done
- [ ] Hook provides all required functions
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] No lint warnings
