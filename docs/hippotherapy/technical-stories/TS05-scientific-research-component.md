# TS05: Scientific Research Section Component

## Implements
**Business Story**: BS08 - Scientific Research Section Management

## Technical Goal
Build the Scientific Research section component with dynamic CRUD for research references. Each reference has a name (150 chars) and link (1000 chars). Support expand/collapse, add/delete with validation, and minimum 1 entry requirement.

## Acceptance Criteria
- [ ] Renders section heading and description fields with character limits
- [ ] Displays list of research references in collapse/expand states
- [ ] "Add +" button is active only when all existing entries are valid
- [ ] Cannot delete last remaining entry (delete icon hidden)
- [ ] Confirmation modal appears before deletion
- [ ] Each reference shows name and link fields when expanded
- [ ] Collapsing preserves entered data
- [ ] URL validation works on reference links
- [ ] Character counters update in real-time
- [ ] Clean-up icons appear on focus with non-empty fields
- [ ] All validation messages display on blur

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/sections/scientific-research-section/ScientificResearchSection.tsx`
- `src/components/admin/hippotherapy/sections/scientific-research-section/ScientificResearchSection.module.scss`
- `src/components/admin/hippotherapy/sections/scientific-research-section/ReferenceEntry.tsx`
- `src/components/admin/hippotherapy/sections/scientific-research-section/ReferenceEntry.module.scss`
- `src/components/admin/hippotherapy/sections/scientific-research-section/ScientificResearchSection.test.tsx`
- `src/components/admin/hippotherapy/sections/scientific-research-section/index.ts`

### Component Structure

**ScientificResearchSection.tsx**
```typescript
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { ReferenceEntry } from './ReferenceEntry';
import { ConfirmationModal } from '../../shared/confirmation-modal';
import { VALIDATION_RULES } from '@/const/admin/hippotherapy/validation-rules';
import { ScientificReference } from '@/types/admin/hippotherapy.types';
import styles from './ScientificResearchSection.module.scss';

export interface ScientificResearchSectionProps {
  heading: string;
  description: string;
  references: ScientificReference[];
  onHeadingChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onReferenceChange: (id: string, field: 'name' | 'link', value: string) => void;
  onReferenceToggle: (id: string) => void;
  onReferenceAdd: () => void;
  onReferenceDelete: (id: string) => void;
  headingError?: string;
  descriptionError?: string;
  referenceErrors: Record<string, { name?: string; link?: string }>;
}

export const ScientificResearchSection: React.FC<ScientificResearchSectionProps> = ({
  heading,
  description,
  references,
  onHeadingChange,
  onDescriptionChange,
  onReferenceChange,
  onReferenceToggle,
  onReferenceAdd,
  onReferenceDelete,
  headingError,
  descriptionError,
  referenceErrors
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const isAddButtonEnabled = React.useMemo(() => {
    // Disable if any reference has validation errors or empty required fields
    return references.every(ref => {
      const errors = referenceErrors[ref.id];
      const hasErrors = errors?.name || errors?.link;
      const hasEmptyFields = !ref.name.trim() || !ref.link.trim();
      return !hasErrors && !hasEmptyFields;
    });
  }, [references, referenceErrors]);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onReferenceDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  return (
    <Box className={styles.scientificResearchSection}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Наукові дослідження
      </Typography>

      <TextInputField
        label="Заголовок"
        value={heading}
        onChange={onHeadingChange}
        maxChars={VALIDATION_RULES.HEADING.MAX_LENGTH}
        required
        error={headingError}
        name="scientificResearch-heading"
      />

      <TextInputField
        label="Опис"
        value={description}
        onChange={onDescriptionChange}
        maxChars={VALIDATION_RULES.DESCRIPTION_SHORT.MAX_LENGTH}
        multiline
        required
        error={descriptionError}
        name="scientificResearch-description"
      />

      <Box className={styles.referencesSection}>
        <Typography variant="subtitle1" className={styles.referencesTitle}>
          Список досліджень
        </Typography>

        <Box className={styles.referencesList}>
          {references.map((reference) => (
            <ReferenceEntry
              key={reference.id}
              reference={reference}
              onFieldChange={(field, value) => onReferenceChange(reference.id, field, value)}
              onToggle={() => onReferenceToggle(reference.id)}
              onDelete={() => handleDeleteClick(reference.id)}
              errors={referenceErrors[reference.id]}
              canDelete={references.length > 1}
            />
          ))}
        </Box>

        <Button
          variant="outlined"
          className={styles.addButton}
          onClick={onReferenceAdd}
          disabled={!isAddButtonEnabled}
          startIcon={<span>+</span>}
        >
          Додати
        </Button>
      </Box>

      <ConfirmationModal
        isOpen={deleteConfirmId !== null}
        title="Видалити наукове дослідження?"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmLabel="ТАК"
        cancelLabel="НІ"
      />
    </Box>
  );
};
```

**ReferenceEntry.tsx**
```typescript
import React from 'react';
import { Box, IconButton, Typography, Collapse } from '@mui/material';
import { ExpandMore, Delete, Close } from '@mui/icons-material';
import { TextInputField } from '../../shared/text-input-field';
import { VALIDATION_RULES } from '@/const/admin/hippotherapy/validation-rules';
import { ScientificReference } from '@/types/admin/hippotherapy.types';
import styles from './ReferenceEntry.module.scss';

export interface ReferenceEntryProps {
  reference: ScientificReference;
  onFieldChange: (field: 'name' | 'link', value: string) => void;
  onToggle: () => void;
  onDelete: () => void;
  errors?: { name?: string; link?: string };
  canDelete: boolean;
}

export const ReferenceEntry: React.FC<ReferenceEntryProps> = ({
  reference,
  onFieldChange,
  onToggle,
  onDelete,
  errors,
  canDelete
}) => {
  const displayTitle = reference.name.trim() || 'Новий запис';

  return (
    <Box className={styles.referenceEntry}>
      <Box className={styles.entryHeader}>
        <Box className={styles.titleSection} onClick={onToggle}>
          <Typography variant="body1" className={styles.entryTitle}>
            {displayTitle}
          </Typography>
          <IconButton
            size="small"
            className={`${styles.expandButton} ${reference.isExpanded ? styles.expanded : ''}`}
          >
            {reference.isExpanded ? <Close /> : <ExpandMore />}
          </IconButton>
        </Box>

        {canDelete && (
          <IconButton
            size="small"
            className={styles.deleteButton}
            onClick={onDelete}
            aria-label="Видалити"
          >
            <Delete />
          </IconButton>
        )}
      </Box>

      <Collapse in={reference.isExpanded}>
        <Box className={styles.entryContent}>
          <TextInputField
            label="Назва"
            value={reference.name}
            onChange={(value) => onFieldChange('name', value)}
            maxChars={VALIDATION_RULES.REFERENCE_NAME.MAX_LENGTH}
            required
            error={errors?.name}
            name={`reference-${reference.id}-name`}
          />

          <TextInputField
            label="Посилання"
            value={reference.link}
            onChange={(value) => onFieldChange('link', value)}
            maxChars={VALIDATION_RULES.REFERENCE_LINK.MAX_LENGTH}
            required
            error={errors?.link}
            name={`reference-${reference.id}-link`}
            type="url"
          />
        </Box>
      </Collapse>
    </Box>
  );
};
```

### Styling Approach

**ScientificResearchSection.module.scss**
```scss
.scientificResearchSection {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #ffffff;
  border-radius: 8px;
}

.sectionTitle {
  font-weight: 600;
  font-size: 20px;
  color: #1a1a1a;
}

.referencesSection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.referencesTitle {
  font-weight: 500;
  font-size: 16px;
  color: #333333;
}

.referencesList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.addButton {
  align-self: flex-start;
  text-transform: none;
  font-weight: 500;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

**ReferenceEntry.module.scss**
```scss
.referenceEntry {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.entryHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f5f5f5;
}

.titleSection {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  gap: 8px;
}

.entryTitle {
  font-weight: 500;
  color: #1a1a1a;
}

.expandButton {
  transition: transform 0.2s ease;
  
  &.expanded {
    transform: rotate(180deg);
  }
}

.deleteButton {
  color: #d32f2f;
  
  &:hover {
    background-color: rgba(211, 47, 47, 0.1);
  }
}

.entryContent {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

## Test Cases

### Unit Tests

**ScientificResearchSection.test.tsx**
```typescript
describe('ScientificResearchSection', () => {
  it('renders section heading and description fields', () => {
    // Test that both input fields render
  });

  it('renders all references in the list', () => {
    // Test that all reference entries display
  });

  it('enables add button when all references are valid', () => {
    // Test add button is enabled with valid data
  });

  it('disables add button when any reference is invalid', () => {
    // Test add button is disabled with validation errors
  });

  it('disables add button when any reference has empty fields', () => {
    // Test add button disabled with empty name or link
  });

  it('calls onReferenceAdd when add button clicked', () => {
    // Test add handler is invoked
  });

  it('shows delete confirmation modal', () => {
    // Test confirmation modal opens on delete click
  });

  it('calls onReferenceDelete when deletion confirmed', () => {
    // Test delete handler invoked after confirmation
  });

  it('hides delete icon when only one reference exists', () => {
    // Test delete icon not shown for last entry
  });
});

describe('ReferenceEntry', () => {
  it('displays reference name as title when expanded', () => {
    // Test title shows reference name
  });

  it('displays "New entry" when name is empty', () => {
    // Test default title for empty name
  });

  it('toggles expand/collapse on click', () => {
    // Test expand/collapse functionality
  });

  it('shows fields when expanded', () => {
    // Test fields visible in expanded state
  });

  it('hides fields when collapsed', () => {
    // Test fields hidden in collapsed state
  });

  it('preserves data when toggling expand/collapse', () => {
    // Test data persists through state changes
  });

  it('calls onFieldChange for name input', () => {
    // Test name field change handler
  });

  it('calls onFieldChange for link input', () => {
    // Test link field change handler
  });

  it('displays validation errors for name', () => {
    // Test name error message shows
  });

  it('displays validation errors for link', () => {
    // Test link error message shows
  });

  it('shows delete button when canDelete is true', () => {
    // Test delete button visible when allowed
  });

  it('hides delete button when canDelete is false', () => {
    // Test delete button hidden for last entry
  });
});
```

### Integration Tests
- Test adding a new reference: click add → new entry appears expanded → fill fields → entry becomes valid → add button re-enables
- Test deleting a reference: click delete → confirmation appears → confirm → entry removed
- Test validation flow: enter invalid URL → blur → error appears → fix URL → error disappears → add button enables
- Test minimum entry constraint: try to delete last entry → delete icon not shown
- Test expand/collapse: expand entry → fill fields → collapse → re-expand → data still present

## Dependencies
**Technical Dependencies**:
- TS01: Foundation types (ScientificReference interface)
- TS02: Validation utilities (URL validation, space management)
- TS16: TextInputField component
- TS17: ConfirmationModal component

**Business Context**: This implements BS08 sprint goal for research bibliography management

## Estimated Effort
**8 hours**
- Component structure and logic: 3h
- CRUD operations and validation: 2h
- Expand/collapse state management: 1h
- Styling: 1h
- Unit and integration tests: 1h

## Technical Notes

### Patterns to Follow
- Look at existing list management patterns in `src/components/admin/` (e.g., FAQ management)
- Use Material-UI Collapse component for smooth expand/collapse animations
- Use `useMemo` to optimize add button disabled state calculation

### Architecture Decisions
- Separate ReferenceEntry into its own component for better testability
- Lift all state management to parent component (controlled components)
- Use confirmation modal for destructive actions (follows project pattern)
- Expand new entries by default for immediate editing

### State Management
- Parent component manages references array
- Each reference has `isExpanded` boolean state
- Validation errors passed down as props per reference ID
- Add button disabled state calculated from all reference validation states

### URL Validation
Use Yup's URL validation from TS04:
```typescript
import { isValidUrl } from '@/utils/functions/admin/hippotherapy/validation';

// In onChange handler
if (field === 'link' && !isValidUrl(value)) {
  setError('Invalid URL format');
}
```

### Accessibility
- Add `aria-label` to delete button
- Use semantic HTML (button for actions)
- Ensure keyboard navigation works for expand/collapse
- Focus management: focus first field when expanding new entry

## Definition of Done
- [ ] All acceptance criteria met
- [ ] ScientificResearchSection component renders all elements
- [ ] ReferenceEntry component handles expand/collapse
- [ ] Add button enable/disable logic works correctly
- [ ] Delete confirmation flow works
- [ ] Cannot delete last entry
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] URL validation works with real URLs
- [ ] Character counters update correctly
- [ ] Clean-up icons appear on focus
