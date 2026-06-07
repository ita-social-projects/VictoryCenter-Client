# TS17: Confirmation Modal Component

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

## Technical Goal
Create a reusable confirmation modal for destructive actions (unsaved changes, delete operations) in hippotherapy admin forms, providing clear user feedback before irreversible actions.

## Acceptance Criteria
- [ ] Modal displays with custom title and message
- [ ] Primary action button (Confirm/Save/Delete) with custom label and color
- [ ] Secondary action button (Cancel) with custom label
- [ ] Modal closes on Cancel or backdrop click
- [ ] Modal prevents close on Confirm until action completes
- [ ] Loading state during async actions
- [ ] Success/error feedback after action completes
- [ ] Keyboard support (Enter to confirm, Escape to cancel)
- [ ] Accessibility: focus trap, ARIA labels, screen reader support
- [ ] Different variants: warning (unsaved changes), danger (delete), info
- [ ] Optional checkbox for "Don't ask again" (with localStorage persistence)
- [ ] Responsive design (mobile-friendly)
- [ ] Animation: smooth open/close transition
- [ ] Integration with existing toast notification system

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/shared/confirmation-modal/ConfirmationModal.tsx`
- `src/components/admin/hippotherapy/shared/confirmation-modal/ConfirmationModal.module.scss`
- `src/components/admin/hippotherapy/shared/confirmation-modal/ConfirmationModal.test.tsx`
- `src/components/admin/hippotherapy/shared/confirmation-modal/index.ts`

### Code Example

**ConfirmationModal.tsx**:
```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import styles from './ConfirmationModal.module.scss';

export type ConfirmationVariant = 'warning' | 'danger' | 'info';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
  showDontAskAgain?: boolean;
  dontAskAgainKey?: string; // localStorage key
  loading?: boolean;
}

const variantIcons = {
  warning: WarningAmberIcon,
  danger: ErrorOutlineIcon,
  info: InfoOutlinedIcon,
};

const variantColors = {
  warning: 'warning' as const,
  danger: 'error' as const,
  info: 'info' as const,
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'warning',
  showDontAskAgain = false,
  dontAskAgainKey,
  loading = false,
}) => {
  const { t } = useTranslation('hippotherapyAdmin');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const Icon = variantIcons[variant];
  const color = variantColors[variant];

  const handleConfirm = async () => {
    if (showDontAskAgain && dontAskAgain && dontAskAgainKey) {
      localStorage.setItem(dontAskAgainKey, 'true');
    }

    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      // Error handling via toast context
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleConfirm();
    } else if (e.key === 'Escape' && !isProcessing) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isProcessing ? undefined : onClose}
      onKeyDown={handleKeyDown}
      maxWidth="sm"
      fullWidth
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      className={styles.dialog}
    >
      <DialogTitle id="confirmation-dialog-title" className={styles.title}>
        <Box className={styles.titleContainer}>
          <Icon color={color} className={styles.icon} />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent className={styles.content}>
        <Typography id="confirmation-dialog-description" variant="body1">
          {message}
        </Typography>

        {showDontAskAgain && (
          <FormControlLabel
            control={
              <Checkbox
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
                disabled={isProcessing}
              />
            }
            label={t('confirmationModal.dontAskAgain')}
            className={styles.dontAskAgain}
          />
        )}
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button
          onClick={onClose}
          disabled={isProcessing || loading}
          variant="outlined"
          aria-label={cancelLabel || t('confirmationModal.cancel')}
        >
          {cancelLabel || t('confirmationModal.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isProcessing || loading}
          variant="contained"
          color={color}
          autoFocus
          aria-label={confirmLabel || t('confirmationModal.confirm')}
          startIcon={isProcessing || loading ? <CircularProgress size={16} /> : undefined}
        >
          {isProcessing || loading
            ? t('confirmationModal.processing')
            : confirmLabel || t('confirmationModal.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Hook for checking "don't ask again" setting
export const useDontAskAgain = (key: string): boolean => {
  return localStorage.getItem(key) === 'true';
};

// Helper to clear "don't ask again" setting
export const clearDontAskAgain = (key: string): void => {
  localStorage.removeItem(key);
};
```

### Architecture Decisions
- Use Material-UI Dialog for modal foundation
- Support three variants: warning (unsaved), danger (delete), info (general)
- Icons and colors match variant severity
- Optional "don't ask again" with localStorage persistence
- Focus trap and keyboard navigation built into MUI Dialog
- Prevent close during processing to avoid race conditions
- Integration with existing toast context for error feedback

## Test Cases

### Unit Tests

**File**: `ConfirmationModal.test.tsx`

- Test modal renders with title and message
- Test modal displays correct icon for each variant
- Test Confirm button triggers onConfirm callback
- Test Cancel button triggers onClose callback
- Test Escape key triggers onClose
- Test Enter key triggers onConfirm
- Test loading state disables buttons
- Test processing state shows spinner
- Test "don't ask again" checkbox saves to localStorage
- Test useDontAskAgain hook reads from localStorage
- Test clearDontAskAgain helper removes from localStorage
- Test modal cannot close during processing
- Test backdrop click triggers onClose (when not processing)
- Test accessibility: ARIA labels present
- Test accessibility: focus trap works
- Test async onConfirm action completes before close

### Integration Tests
- Test modal used in TitleSectionForm for unsaved changes warning
- Test modal used for delete confirmation in TestimonialsForm
- Test modal integrates with toast context for error display
- Test "don't ask again" persists across page reloads

## Dependencies

**Technical Dependencies**:
- None (reusable component)

**Business Context**: Required for ALL business stories (BS01-BS10) for user confirmation flows

## Estimated Effort

**3 hours**

- Component implementation: 1.5 hours
- Keyboard and accessibility: 0.5 hours
- localStorage integration: 0.5 hours
- Test cases: 0.5 hours

## Technical Notes

### Patterns to Follow
- Follow existing Victory Center modal patterns
- Use Material-UI Dialog for consistency
- Use i18next for all user-facing strings
- Provide ARIA labels for screen readers
- Focus management: autofocus on Confirm button

### Risks and Mitigation
- **Risk**: User accidentally confirms destructive action
  - **Mitigation**: Require explicit click (no default confirmation on Enter if dangerous)
- **Risk**: Modal closes during async action
  - **Mitigation**: Disable close and backdrop click during processing
- **Risk**: "Don't ask again" too aggressive, user can't undo
  - **Mitigation**: Provide admin setting to reset all "don't ask again" flags
- **Risk**: localStorage quota exceeded
  - **Mitigation**: Use small keys, handle quota errors gracefully

### Performance Considerations
- Modal is lightweight, no performance concerns
- LocalStorage operations are synchronous but fast

### Accessibility Considerations
- Focus trap: user cannot tab outside modal
- ARIA labels: title, description, buttons
- Keyboard shortcuts: Enter, Escape
- Screen reader announcements for state changes
- Autofocus on primary action button

### Use Cases
1. **Unsaved Changes** (variant: warning): User navigates away with unsaved form data
2. **Delete Confirmation** (variant: danger): User deletes a testimonial or research entry
3. **Publish Changes** (variant: info): User publishes section to public site
4. **Discard Draft** (variant: warning): User discards draft changes

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Component renders correctly for all variants
- [ ] Keyboard navigation works (Enter, Escape)
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests with forms passing
- [ ] Accessibility tested with screen reader
- [ ] Focus trap verified
- [ ] "Don't ask again" tested with localStorage
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No lint warnings
- [ ] Responsive design works on mobile
