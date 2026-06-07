# TS11: What Is Ipoventia Section Component

## Implements
**Business Story**: BS04 - What Is Ipoventia Section Management

## Technical Goal
Build the What Is Ipoventia section component with heading (50 chars) and long-form description (1000 chars). This section explains the specialized Ipoventia therapeutic approach.

## Acceptance Criteria
- [ ] Renders heading input with 50 character limit
- [ ] Renders description textarea with 1000 character limit
- [ ] Character counters update in real-time
- [ ] Validation triggers on blur for both fields
- [ ] Clean-up icons appear on focus when fields are non-empty
- [ ] Space management works (trim leading/trailing, prevent double spaces)
- [ ] All errors display correctly
- [ ] Description field auto-expands vertically to fit content

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/sections/what-is-ipoventia-section/WhatIsIpoventiaSection.tsx`
- `src/components/admin/hippotherapy/sections/what-is-ipoventia-section/WhatIsIpoventiaSection.module.scss`
- `src/components/admin/hippotherapy/sections/what-is-ipoventia-section/WhatIsIpoventiaSection.test.tsx`
- `src/components/admin/hippotherapy/sections/what-is-ipoventia-section/index.ts`

### Component Structure

**WhatIsIpoventiaSection.tsx**
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { VALIDATION_RULES } from '@/const/admin/hippotherapy';
import styles from './WhatIsIpoventiaSection.module.scss';

export interface WhatIsIpoventiaSectionProps {
  heading: string;
  description: string;
  onHeadingChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  headingError?: string;
  descriptionError?: string;
}

export const WhatIsIpoventiaSection: React.FC<WhatIsIpoventiaSectionProps> = ({
  heading,
  description,
  onHeadingChange,
  onDescriptionChange,
  headingError,
  descriptionError
}) => {
  return (
    <Box className={styles.whatIsIpoventiaSection}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Що таке іповенція
      </Typography>

      <Box className={styles.fieldsContainer}>
        <TextInputField
          label="Заголовок"
          value={heading}
          onChange={onHeadingChange}
          maxChars={VALIDATION_RULES.HEADING.MAX_LENGTH}
          required
          error={headingError}
          name="whatIsIpoventia-heading"
          placeholder="Введіть заголовок розділу"
        />

        <TextInputField
          label="Опис"
          value={description}
          onChange={onDescriptionChange}
          maxChars={VALIDATION_RULES.DESCRIPTION.MAX_LENGTH}
          multiline
          required
          error={descriptionError}
          name="whatIsIpoventia-description"
          placeholder="Введіть детальний опис підходу іповенції. Поясніть, що відрізняє цей метод від інших."
        />
      </Box>
    </Box>
  );
};
```

**index.ts**
```typescript
export { WhatIsIpoventiaSection } from './WhatIsIpoventiaSection';
export type { WhatIsIpoventiaSectionProps } from './WhatIsIpoventiaSection';
```

### Styling Approach

**WhatIsIpoventiaSection.module.scss**
```scss
.whatIsIpoventiaSection {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 24px;
}

.sectionTitle {
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: #1a1a1a;
  margin: 0;
}

.fieldsContainer {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
```

## Test Cases

### Unit Tests

**WhatIsIpoventiaSection.test.tsx**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatIsIpoventiaSection } from './WhatIsIpoventiaSection';

describe('WhatIsIpoventiaSection', () => {
  const defaultProps = {
    heading: '',
    description: '',
    onHeadingChange: jest.fn(),
    onDescriptionChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    expect(screen.getByText('Що таке іповенція')).toBeInTheDocument();
  });

  it('renders heading input field', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    expect(screen.getByLabelText(/Заголовок/i)).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    expect(screen.getByLabelText(/Опис/i)).toBeInTheDocument();
  });

  it('displays heading value', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} heading="Understanding Ipoventia" />);
    expect(screen.getByDisplayValue('Understanding Ipoventia')).toBeInTheDocument();
  });

  it('displays description value', () => {
    const description = 'Ipoventia is a specialized approach...';
    render(<WhatIsIpoventiaSection {...defaultProps} description={description} />);
    expect(screen.getByDisplayValue(description)).toBeInTheDocument();
  });

  it('calls onHeadingChange when heading input changes', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    const input = screen.getByLabelText(/Заголовок/i);
    fireEvent.change(input, { target: { value: 'New Heading' } });
    expect(defaultProps.onHeadingChange).toHaveBeenCalledWith('New Heading');
  });

  it('calls onDescriptionChange when description changes', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    const textarea = screen.getByLabelText(/Опис/i);
    fireEvent.change(textarea, { target: { value: 'New Description' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith('New Description');
  });

  it('displays heading error message', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} headingError="Minimum 5 characters" />);
    expect(screen.getByText('Minimum 5 characters')).toBeInTheDocument();
  });

  it('displays description error message', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} descriptionError="Minimum 10 characters" />);
    expect(screen.getByText('Minimum 10 characters')).toBeInTheDocument();
  });

  it('shows character limit for heading (50)', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    expect(screen.getByText(/0\/50/)).toBeInTheDocument();
  });

  it('shows character limit for description (1000)', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    expect(screen.getByText(/0\/1000/)).toBeInTheDocument();
  });

  it('updates character counter as heading is typed', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} heading="Ipoventia" />);
    expect(screen.getByText(/9\/50/)).toBeInTheDocument();
  });

  it('updates character counter as description is typed', () => {
    const description = 'This is a test description for Ipoventia';
    render(<WhatIsIpoventiaSection {...defaultProps} description={description} />);
    expect(screen.getByText(new RegExp(`${description.length}/1000`))).toBeInTheDocument();
  });

  it('enforces max length for heading (50)', () => {
    const longHeading = 'a'.repeat(51);
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    const input = screen.getByLabelText(/Заголовок/i);
    fireEvent.change(input, { target: { value: longHeading } });
    // Should only call with first 50 characters
    expect(defaultProps.onHeadingChange).toHaveBeenCalledWith('a'.repeat(50));
  });

  it('enforces max length for description (1000)', () => {
    const longDescription = 'a'.repeat(1001);
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    const textarea = screen.getByLabelText(/Опис/i);
    fireEvent.change(textarea, { target: { value: longDescription } });
    // Should only call with first 1000 characters
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith('a'.repeat(1000));
  });

  it('shows clean-up icon when heading is non-empty and focused', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} heading="Test" />);
    const input = screen.getByLabelText(/Заголовок/i);
    fireEvent.focus(input);
    expect(screen.getByLabelText(/clear/i)).toBeInTheDocument();
  });

  it('clears heading when clean-up icon is clicked', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} heading="Test" />);
    const input = screen.getByLabelText(/Заголовок/i);
    fireEvent.focus(input);
    const clearButton = screen.getByLabelText(/clear/i);
    fireEvent.click(clearButton);
    expect(defaultProps.onHeadingChange).toHaveBeenCalledWith('');
  });

  it('marks both fields as required', () => {
    render(<WhatIsIpoventiaSection {...defaultProps} />);
    const labels = screen.getAllByText('*');
    expect(labels).toHaveLength(2); // Both heading and description have asterisk
  });
});
```

### Integration Tests
- Test full editing flow: enter heading → enter description → trigger validation → save
- Test validation: enter short heading (<5 chars) → blur → error shows → add more text → error clears
- Test character limit: type exactly 1000 chars → try to add more → blocked
- Test space management: type leading space → trimmed, type double space → single space
- Test clean-up: type in heading → focus → clean-up icon appears → click → field cleared

## Dependencies
**Technical Dependencies**:
- TS01: Foundation types (VALIDATION_RULES)
- TS02: Validation utilities (space management)
- TS16: TextInputField component

**Business Context**: This is part of BS04 sprint goal for Ipoventia educational content

## Estimated Effort
**4 hours**
- Component structure: 1h
- Props integration: 1h
- Styling: 1h
- Unit tests: 1h

## Technical Notes

### Patterns to Follow
- Follow same structure as TS09 (What Is Hippotherapy section)
- Use consistent styling with other section components
- Description field should be plain text (no rich text for this section)

### Architecture Decisions
- Component is fully controlled (no internal state)
- All validation logic handled by TextInputField component
- Space management handled by TS02 utilities
- Error messages passed as props from parent form validation

### State Management
- Component is fully controlled (no internal state)
- Parent manages heading and description state
- Parent handles validation and error state
- onChange handlers immediately propagate to parent

### Validation Rules
From TS01 VALIDATION_RULES:
- Heading: min 5 chars, max 50 chars, required
- Description: min 10 chars, max 1000 chars, required

### Styling Conventions
- Match section styling from TS08 and TS09
- Use same card border, padding, and spacing
- Description textarea should auto-expand vertically
- No internal scrollbar in textarea

### Accessibility
- Proper label associations with `htmlFor` and `id`
- Mark required fields with asterisk
- Announce validation errors to screen readers with `aria-live`
- Ensure keyboard navigation works properly

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Component renders with heading and description
- [ ] Heading input works with 50 char limit
- [ ] Description textarea works with 1000 char limit
- [ ] Character counters update in real-time
- [ ] All onChange handlers fire correctly
- [ ] Errors display correctly
- [ ] Clean-up icons work correctly
- [ ] Space management works
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] Styling matches Figma design
- [ ] Component exported correctly from index.ts
