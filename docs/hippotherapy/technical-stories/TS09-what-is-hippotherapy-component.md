# TS09: What Is Hippotherapy Section Component

## Implements
**Business Story**: BS02 - What Is Hippotherapy Section Management

## Technical Goal
Build the What Is Hippotherapy section component with heading (50 chars) and long-form description (1000 chars with rich text support for bold, italic, and links).

## Acceptance Criteria
- [ ] Renders heading input with 50 character limit
- [ ] Renders rich text description input with 1000 character limit
- [ ] Character counters update in real-time
- [ ] Rich text toolbar shows bold, italic, and link options
- [ ] Keyboard shortcuts work (Ctrl+B for bold, Ctrl+I for italic)
- [ ] Validation triggers on blur for both fields
- [ ] Clean-up icons appear on focus when fields are non-empty
- [ ] Link insertion opens URL input dialog
- [ ] All formatting preserved on save
- [ ] All errors display correctly

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/sections/what-is-hippotherapy-section/WhatIsHippotherapySection.tsx`
- `src/components/admin/hippotherapy/sections/what-is-hippotherapy-section/WhatIsHippotherapySection.module.scss`
- `src/components/admin/hippotherapy/sections/what-is-hippotherapy-section/WhatIsHippotherapySection.test.tsx`
- `src/components/admin/hippotherapy/sections/what-is-hippotherapy-section/index.ts`

### Component Structure

**WhatIsHippotherapySection.tsx**
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { VALIDATION_RULES } from '@/const/admin/hippotherapy';
import styles from './WhatIsHippotherapySection.module.scss';

export interface WhatIsHippotherapySectionProps {
  heading: string;
  description: string;
  onHeadingChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  headingError?: string;
  descriptionError?: string;
}

export const WhatIsHippotherapySection: React.FC<WhatIsHippotherapySectionProps> = ({
  heading,
  description,
  onHeadingChange,
  onDescriptionChange,
  headingError,
  descriptionError
}) => {
  return (
    <Box className={styles.whatIsHippotherapySection}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Що таке іпотерапія
      </Typography>

      <Box className={styles.fieldsContainer}>
        <TextInputField
          label="Заголовок"
          value={heading}
          onChange={onHeadingChange}
          maxChars={VALIDATION_RULES.HEADING.MAX_LENGTH}
          required
          error={headingError}
          name="whatIsHippotherapy-heading"
          placeholder="Введіть заголовок розділу"
        />

        <TextInputField
          label="Опис"
          value={description}
          onChange={onDescriptionChange}
          maxChars={VALIDATION_RULES.DESCRIPTION.MAX_LENGTH}
          multiline
          richText
          required
          error={descriptionError}
          name="whatIsHippotherapy-description"
          placeholder="Введіть детальний опис іпотерапії. Використовуйте форматування для виділення ключових термінів."
        />
      </Box>
    </Box>
  );
};
```

**index.ts**
```typescript
export { WhatIsHippotherapySection } from './WhatIsHippotherapySection';
export type { WhatIsHippotherapySectionProps } from './WhatIsHippotherapySection';
```

### Styling Approach

**WhatIsHippotherapySection.module.scss**
```scss
.whatIsHippotherapySection {
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

**WhatIsHippotherapySection.test.tsx**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatIsHippotherapySection } from './WhatIsHippotherapySection';

describe('WhatIsHippotherapySection', () => {
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
    render(<WhatIsHippotherapySection {...defaultProps} />);
    expect(screen.getByText('Що таке іпотерапія')).toBeInTheDocument();
  });

  it('renders heading input field', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    expect(screen.getByLabelText(/Заголовок/i)).toBeInTheDocument();
  });

  it('renders description rich text field', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    expect(screen.getByLabelText(/Опис/i)).toBeInTheDocument();
  });

  it('displays heading value', () => {
    render(<WhatIsHippotherapySection {...defaultProps} heading="What is Hippotherapy" />);
    expect(screen.getByDisplayValue('What is Hippotherapy')).toBeInTheDocument();
  });

  it('displays description value', () => {
    const description = 'Hippotherapy is a therapeutic intervention...';
    render(<WhatIsHippotherapySection {...defaultProps} description={description} />);
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('calls onHeadingChange when heading input changes', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    const input = screen.getByLabelText(/Заголовок/i);
    fireEvent.change(input, { target: { value: 'New Heading' } });
    expect(defaultProps.onHeadingChange).toHaveBeenCalledWith('New Heading');
  });

  it('calls onDescriptionChange when description changes', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    const editor = screen.getByLabelText(/Опис/i);
    fireEvent.change(editor, { target: { value: 'New Description' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith('New Description');
  });

  it('displays heading error message', () => {
    render(<WhatIsHippotherapySection {...defaultProps} headingError="Minimum 5 characters" />);
    expect(screen.getByText('Minimum 5 characters')).toBeInTheDocument();
  });

  it('displays description error message', () => {
    render(<WhatIsHippotherapySection {...defaultProps} descriptionError="Minimum 10 characters" />);
    expect(screen.getByText('Minimum 10 characters')).toBeInTheDocument();
  });

  it('shows character limit for heading (50)', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    expect(screen.getByText(/0\/50/)).toBeInTheDocument();
  });

  it('shows character limit for description (1000)', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    expect(screen.getByText(/0\/1000/)).toBeInTheDocument();
  });

  it('updates character counter as heading is typed', () => {
    render(<WhatIsHippotherapySection {...defaultProps} heading="Hippotherapy" />);
    expect(screen.getByText(/12\/50/)).toBeInTheDocument();
  });

  it('updates character counter as description is typed', () => {
    const description = 'This is a test description';
    render(<WhatIsHippotherapySection {...defaultProps} description={description} />);
    expect(screen.getByText(new RegExp(`${description.length}/1000`))).toBeInTheDocument();
  });

  it('displays rich text toolbar', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    expect(screen.getByLabelText(/bold/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/italic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/link/i)).toBeInTheDocument();
  });

  it('applies bold formatting when bold button clicked', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    const boldButton = screen.getByLabelText(/bold/i);
    fireEvent.click(boldButton);
    // Verify bold formatting is applied to selected text
  });

  it('applies italic formatting when italic button clicked', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    const italicButton = screen.getByLabelText(/italic/i);
    fireEvent.click(italicButton);
    // Verify italic formatting is applied
  });

  it('opens link dialog when link button clicked', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    const linkButton = screen.getByLabelText(/link/i);
    fireEvent.click(linkButton);
    expect(screen.getByText(/Insert URL/i)).toBeInTheDocument();
  });

  it('supports Ctrl+B keyboard shortcut for bold', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    const editor = screen.getByLabelText(/Опис/i);
    fireEvent.keyDown(editor, { key: 'b', ctrlKey: true });
    // Verify bold formatting is applied
  });

  it('supports Ctrl+I keyboard shortcut for italic', () => {
    render(<WhatIsHippotherapySection {...defaultProps} />);
    const editor = screen.getByLabelText(/Опис/i);
    fireEvent.keyDown(editor, { key: 'i', ctrlKey: true });
    // Verify italic formatting is applied
  });
});
```

### Integration Tests
- Test full editing flow: enter heading → enter description → apply bold to key terms → add link → validate → save
- Test rich text preservation: format text → save → reload → formatting preserved
- Test character limit with rich text: type 1000 chars → try to add more → blocked
- Test validation with formatted text: enter <10 chars formatted → blur → error shows → add more text → error clears
- Test link insertion: select text → click link button → enter URL → confirm → link appears

## Dependencies
**Technical Dependencies**:
- TS01: Foundation types (VALIDATION_RULES)
- TS02: Validation utilities (space management)
- TS16: TextInputField component with rich text support

**Business Context**: This is part of BS02 sprint goal for hippotherapy educational content

## Estimated Effort
**4 hours**
- Component structure: 1h
- Rich text integration: 1h
- Styling: 1h
- Unit tests: 1h

## Technical Notes

### Patterns to Follow
- Use the same rich text editor (Lexical) as existing in the project (see `src/components/admin/rich-text-input/`)
- Follow character counting logic that counts plain text (not HTML markup)
- Ensure rich text output is sanitized for XSS prevention

### Architecture Decisions
- TextInputField component handles rich text via `richText` prop
- Rich text editor is Lexical-based (already integrated in project)
- Character counter counts plain text characters (not markup)
- Rich text markup stored as HTML or Lexical JSON (following project pattern)

### Rich Text Features
**Toolbar buttons**:
- Bold: `<strong>` tag or `**text**`
- Italic: `<em>` tag or `*text*`
- Link: `<a href="url">text</a>`

**Keyboard shortcuts**:
- Ctrl+B: Toggle bold
- Ctrl+I: Toggle italic

**Validation**:
- Character count excludes HTML tags
- Empty rich text (only `<p></p>`) counts as empty for validation
- Links must be valid URLs (http/https)

### State Management
- Component is fully controlled (no internal state)
- Parent manages heading and description state
- Rich text content passed as string (HTML or Lexical JSON)
- onChange passes updated rich text content to parent

### Styling Conventions
- Match section styling from TS08 (title section)
- Rich text field should auto-expand vertically (no internal scrollbar)
- Toolbar appears above editor (fixed position)
- Character counter appears below editor

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Component renders with heading and rich text description
- [ ] Heading input works with 50 char limit
- [ ] Rich text description works with 1000 char limit
- [ ] Bold, italic, and link formatting work
- [ ] Keyboard shortcuts work
- [ ] Character counters update correctly
- [ ] All onChange handlers fire correctly
- [ ] Errors display correctly
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] Styling matches Figma design
- [ ] Rich text formatting preserved on save
- [ ] Component exported correctly from index.ts
