# TS26: Translation Modal Base Component

## Implements
**Business Stories**: BS01-BS10 (all section translation features)

## Technical Goal
Create base translation modal component with common layout, form structure, and submission logic that can be extended for specific section types.

## Acceptance Criteria
- [ ] Modal displays section name and target language
- [ ] Modal contains form with section-specific fields
- [ ] Modal has Save and Cancel buttons
- [ ] Modal displays loading state during save
- [ ] Modal validates form before submission
- [ ] Modal shows validation errors inline
- [ ] Modal integrates with React Hook Form
- [ ] Modal closes on successful save
- [ ] Modal warns about unsaved changes on close
- [ ] Modal supports keyboard shortcuts (Esc to close, Ctrl+S to save)
- [ ] Modal is responsive (mobile-friendly)
- [ ] Modal displays translation completion status

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/shared/translation-modal-base/TranslationModalBase.tsx`
- `src/components/admin/hippotherapy/shared/translation-modal-base/TranslationModalBase.module.scss`
- `src/components/admin/hippotherapy/shared/translation-modal-base/TranslationModalBase.test.tsx`

### Code Example

```typescript
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { TranslationLanguage } from '@/types/admin/hippotherapy-translation.types';
import { TRANSLATION_LANGUAGE_FLAGS } from '@/const/admin/hippotherapy-translation-constants';
import styles from './TranslationModalBase.module.scss';

interface TranslationModalBaseProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  sectionName: string;
  language: TranslationLanguage;
  form: UseFormReturn<any>;
  loading?: boolean;
  children: React.ReactNode; // Form fields rendered by parent
}

export const TranslationModalBase: React.FC<TranslationModalBaseProps> = ({
  open,
  onClose,
  onSave,
  sectionName,
  language,
  form,
  loading = false,
  children,
}) => {
  const { t } = useTranslation('hippotherapyAdmin');
  const flag = TRANSLATION_LANGUAGE_FLAGS[language];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      form.handleSubmit(onSave)();
    }
  };

  const handleClose = () => {
    if (form.formState.isDirty) {
      // Show unsaved changes warning
      if (window.confirm(t('translationModal.unsavedChanges'))) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onKeyDown={handleKeyDown}
      maxWidth="md"
      fullWidth
      className={styles.dialog}
    >
      <DialogTitle className={styles.title}>
        <Box className={styles.titleContainer}>
          <span className={styles.flag}>{flag}</span>
          <Typography variant="h6">
            {t('translationModal.title', { section: sectionName, language: t(`translation.language.${language}`) })}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent className={styles.content}>
        <form id="translation-form" onSubmit={form.handleSubmit(onSave)}>
          {children}
        </form>
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button onClick={handleClose} disabled={loading} variant="outlined">
          {t('translationModal.cancel')}
        </Button>
        <Button
          type="submit"
          form="translation-form"
          disabled={loading || !form.formState.isValid}
          variant="contained"
        >
          {loading ? t('translationModal.saving') : t('translationModal.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

## Test Cases

### Unit Tests
- Test modal renders with section name and language
- Test modal displays form fields (children)
- Test Save button submits form
- Test Cancel button closes modal
- Test Escape key closes modal
- Test Ctrl+S submits form
- Test unsaved changes warning on close
- Test disabled state during save

## Dependencies
- TS04: Translation Types (must complete first)

## Estimated Effort
**4 hours**

## Definition of Done
- [ ] Base modal component complete
- [ ] Unit tests passing (>90% coverage)
- [ ] Code reviewed and approved
