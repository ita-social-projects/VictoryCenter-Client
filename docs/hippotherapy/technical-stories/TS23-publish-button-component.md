# TS23: Publish Button Component

## Implements
**Business Stories**: BS01-BS10 (all section management stories)

## Technical Goal
Create a reusable publish/draft toggle button component that displays publish status and triggers publish actions with confirmation.

## Acceptance Criteria
- [ ] Component displays current publish status (Published/Draft)
- [ ] Component toggles between publish and unpublish states
- [ ] Component shows confirmation modal before publishing
- [ ] Component shows loading state during publish operation
- [ ] Component integrates with section forms
- [ ] Component disabled when form has validation errors
- [ ] Component provides visual feedback (icon, color)
- [ ] Component supports keyboard accessibility
- [ ] Component displays last published date/time
- [ ] Component handles API errors gracefully

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/shared/publish-button/PublishButton.tsx`
- `src/components/admin/hippotherapy/shared/publish-button/PublishButton.module.scss`
- `src/components/admin/hippotherapy/shared/publish-button/PublishButton.test.tsx`

### Code Example

```typescript
import React, { useState } from 'react';
import { Button, Tooltip, CircularProgress } from '@mui/material';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import { useTranslation } from 'react-i18next';
import { ConfirmationModal } from '../confirmation-modal';
import styles from './PublishButton.module.scss';

interface PublishButtonProps {
  isPublished: boolean;
  onPublish: () => Promise<void>;
  onUnpublish: () => Promise<void>;
  disabled?: boolean;
  lastPublishedDate?: Date;
}

export const PublishButton: React.FC<PublishButtonProps> = ({
  isPublished,
  onPublish,
  onUnpublish,
  disabled = false,
  lastPublishedDate,
}) => {
  const { t } = useTranslation('hippotherapyAdmin');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'publish' | 'unpublish'>('publish');

  const handleClick = () => {
    setAction(isPublished ? 'unpublish' : 'publish');
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (action === 'publish') {
        await onPublish();
      } else {
        await onUnpublish();
      }
    } finally {
      setLoading(false);
    }
  };

  const tooltipTitle = isPublished
    ? t('publishButton.publishedTooltip', { date: lastPublishedDate?.toLocaleDateString() })
    : t('publishButton.draftTooltip');

  return (
    <>
      <Tooltip title={tooltipTitle} arrow>
        <span>
          <Button
            variant={isPublished ? 'outlined' : 'contained'}
            color={isPublished ? 'default' : 'primary'}
            startIcon={loading ? <CircularProgress size={16} /> : isPublished ? <UnpublishedIcon /> : <PublishIcon />}
            onClick={handleClick}
            disabled={disabled || loading}
            className={styles.button}
          >
            {loading ? t('publishButton.processing') : isPublished ? t('publishButton.unpublish') : t('publishButton.publish')}
          </Button>
        </span>
      </Tooltip>

      <ConfirmationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title={t(`publishButton.${action}ModalTitle`)}
        message={t(`publishButton.${action}ModalMessage`)}
        variant={action === 'unpublish' ? 'warning' : 'info'}
      />
    </>
  );
};
```

## Test Cases

### Unit Tests
- Test component renders publish button when unpublished
- Test component renders unpublish button when published
- Test onClick opens confirmation modal
- Test confirm triggers onPublish/onUnpublish
- Test disabled state prevents interaction
- Test loading state displays spinner
- Test tooltip displays last published date

## Dependencies
- TS17: ConfirmationModal (must complete first)

## Estimated Effort
**4 hours**

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests passing (>90% coverage)
- [ ] Code reviewed and approved
