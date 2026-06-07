# TS10: Testimonials Section Component

## Implements
**Business Story**: BS03 - Testimonials Section Management

## Technical Goal
Build the Testimonials section component with description (100 chars), additional description (50 chars, optional), and image (1400×800). Component is reused twice on the page (testimonials1 and testimonials2).

## Acceptance Criteria
- [ ] Renders description input with 100 character limit
- [ ] Renders additional description input with 50 character limit (optional)
- [ ] Renders image upload field with 1400×800 dimension validation
- [ ] Character counters update in real-time
- [ ] Validation triggers on blur for description fields
- [ ] Additional description field is optional (no required validation)
- [ ] Clean-up icons appear on focus when fields are non-empty
- [ ] Image upload validates size (<5MB) and format (jpeg, jpg, png, webp)
- [ ] Image upload validates minimum dimensions (1400×800)
- [ ] Default testimonial image displays when no custom image uploaded
- [ ] Delete button appears on hover over uploaded image
- [ ] All errors display correctly

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/sections/testimonials-section/TestimonialsSection.tsx`
- `src/components/admin/hippotherapy/sections/testimonials-section/TestimonialsSection.module.scss`
- `src/components/admin/hippotherapy/sections/testimonials-section/TestimonialsSection.test.tsx`
- `src/components/admin/hippotherapy/sections/testimonials-section/index.ts`

### Component Structure

**TestimonialsSection.tsx**
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { ImageUploadField } from '../../shared/image-upload-field';
import { VALIDATION_RULES, IMAGE_DIMENSIONS } from '@/const/admin/hippotherapy';
import { ImageData } from '@/types/admin/hippotherapy.types';
import styles from './TestimonialsSection.module.scss';

export interface TestimonialsSectionProps {
  sectionNumber: 1 | 2; // For distinguishing between two instances
  description: string;
  additionalDescription: string;
  image: ImageData;
  onDescriptionChange: (value: string) => void;
  onAdditionalDescriptionChange: (value: string) => void;
  onImageUpload: (file: File, croppedBase64: string) => void;
  onImageDelete: () => void;
  descriptionError?: string;
  additionalDescriptionError?: string;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  sectionNumber,
  description,
  additionalDescription,
  image,
  onDescriptionChange,
  onAdditionalDescriptionChange,
  onImageUpload,
  onImageDelete,
  descriptionError,
  additionalDescriptionError
}) => {
  const sectionTitle = `Відгуки ${sectionNumber === 1 ? '1' : '2'}`;

  return (
    <Box className={styles.testimonialsSection}>
      <Typography variant="h6" className={styles.sectionTitle}>
        {sectionTitle}
      </Typography>

      <Box className={styles.fieldsContainer}>
        <TextInputField
          label="Опис"
          value={description}
          onChange={onDescriptionChange}
          maxChars={VALIDATION_RULES.DESCRIPTION_MEDIUM.MAX_LENGTH}
          multiline
          required
          error={descriptionError}
          name={`testimonials${sectionNumber}-description`}
          placeholder="Введіть відгук або цитату"
        />

        <TextInputField
          label="Додатковий опис"
          value={additionalDescription}
          onChange={onAdditionalDescriptionChange}
          maxChars={VALIDATION_RULES.ADDITIONAL_DESCRIPTION.MAX_LENGTH}
          multiline
          required={false}
          error={additionalDescriptionError}
          name={`testimonials${sectionNumber}-additionalDescription`}
          placeholder="Введіть додаткову інформацію (опціонально)"
        />

        <ImageUploadField
          currentImage={image.url}
          defaultImage="/assets/images/hippotherapy/default-testimonial.jpg"
          recommendedSize={IMAGE_DIMENSIONS.TESTIMONIALS}
          onUpload={onImageUpload}
          onDelete={onImageDelete}
          label="Зображення"
          helperText="Рекомендований розмір: 1400×800 пікселів"
        />
      </Box>
    </Box>
  );
};
```

**index.ts**
```typescript
export { TestimonialsSection } from './TestimonialsSection';
export type { TestimonialsSectionProps } from './TestimonialsSection';
```

### Styling Approach

**TestimonialsSection.module.scss**
```scss
.testimonialsSection {
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

**TestimonialsSection.test.tsx**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestimonialsSection } from './TestimonialsSection';

describe('TestimonialsSection', () => {
  const defaultProps = {
    sectionNumber: 1 as const,
    description: '',
    additionalDescription: '',
    image: { url: null, isDefault: true },
    onDescriptionChange: jest.fn(),
    onAdditionalDescriptionChange: jest.fn(),
    onImageUpload: jest.fn(),
    onImageDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title for testimonials 1', () => {
    render(<TestimonialsSection {...defaultProps} />);
    expect(screen.getByText('Відгуки 1')).toBeInTheDocument();
  });

  it('renders section title for testimonials 2', () => {
    render(<TestimonialsSection {...defaultProps} sectionNumber={2} />);
    expect(screen.getByText('Відгуки 2')).toBeInTheDocument();
  });

  it('renders description input field', () => {
    render(<TestimonialsSection {...defaultProps} />);
    expect(screen.getByLabelText(/Опис/i)).toBeInTheDocument();
  });

  it('renders additional description input field', () => {
    render(<TestimonialsSection {...defaultProps} />);
    expect(screen.getByLabelText(/Додатковий опис/i)).toBeInTheDocument();
  });

  it('renders image upload field', () => {
    render(<TestimonialsSection {...defaultProps} />);
    expect(screen.getByText(/Зображення/i)).toBeInTheDocument();
  });

  it('displays description value', () => {
    render(<TestimonialsSection {...defaultProps} description="Great experience!" />);
    expect(screen.getByDisplayValue('Great experience!')).toBeInTheDocument();
  });

  it('displays additional description value', () => {
    render(<TestimonialsSection {...defaultProps} additionalDescription="John Doe" />);
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('calls onDescriptionChange when description input changes', () => {
    render(<TestimonialsSection {...defaultProps} />);
    const input = screen.getByLabelText(/Опис/i);
    fireEvent.change(input, { target: { value: 'New testimonial' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith('New testimonial');
  });

  it('calls onAdditionalDescriptionChange when additional description changes', () => {
    render(<TestimonialsSection {...defaultProps} />);
    const input = screen.getByLabelText(/Додатковий опис/i);
    fireEvent.change(input, { target: { value: 'Additional info' } });
    expect(defaultProps.onAdditionalDescriptionChange).toHaveBeenCalledWith('Additional info');
  });

  it('displays description error message', () => {
    render(<TestimonialsSection {...defaultProps} descriptionError="Description is required" />);
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });

  it('displays additional description error message', () => {
    render(<TestimonialsSection {...defaultProps} additionalDescriptionError="Too short" />);
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('shows character limit for description (100)', () => {
    render(<TestimonialsSection {...defaultProps} />);
    expect(screen.getByText(/0\/100/)).toBeInTheDocument();
  });

  it('shows character limit for additional description (50)', () => {
    render(<TestimonialsSection {...defaultProps} />);
    expect(screen.getByText(/0\/50/)).toBeInTheDocument();
  });

  it('updates character counter as description is typed', () => {
    render(<TestimonialsSection {...defaultProps} description="Great!" />);
    expect(screen.getByText(/6\/100/)).toBeInTheDocument();
  });

  it('marks description as required', () => {
    render(<TestimonialsSection {...defaultProps} />);
    const descriptionLabel = screen.getByText(/Опис/);
    expect(descriptionLabel.parentElement).toHaveTextContent('*'); // Required asterisk
  });

  it('marks additional description as optional', () => {
    render(<TestimonialsSection {...defaultProps} />);
    const additionalLabel = screen.getByText(/Додатковий опис/);
    expect(additionalLabel.parentElement).not.toHaveTextContent('*');
  });

  it('calls onImageUpload when image is uploaded', async () => {
    render(<TestimonialsSection {...defaultProps} />);
    const file = new File(['image'], 'testimonial.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(defaultProps.onImageUpload).toHaveBeenCalled();
    });
  });

  it('calls onImageDelete when image delete is triggered', () => {
    const propsWithImage = {
      ...defaultProps,
      image: { url: 'https://example.com/testimonial.jpg', isDefault: false }
    };
    render(<TestimonialsSection {...propsWithImage} />);
    
    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onImageDelete).toHaveBeenCalled();
  });

  it('displays default image when no custom image uploaded', () => {
    render(<TestimonialsSection {...defaultProps} />);
    const img = screen.getByAltText(/default/i);
    expect(img).toHaveAttribute('src', '/assets/images/hippotherapy/default-testimonial.jpg');
  });

  it('displays custom image when uploaded', () => {
    const propsWithImage = {
      ...defaultProps,
      image: { url: 'https://example.com/custom-testimonial.jpg', isDefault: false }
    };
    render(<TestimonialsSection {...propsWithImage} />);
    const img = screen.getByAltText(/testimonial/i);
    expect(img).toHaveAttribute('src', 'https://example.com/custom-testimonial.jpg');
  });
});
```

### Integration Tests
- Test full editing flow: enter description → enter additional description → upload image → validate
- Test optional field: leave additional description empty → validation passes
- Test character limits: type 101 characters in description → blocked at 100
- Test image upload: select file → validate dimensions → cropper → save
- Test two instances: render testimonials1 and testimonials2 simultaneously → both work independently

## Dependencies
**Technical Dependencies**:
- TS01: Foundation types (ImageData, VALIDATION_RULES, IMAGE_DIMENSIONS)
- TS02: Validation utilities (space management)
- TS15: ImageUploadField component
- TS16: TextInputField component

**Business Context**: This is part of BS03 sprint goal for testimonial content management

## Estimated Effort
**4 hours**
- Component structure: 1h
- Props integration (including sectionNumber): 1h
- Styling: 1h
- Unit tests: 1h

## Technical Notes

### Patterns to Follow
- Component is reusable: parent passes `sectionNumber` to distinguish instances
- Follow same styling pattern as TS08 (title section)
- Additional description field is truly optional (no minimum length validation, only max length)

### Architecture Decisions
- Single component used twice on the page (testimonials1 and testimonials2)
- `sectionNumber` prop differentiates instances for field names and labels
- All state lifted to parent (fully controlled component)
- Optional field validation: only check max length, no minimum or required validation

### State Management
- Component is fully controlled (no internal state)
- Parent manages description, additionalDescription, and image state
- Parent handles validation and error state
- onChange handlers immediately propagate to parent

### Image Requirements
- Default image path: `/assets/images/hippotherapy/default-testimonial.jpg`
- Recommended size: 1400×800 pixels
- Maximum file size: 5 MB
- Allowed formats: jpeg, jpg, png, webp
- Image cropper should maintain 1400:800 aspect ratio

### Optional Field Handling
- Additional description has no required validation
- If user enters text, only max length (50) is enforced
- If user enters <10 chars, no minimum length error (unlike other fields)
- Clean-up icon still appears when field is focused and non-empty

### Accessibility
- Use unique `name` attributes for each instance (e.g., `testimonials1-description`, `testimonials2-description`)
- Ensure labels properly associated with inputs
- Mark required fields with asterisk
- Announce validation errors to screen readers

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Component renders with all fields
- [ ] Description input works with 100 char limit
- [ ] Additional description input works with 50 char limit (optional)
- [ ] Image upload works with dimension validation
- [ ] `sectionNumber` prop correctly differentiates instances
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
- [ ] Two instances can coexist on the same page
