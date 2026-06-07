# TS12: Center of Ipoventia Section Component

## Implements
**Business Story**: BS05 - Center of Ipoventia Section Management

## Technical Goal
Build the Center of Ipoventia section component with heading (50 chars), description (300 chars), additional description (50 chars, optional), and image (1440×420). This section emphasizes the patient-centered nature of the approach.

## Acceptance Criteria
- [ ] Renders heading input with 50 character limit
- [ ] Renders description textarea with 300 character limit
- [ ] Renders additional description input with 50 character limit (optional)
- [ ] Renders image upload field with 1440×420 dimension validation
- [ ] Character counters update in real-time
- [ ] Validation triggers on blur for required fields
- [ ] Additional description is optional (no required validation)
- [ ] Clean-up icons appear on focus when fields are non-empty
- [ ] Image upload validates size (<5MB) and format (jpeg, jpg, png, webp)
- [ ] Image upload validates minimum dimensions (1440×420)
- [ ] Default image displays when no custom image uploaded
- [ ] Delete button appears on hover over uploaded image
- [ ] All errors display correctly

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/sections/center-of-ipoventia-section/CenterOfIpoventiaSection.tsx`
- `src/components/admin/hippotherapy/sections/center-of-ipoventia-section/CenterOfIpoventiaSection.module.scss`
- `src/components/admin/hippotherapy/sections/center-of-ipoventia-section/CenterOfIpoventiaSection.test.tsx`
- `src/components/admin/hippotherapy/sections/center-of-ipoventia-section/index.ts`

### Component Structure

**CenterOfIpoventiaSection.tsx**
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { ImageUploadField } from '../../shared/image-upload-field';
import { VALIDATION_RULES, IMAGE_DIMENSIONS } from '@/const/admin/hippotherapy';
import { ImageData } from '@/types/admin/hippotherapy.types';
import styles from './CenterOfIpoventiaSection.module.scss';

export interface CenterOfIpoventiaSectionProps {
  heading: string;
  description: string;
  additionalDescription: string;
  image: ImageData;
  onHeadingChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAdditionalDescriptionChange: (value: string) => void;
  onImageUpload: (file: File, croppedBase64: string) => void;
  onImageDelete: () => void;
  headingError?: string;
  descriptionError?: string;
  additionalDescriptionError?: string;
}

export const CenterOfIpoventiaSection: React.FC<CenterOfIpoventiaSectionProps> = ({
  heading,
  description,
  additionalDescription,
  image,
  onHeadingChange,
  onDescriptionChange,
  onAdditionalDescriptionChange,
  onImageUpload,
  onImageDelete,
  headingError,
  descriptionError,
  additionalDescriptionError
}) => {
  return (
    <Box className={styles.centerOfIpoventiaSection}>
      <Typography variant="h6" className={styles.sectionTitle}>
        В центрі іповенції
      </Typography>

      <Box className={styles.fieldsContainer}>
        <TextInputField
          label="Заголовок"
          value={heading}
          onChange={onHeadingChange}
          maxChars={VALIDATION_RULES.HEADING.MAX_LENGTH}
          required
          error={headingError}
          name="centerOfIpoventia-heading"
          placeholder="Введіть заголовок розділу"
        />

        <TextInputField
          label="Опис"
          value={description}
          onChange={onDescriptionChange}
          maxChars={VALIDATION_RULES.DESCRIPTION_SHORT.MAX_LENGTH}
          multiline
          required
          error={descriptionError}
          name="centerOfIpoventia-description"
          placeholder="Опишіть філософію підходу, орієнтованого на пацієнта"
        />

        <TextInputField
          label="Додатковий опис"
          value={additionalDescription}
          onChange={onAdditionalDescriptionChange}
          maxChars={VALIDATION_RULES.ADDITIONAL_DESCRIPTION.MAX_LENGTH}
          multiline
          required={false}
          error={additionalDescriptionError}
          name="centerOfIpoventia-additionalDescription"
          placeholder="Введіть додаткову інформацію (опціонально)"
        />

        <ImageUploadField
          currentImage={image.url}
          defaultImage="/assets/images/hippotherapy/default-center.jpg"
          recommendedSize={IMAGE_DIMENSIONS.CENTER_IPOVENTIA}
          onUpload={onImageUpload}
          onDelete={onImageDelete}
          label="Зображення"
          helperText="Рекомендований розмір: 1440×420 пікселів"
        />
      </Box>
    </Box>
  );
};
```

**index.ts**
```typescript
export { CenterOfIpoventiaSection } from './CenterOfIpoventiaSection';
export type { CenterOfIpoventiaSectionProps } from './CenterOfIpoventiaSection';
```

### Styling Approach

**CenterOfIpoventiaSection.module.scss**
```scss
.centerOfIpoventiaSection {
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

**CenterOfIpoventiaSection.test.tsx**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CenterOfIpoventiaSection } from './CenterOfIpoventiaSection';

describe('CenterOfIpoventiaSection', () => {
  const defaultProps = {
    heading: '',
    description: '',
    additionalDescription: '',
    image: { url: null, isDefault: true },
    onHeadingChange: jest.fn(),
    onDescriptionChange: jest.fn(),
    onAdditionalDescriptionChange: jest.fn(),
    onImageUpload: jest.fn(),
    onImageDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    expect(screen.getByText('В центрі іповенції')).toBeInTheDocument();
  });

  it('renders heading input field', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    expect(screen.getByLabelText(/Заголовок/i)).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    expect(screen.getByLabelText(/^Опис$/i)).toBeInTheDocument();
  });

  it('renders additional description input', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    expect(screen.getByLabelText(/Додатковий опис/i)).toBeInTheDocument();
  });

  it('renders image upload field', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    expect(screen.getByText(/Зображення/i)).toBeInTheDocument();
  });

  it('displays heading value', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} heading="Patient-Centered Care" />);
    expect(screen.getByDisplayValue('Patient-Centered Care')).toBeInTheDocument();
  });

  it('displays description value', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} description="Focus on individual needs" />);
    expect(screen.getByDisplayValue('Focus on individual needs')).toBeInTheDocument();
  });

  it('displays additional description value', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} additionalDescription="Learn more" />);
    expect(screen.getByDisplayValue('Learn more')).toBeInTheDocument();
  });

  it('calls onHeadingChange when heading input changes', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    const input = screen.getByLabelText(/Заголовок/i);
    fireEvent.change(input, { target: { value: 'New Heading' } });
    expect(defaultProps.onHeadingChange).toHaveBeenCalledWith('New Heading');
  });

  it('calls onDescriptionChange when description changes', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    const textarea = screen.getByLabelText(/^Опис$/i);
    fireEvent.change(textarea, { target: { value: 'New Description' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith('New Description');
  });

  it('calls onAdditionalDescriptionChange when additional description changes', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    const input = screen.getByLabelText(/Додатковий опис/i);
    fireEvent.change(input, { target: { value: 'Additional info' } });
    expect(defaultProps.onAdditionalDescriptionChange).toHaveBeenCalledWith('Additional info');
  });

  it('displays heading error message', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} headingError="Minimum 5 characters" />);
    expect(screen.getByText('Minimum 5 characters')).toBeInTheDocument();
  });

  it('displays description error message', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} descriptionError="Minimum 10 characters" />);
    expect(screen.getByText('Minimum 10 characters')).toBeInTheDocument();
  });

  it('displays additional description error message', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} additionalDescriptionError="Too short" />);
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('shows character limit for heading (50)', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    expect(screen.getByText(/0\/50/)).toBeInTheDocument();
  });

  it('shows character limit for description (300)', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    expect(screen.getByText(/0\/300/)).toBeInTheDocument();
  });

  it('shows character limit for additional description (50)', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    expect(screen.getByText(/0\/50/)).toBeInTheDocument();
  });

  it('marks heading and description as required', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    const headingLabel = screen.getByText(/Заголовок/);
    const descriptionLabel = screen.getByText(/^Опис$/);
    expect(headingLabel.parentElement).toHaveTextContent('*');
    expect(descriptionLabel.parentElement).toHaveTextContent('*');
  });

  it('marks additional description as optional', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    const additionalLabel = screen.getByText(/Додатковий опис/);
    expect(additionalLabel.parentElement).not.toHaveTextContent('*');
  });

  it('calls onImageUpload when image is uploaded', async () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    const file = new File(['image'], 'center.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(defaultProps.onImageUpload).toHaveBeenCalled();
    });
  });

  it('calls onImageDelete when image delete is triggered', () => {
    const propsWithImage = {
      ...defaultProps,
      image: { url: 'https://example.com/center.jpg', isDefault: false }
    };
    render(<CenterOfIpoventiaSection {...propsWithImage} />);
    
    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onImageDelete).toHaveBeenCalled();
  });

  it('displays default image when no custom image uploaded', () => {
    render(<CenterOfIpoventiaSection {...defaultProps} />);
    const img = screen.getByAltText(/default/i);
    expect(img).toHaveAttribute('src', '/assets/images/hippotherapy/default-center.jpg');
  });

  it('displays custom image when uploaded', () => {
    const propsWithImage = {
      ...defaultProps,
      image: { url: 'https://example.com/custom-center.jpg', isDefault: false }
    };
    render(<CenterOfIpoventiaSection {...propsWithImage} />);
    const img = screen.getByAltText(/center/i);
    expect(img).toHaveAttribute('src', 'https://example.com/custom-center.jpg');
  });
});
```

### Integration Tests
- Test full editing flow: enter all fields → upload image → validate → save
- Test optional field: leave additional description empty → validation passes
- Test required fields: leave heading empty → blur → error shows
- Test image upload: select file → validate 1440×420 dimensions → cropper → save
- Test character limits: type 301 characters in description → blocked at 300

## Dependencies
**Technical Dependencies**:
- TS01: Foundation types (ImageData, VALIDATION_RULES, IMAGE_DIMENSIONS)
- TS02: Validation utilities (space management)
- TS15: ImageUploadField component
- TS16: TextInputField component

**Business Context**: This is part of BS05 sprint goal for Center of Ipoventia content

## Estimated Effort
**5 hours**
- Component structure: 1.5h
- Props integration (3 text fields + image): 1.5h
- Styling: 1h
- Unit tests: 1h

## Technical Notes

### Patterns to Follow
- Follow same structure as TS10 (Testimonials) which also has optional additional description
- Use consistent styling with other section components
- Additional description is optional (no minimum length requirement)

### Architecture Decisions
- Component is fully controlled (no internal state)
- All validation logic handled by shared components
- Optional field validation: only check max length, no minimum or required
- Error messages passed as props from parent form validation

### State Management
- Component is fully controlled (no internal state)
- Parent manages heading, description, additionalDescription, and image state
- Parent handles validation and error state
- onChange handlers immediately propagate to parent

### Image Requirements
- Default image path: `/assets/images/hippotherapy/default-center.jpg`
- Recommended size: 1440×420 pixels (wider aspect ratio)
- Maximum file size: 5 MB
- Allowed formats: jpeg, jpg, png, webp
- Image cropper should maintain 1440:420 aspect ratio

### Validation Rules
From TS01 VALIDATION_RULES:
- Heading: min 5 chars, max 50 chars, required
- Description: min 10 chars, max 300 chars, required
- Additional description: max 50 chars, optional (no minimum)

### Optional Field Handling
- Additional description has no required validation
- If user enters text, only max length (50) is enforced
- If user enters <10 chars, no minimum length error
- Clean-up icon still appears when field is focused and non-empty

### Styling Conventions
- Match section styling from other components
- Maintain consistent spacing between fields (20px gap)
- Description and additional description both have multiline support
- Both textareas should auto-expand vertically

### Accessibility
- Use unique `name` attributes for each field
- Proper label associations with `htmlFor` and `id`
- Mark required fields with asterisk
- Announce validation errors to screen readers

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Component renders with all fields
- [ ] Heading input works with 50 char limit
- [ ] Description textarea works with 300 char limit
- [ ] Additional description input works with 50 char limit (optional)
- [ ] Image upload works with 1440×420 dimension validation
- [ ] All onChange handlers fire correctly
- [ ] Errors display correctly
- [ ] Character counters update in real-time
- [ ] Optional field validation works correctly
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] Styling matches Figma design
- [ ] Component exported correctly from index.ts
