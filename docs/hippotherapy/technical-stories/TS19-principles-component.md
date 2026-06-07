# TS19: Principles Section Component

## Implements
**Business Story**: BS10 - Principles Section Management

## Technical Goal
Build the Principles section component with heading (50 chars), 5 description fields (each 300 chars), and an image (1440×800). This section communicates the core principles of the therapeutic approach.

## Acceptance Criteria
- [ ] Renders heading input with 50 character limit
- [ ] Renders 5 description textarea fields with 300 character limit each
- [ ] Renders image upload field with 1440×800 dimension validation
- [ ] Character counters update in real-time for all fields
- [ ] Validation triggers on blur for all fields
- [ ] Clean-up icons appear on focus when fields are non-empty
- [ ] Image upload validates size (<5MB) and format
- [ ] Image upload validates minimum dimensions (1440×800)
- [ ] Default image displays when no custom image uploaded
- [ ] Delete button appears on hover over uploaded image
- [ ] All errors display correctly per description field
- [ ] Description fields are clearly numbered (Principle 1-5)

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/sections/principles-section/PrinciplesSection.tsx`
- `src/components/admin/hippotherapy/sections/principles-section/PrinciplesSection.module.scss`
- `src/components/admin/hippotherapy/sections/principles-section/PrinciplesSection.test.tsx`
- `src/components/admin/hippotherapy/sections/principles-section/index.ts`

### Component Structure

**PrinciplesSection.tsx**
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { ImageUploadField } from '../../shared/image-upload-field';
import { VALIDATION_RULES, IMAGE_DIMENSIONS } from '@/const/admin/hippotherapy';
import { ImageData } from '@/types/admin/hippotherapy.types';
import styles from './PrinciplesSection.module.scss';

export interface PrinciplesSectionProps {
  heading: string;
  descriptions: string[]; // Array of 5 descriptions
  image: ImageData;
  onHeadingChange: (value: string) => void;
  onDescriptionChange: (index: number, value: string) => void;
  onImageUpload: (file: File, croppedBase64: string) => void;
  onImageDelete: () => void;
  headingError?: string;
  descriptionErrors: Record<number, string>; // Errors keyed by index (0-4)
}

export const PrinciplesSection: React.FC<PrinciplesSectionProps> = ({
  heading,
  descriptions,
  image,
  onHeadingChange,
  onDescriptionChange,
  onImageUpload,
  onImageDelete,
  headingError,
  descriptionErrors
}) => {
  return (
    <Box className={styles.principlesSection}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Принципи
      </Typography>

      <Box className={styles.fieldsContainer}>
        <TextInputField
          label="Заголовок"
          value={heading}
          onChange={onHeadingChange}
          maxChars={VALIDATION_RULES.HEADING.MAX_LENGTH}
          required
          error={headingError}
          name="principles-heading"
          placeholder="Введіть заголовок розділу"
        />

        <Box className={styles.principlesList}>
          {descriptions.map((description, index) => (
            <Box key={index} className={styles.principleItem}>
              <Typography variant="subtitle2" className={styles.principleLabel}>
                Принцип {index + 1}
              </Typography>
              <TextInputField
                label={`Опис принципу ${index + 1}`}
                value={description}
                onChange={(value) => onDescriptionChange(index, value)}
                maxChars={VALIDATION_RULES.DESCRIPTION_SHORT.MAX_LENGTH}
                multiline
                required
                error={descriptionErrors[index]}
                name={`principles-description-${index}`}
                placeholder={`Опишіть ${index + 1}-й принцип підходу`}
              />
            </Box>
          ))}
        </Box>

        <ImageUploadField
          currentImage={image.url}
          defaultImage="/assets/images/hippotherapy/default-principles.jpg"
          recommendedSize={IMAGE_DIMENSIONS.PRINCIPLES}
          onUpload={onImageUpload}
          onDelete={onImageDelete}
          label="Зображення"
          helperText="Рекомендований розмір: 1440×800 пікселів"
        />
      </Box>
    </Box>
  );
};
```

**index.ts**
```typescript
export { PrinciplesSection } from './PrinciplesSection';
export type { PrinciplesSectionProps } from './PrinciplesSection';
```

### Styling Approach

**PrinciplesSection.module.scss**
```scss
.principlesSection {
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
  gap: 24px;
}

.principlesList {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.principleItem {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.principleLabel {
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #555555;
  margin: 0;
}
```

## Test Cases

### Unit Tests

**PrinciplesSection.test.tsx**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PrinciplesSection } from './PrinciplesSection';

describe('PrinciplesSection', () => {
  const mockDescriptions = ['', '', '', '', ''];
  
  const defaultProps = {
    heading: '',
    descriptions: mockDescriptions,
    image: { url: null, isDefault: true },
    onHeadingChange: jest.fn(),
    onDescriptionChange: jest.fn(),
    onImageUpload: jest.fn(),
    onImageDelete: jest.fn(),
    descriptionErrors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title', () => {
    render(<PrinciplesSection {...defaultProps} />);
    expect(screen.getByText('Принципи')).toBeInTheDocument();
  });

  it('renders heading input field', () => {
    render(<PrinciplesSection {...defaultProps} />);
    expect(screen.getByLabelText(/^Заголовок$/i)).toBeInTheDocument();
  });

  it('renders exactly 5 principle description fields', () => {
    render(<PrinciplesSection {...defaultProps} />);
    expect(screen.getByText('Принцип 1')).toBeInTheDocument();
    expect(screen.getByText('Принцип 2')).toBeInTheDocument();
    expect(screen.getByText('Принцип 3')).toBeInTheDocument();
    expect(screen.getByText('Принцип 4')).toBeInTheDocument();
    expect(screen.getByText('Принцип 5')).toBeInTheDocument();
  });

  it('renders image upload field', () => {
    render(<PrinciplesSection {...defaultProps} />);
    expect(screen.getByText(/Зображення/i)).toBeInTheDocument();
  });

  it('displays heading value', () => {
    render(<PrinciplesSection {...defaultProps} heading="Core Principles" />);
    expect(screen.getByDisplayValue('Core Principles')).toBeInTheDocument();
  });

  it('displays description values', () => {
    const descriptions = ['Principle 1 text', 'Principle 2 text', '', '', ''];
    render(<PrinciplesSection {...defaultProps} descriptions={descriptions} />);
    expect(screen.getByDisplayValue('Principle 1 text')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Principle 2 text')).toBeInTheDocument();
  });

  it('calls onHeadingChange when heading input changes', () => {
    render(<PrinciplesSection {...defaultProps} />);
    const input = screen.getByLabelText(/^Заголовок$/i);
    fireEvent.change(input, { target: { value: 'New Heading' } });
    expect(defaultProps.onHeadingChange).toHaveBeenCalledWith('New Heading');
  });

  it('calls onDescriptionChange with correct index when description changes', () => {
    render(<PrinciplesSection {...defaultProps} />);
    const descriptionInputs = screen.getAllByLabelText(/Опис принципу/i);
    fireEvent.change(descriptionInputs[0], { target: { value: 'First principle' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith(0, 'First principle');
  });

  it('calls onDescriptionChange for different indices', () => {
    render(<PrinciplesSection {...defaultProps} />);
    const descriptionInputs = screen.getAllByLabelText(/Опис принципу/i);
    
    fireEvent.change(descriptionInputs[2], { target: { value: 'Third principle' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith(2, 'Third principle');
    
    fireEvent.change(descriptionInputs[4], { target: { value: 'Fifth principle' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith(4, 'Fifth principle');
  });

  it('displays heading error message', () => {
    render(<PrinciplesSection {...defaultProps} headingError="Minimum 5 characters" />);
    expect(screen.getByText('Minimum 5 characters')).toBeInTheDocument();
  });

  it('displays description error for specific index', () => {
    const descriptionErrors = { 1: 'Description too short', 3: 'Required field' };
    render(<PrinciplesSection {...defaultProps} descriptionErrors={descriptionErrors} />);
    expect(screen.getByText('Description too short')).toBeInTheDocument();
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('shows character limit for heading (50)', () => {
    render(<PrinciplesSection {...defaultProps} />);
    expect(screen.getByText(/0\/50/)).toBeInTheDocument();
  });

  it('shows character limit for each description (300)', () => {
    render(<PrinciplesSection {...defaultProps} />);
    const counterMatches = screen.getAllByText(/0\/300/);
    expect(counterMatches).toHaveLength(5); // 5 descriptions
  });

  it('updates character counter as description is typed', () => {
    const descriptions = ['Test principle', '', '', '', ''];
    render(<PrinciplesSection {...defaultProps} descriptions={descriptions} />);
    expect(screen.getByText(/14\/300/)).toBeInTheDocument();
  });

  it('calls onImageUpload when image is uploaded', async () => {
    render(<PrinciplesSection {...defaultProps} />);
    const file = new File(['image'], 'principles.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(defaultProps.onImageUpload).toHaveBeenCalled();
    });
  });

  it('calls onImageDelete when image delete is triggered', () => {
    const propsWithImage = {
      ...defaultProps,
      image: { url: 'https://example.com/principles.jpg', isDefault: false }
    };
    render(<PrinciplesSection {...propsWithImage} />);
    
    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onImageDelete).toHaveBeenCalled();
  });

  it('displays default image when no custom image uploaded', () => {
    render(<PrinciplesSection {...defaultProps} />);
    const img = screen.getByAltText(/default/i);
    expect(img).toHaveAttribute('src', '/assets/images/hippotherapy/default-principles.jpg');
  });

  it('displays custom image when uploaded', () => {
    const propsWithImage = {
      ...defaultProps,
      image: { url: 'https://example.com/custom-principles.jpg', isDefault: false }
    };
    render(<PrinciplesSection {...propsWithImage} />);
    const img = screen.getByAltText(/principles/i);
    expect(img).toHaveAttribute('src', 'https://example.com/custom-principles.jpg');
  });

  it('renders principles in sequential order', () => {
    render(<PrinciplesSection {...defaultProps} />);
    const principles = screen.getAllByText(/Принцип/);
    expect(principles[0]).toHaveTextContent('Принцип 1');
    expect(principles[1]).toHaveTextContent('Принцип 2');
    expect(principles[2]).toHaveTextContent('Принцип 3');
    expect(principles[3]).toHaveTextContent('Принцип 4');
    expect(principles[4]).toHaveTextContent('Принцип 5');
  });

  it('marks all description fields as required', () => {
    render(<PrinciplesSection {...defaultProps} />);
    const labels = screen.getAllByText('*');
    expect(labels.length).toBeGreaterThanOrEqual(6); // Heading + 5 descriptions
  });
});
```

### Integration Tests
- Test full editing flow: enter heading → enter all 5 principles → upload image → validate
- Test validation per principle: leave principle 2 empty → blur → error shows for principle 2 only
- Test character limits: type 301 characters in principle 3 → blocked at 300
- Test image upload: select file → validate 1440×800 dimensions → cropper → save
- Test sequential editing: fill principles 1-5 in order → all validate correctly

## Dependencies
**Technical Dependencies**:
- TS01: Foundation types (ImageData, VALIDATION_RULES, IMAGE_DIMENSIONS)
- TS02: Validation utilities (space management)
- TS15: ImageUploadField component
- TS16: TextInputField component

**Business Context**: This is part of BS10 sprint goal for principles content

## Estimated Effort
**6 hours**
- Component structure (5 description fields + image): 2h
- Props integration with array handling: 1.5h
- Styling and layout: 1.5h
- Unit tests: 1h

## Technical Notes

### Patterns to Follow
- Use array for 5 descriptions with index-based management
- Number each principle (Principle 1-5) for clarity
- Each principle description has light background to distinguish from section
- Follow section styling from other components

### Architecture Decisions
- Descriptions managed as array of strings (length: 5)
- Index-based error tracking (0-4)
- onChange passes index + value for targeted updates
- All 5 descriptions are required fields
- Image upload same as other sections

### State Management
- Parent manages descriptions array (always length 5)
- Parent manages heading and image state
- Parent handles validation and error state per index
- onChange handlers propagate index + value

### Data Structure
From spec, principles section contains:
```typescript
{
  heading: string;
  descriptions: string[]; // Array of 5 descriptions, each max 300 chars
  image: ImageData;
}
```

### Image Requirements
- Default image path: `/assets/images/hippotherapy/default-principles.jpg`
- Recommended size: 1440×800 pixels
- Maximum file size: 5 MB
- Allowed formats: jpeg, jpg, png, webp
- Image cropper should maintain 1440:800 aspect ratio

### Validation Rules
- Heading: min 5 chars, max 50 chars, required
- Each description: min 10 chars, max 300 chars, required (all 5)

### Layout Structure
```
┌─ Heading ─────────────────────────┐
├─ Principle 1 ─────────────────────┤
├─ Principle 2 ─────────────────────┤
├─ Principle 3 ─────────────────────┤
├─ Principle 4 ─────────────────────┤
├─ Principle 5 ─────────────────────┤
└─ Image ───────────────────────────┘
```

### Styling Conventions
- Section follows standard section card styling
- Each principle item has nested styling (light gray background)
- Principle labels (1-5) clearly visible
- Vertical stacking of all principles
- Maintain consistent spacing between principle items (20px gap)

### Accessibility
- Use unique field names per principle (e.g., `principles-description-0`, `principles-description-1`)
- Label each description with principle number
- All fields marked as required
- Sequential tab order (heading → principle 1 → ... → principle 5 → image)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Component renders with heading, 5 description fields, and image
- [ ] Heading input works with 50 char limit
- [ ] All 5 description fields work with 300 char limit
- [ ] Image upload works with 1440×800 dimension validation
- [ ] Index-based onChange handlers work correctly
- [ ] Errors display correctly per principle index
- [ ] Character counters update in real-time
- [ ] All fields validated correctly
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] Styling matches Figma design
- [ ] Component exported correctly from index.ts
