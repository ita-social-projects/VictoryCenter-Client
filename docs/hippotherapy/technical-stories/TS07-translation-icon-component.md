# TS07: Translation Icon Component

## Implements
**Business Stories**: 
- BS11 - Admin Page Integration

## Technical Goal
Create a visual translation status indicator component that displays language flags, completion status, and opens translation modals when clicked.

## Acceptance Criteria
- [ ] Component displays language flag icon (UK/EN)
- [ ] Component shows translation status color (green=complete, yellow=incomplete, red=not started)
- [ ] Component displays completion percentage on hover
- [ ] Component is clickable to open translation modal
- [ ] Component shows loading state during translation fetch
- [ ] Component supports disabled state
- [ ] Component has tooltip with status details
- [ ] Component is keyboard accessible (Tab, Enter)
- [ ] Component uses consistent styling with Victory Center design
- [ ] Component is small and fits inline with section headers
- [ ] Component animates on status change
- [ ] Component supports ARIA labels for screen readers

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/shared/translation-icon/TranslationIcon.tsx`
- `src/components/admin/hippotherapy/shared/translation-icon/TranslationIcon.module.scss`
- `src/components/admin/hippotherapy/shared/translation-icon/TranslationIcon.test.tsx`
- `src/components/admin/hippotherapy/shared/translation-icon/index.ts`

### Code Example

**TranslationIcon.tsx**:
```typescript
import React from 'react';
import { IconButton, Tooltip, Badge, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';
import { 
  TranslationLanguage, 
  TranslationStatus, 
  TranslationState,
  getTranslationStatusColor,
} from '@/types/admin/hippotherapy-translation.types';
import { TRANSLATION_LANGUAGE_FLAGS } from '@/const/admin/hippotherapy-translation-constants';
import styles from './TranslationIcon.module.scss';

interface TranslationIconProps {
  language: TranslationLanguage;
  translationState: TranslationState;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const statusIcons = {
  [TranslationStatus.COMPLETE]: CheckCircleIcon,
  [TranslationStatus.INCOMPLETE]: WarningIcon,
  [TranslationStatus.NOT_STARTED]: ErrorOutlineIcon,
};

export const TranslationIcon: React.FC<TranslationIconProps> = ({
  language,
  translationState,
  onClick,
  disabled = false,
  loading = false,
}) => {
  const { t } = useTranslation('hippotherapyAdmin');
  
  const flag = TRANSLATION_LANGUAGE_FLAGS[language];
  const StatusIcon = statusIcons[translationState.status];
  const statusColor = getTranslationStatusColor(translationState.status);
  
  const tooltipTitle = t('translationIcon.tooltip', {
    language: t(`translation.language.${language}`),
    status: t(`translation.status.${translationState.status.toLowerCase()}`),
    percentage: translationState.completionPercentage,
  });

  return (
    <Tooltip title={tooltipTitle} arrow>
      <span className={styles.wrapper}>
        <IconButton
          onClick={onClick}
          disabled={disabled || loading}
          size="small"
          className={styles.iconButton}
          aria-label={tooltipTitle}
        >
          <Badge
            badgeContent={
              loading ? (
                <CircularProgress size={12} className={styles.loadingSpinner} />
              ) : (
                <StatusIcon
                  className={styles.statusIcon}
                  sx={{ color: `${statusColor}.main`, fontSize: 14 }}
                />
              )
            }
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <span className={styles.flag} role="img" aria-label={language}>
              {flag}
            </span>
          </Badge>
        </IconButton>
      </span>
    </Tooltip>
  );
};
```

**TranslationIcon.module.scss**:
```scss
@import '@/assets/sass/variables/colors';

.wrapper {
  display: inline-flex;
  align-items: center;
}

.iconButton {
  padding: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.flag {
  font-size: 20px;
  line-height: 1;
  display: inline-block;
}

.statusIcon {
  transition: all 0.3s ease;
}

.loadingSpinner {
  color: $color-primary;
}
```

### Architecture Decisions
- Use Material-UI IconButton and Badge for consistent styling
- Display language flag emoji (simple, no external assets)
- Use MUI color system for status colors (success, warning, error)
- Tooltip provides detailed status information
- Badge overlay shows status icon on flag
- Support loading state with spinner

## Test Cases

### Unit Tests

**File**: `TranslationIcon.test.tsx`

- Test component renders flag for language
- Test component renders correct status icon for each status
- Test component displays tooltip on hover
- Test onClick handler fires when clicked
- Test disabled state prevents click
- Test loading state shows spinner
- Test accessibility: ARIA label present
- Test keyboard navigation: Enter key triggers onClick
- Test status color matches translation status
- Test completion percentage displays in tooltip

### Integration Tests
- Test component integrates with translation gate
- Test component opens translation modal on click
- Test component updates when translation status changes

## Dependencies

**Technical Dependencies**:
- TS04: Translation Types and Constants (must complete first)

**Business Context**: Part of BS11 (Admin Page Integration)

## Estimated Effort

**3 hours**

- Component implementation: 1.5 hours
- Styling and animations: 0.5 hours
- Test cases: 1 hour

## Technical Notes

### Patterns to Follow
- Use Material-UI components for consistency
- Use i18next for tooltip text
- Use emoji flags (simple, no SVG dependencies)
- Provide ARIA labels for accessibility

### Risks and Mitigation
- **Risk**: Emoji flags not supported in all browsers
  - **Mitigation**: Provide fallback text (UK/EN)
- **Risk**: Status colors not distinguishable for colorblind users
  - **Mitigation**: Use icons in addition to colors

### Accessibility Considerations
- ARIA label describes language and status
- Keyboard accessible (Tab, Enter)
- Tooltip provides additional context
- Icons supplement color coding

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Component renders correctly for all languages and statuses
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Accessibility tested with screen reader
- [ ] Code reviewed and approved
- [ ] No lint warnings
