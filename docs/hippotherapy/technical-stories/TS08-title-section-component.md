# TS08: Title Section Component

## Implements
**Business Story**: BS01 - Title Section Content Management

## Technical Goal
Build the Title section component with heading (50 chars), description (300 chars), and hero image (1440×660). First section on the page, sets the tone for the hippotherapy content.

## Acceptance Criteria
- [ ] Renders heading input with 50 character limit
- [ ] Renders description textarea with 300 character limit
- [ ] Renders image upload field with 1440×660 dimension validation
- [ ] Character counters update in real-time
- [ ] Validation triggers on blur for heading and description
- [ ] Clean-up icons appear on focus when fields are non-empty
- [ ] Image upload validates size (<5MB) and format (jpeg, jpg, png, webp)
- [ ] Image upload validates minimum dimensions (1440×660)
- [ ] Default image displays when no custom image uploaded
- [ ] Delete button appears on hover over uploaded image
- [ ] All errors display correctly

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/sections/title-section/TitleSection.tsx`
- `src/components/admin/hippotherapy/sections/title-section/TitleSection.module.scss`
- `src/components/admin/hippotherapy/sections/title-section/TitleSection.test.tsx`
- `src/components/admin/hippotherapy/sections/title-section/index.ts`

### Component Structure

**TitleSection.tsx**
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { ImageUploadField } from '../../shared/image-upload-field';
import { VALIDATION_RULES, IMAGE_DIMENSIONS } from '@/const/admin/hippotherapy';
import { ImageData } from '@/types/admin/hippotherapy.types';
import styles from './TitleSection.module.scss';

export interface TitleSectionProps {
  heading: string;
  description: string;
  image: ImageData;
  onHeadingChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageUpload: (file: File, croppedBase64: string) => void;
  onImageDelete: () => void;
  headingError?: string;
  descriptionError?: string;
}

export const TitleSection: React.FC<TitleSectionProps> = ({
  heading,
  description,
  image,
  onHeadingChange,
  onDescriptionChange,
  onImageUpload,
  onImageDelete,
  headingError,
  descriptionError
}) => {
  return (
    <Box className={styles.titleSection}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Головний розділ
      </Typography>

      <Box className={styles.fieldsContainer}>
        <TextInputField
          label="Заголовок"
          value={heading}
          onChange={onHeadingChange}
          maxChars={VALIDATION_RULES.HEADING.MAX_LENGTH}
          required
          error={headingError}
          name="title-heading"
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
          name="title-description"
          placeholder="Введіть опис розділу"
        />

        <ImageUploadField
          currentImage={image.url}
          defaultImage="/assets/images/hippotherapy/default-title.jpg"
          recommendedSize={IMAGE_DIMENSIONS.TITLE}
          onUpload={onImageUpload}
          onDelete={onImageDelete}
          label="Головне зображення"
          helperText="Рекомендований розмір: 1440×660 пікселів"
        />
      </Box>
    </Box>
  );
};
```

**index.ts**
```typescript
export { TitleSection } from './TitleSection';
export type { TitleSectionProps } from './TitleSection';
```

### Styling Approach

**TitleSection.module.scss**
```scss
.titleSection {
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

**TitleSection.test.tsx**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TitleSection } from './TitleSection';

describe('TitleSection', () => {
  const defaultProps = {
    heading: '',
    description: '',
    image: { url: null, isDefault: true },
    onHeadingChange: jest.fn(),
    onDescriptionChange: jest.fn(),
    onImageUpload: jest.fn(),
    onImageDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title', () => {
    render(<TitleSection {...defaultProps} />);
    expect(screen.getByText('Головний розділ')).toBeInTheDocument();
  });

  it('renders heading input field', () => {
    render(<TitleSection {...defaultProps} />);
    expect(screen.getByLabelText(/Заголовок/i)).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    render(<TitleSection {...defaultProps} />);
    expect(screen.getByLabelText(/Опис/i)).toBeInTheDocument();
  });

  it('renders image upload field', () => {
    render(<TitleSection {...defaultProps} />);
    expect(screen.getByText(/Головне зображення/i)).toBeInTheDocument();
  });

  it('displays heading value', () => {
    render(<TitleSection {...defaultProps} heading="Test Heading" />);
    expect(screen.getByDisplayValue('Test Heading')).toBeInTheDocument();
  });

  it('displays description value', () => {
    render(<TitleSection {...defaultProps} description="Test Description" />);
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('calls onHeadingChange when heading input changes', () => {
    render(<TitleSection {...defaultProps} />);
    const input = screen.getByLabelText(/Заголовок/i);
    fireEvent.change(input, { target: { value: 'New Heading' } });
    expect(defaultProps.onHeadingChange).toHaveBeenCalledWith('New Heading');
  });

  it('calls onDescriptionChange when description input changes', () => {
    render(<TitleSection {...defaultProps} />);
    const textarea = screen.getByLabelText(/Опис/i);
    fireEvent.change(textarea, { target: { value: 'New Description' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith('New Description');
  });

  it('displays heading error message', () => {
    render(<TitleSection {...defaultProps} headingError="Heading is required" />);
    expect(screen.getByText('Heading is required')).toBeInTheDocument();
  });

  it('displays description error message', () => {
    render(<TitleSection {...defaultProps} descriptionError="Description too short" />);
    expect(screen.getByText('Description too short')).toBeInTheDocument();
  });

  it('shows character limit for heading (50)', () => {
    render(<TitleSection {...defaultProps} />);
    expect(screen.getByText(/0\/50/)).toBeInTheDocument();
  });

  it('shows character limit for description (300)', () => {
    render(<TitleSection {...defaultProps} />);
    expect(screen.getByText(/0\/300/)).toBeInTheDocument();
  });

  it('updates character counter as heading is typed', () => {
    render(<TitleSection {...defaultProps} heading="Test" />);
    expect(screen.getByText(/4\/50/)).toBeInTheDocument();
  });

  it('calls onImageUpload when image is uploaded', async () => {
    render(<TitleSection {...defaultProps} />);
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(defaultProps.onImageUpload).toHaveBeenCalled();
    });
  });

  it('calls onImageDelete when image delete is triggered', () => {
    const propsWithImage = {
      ...defaultProps,
      image: { url: 'https://example.com/image.jpg', isDefault: false }
    };
    render(<TitleSection {...propsWithImage} />);
    
    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onImageDelete).toHaveBeenCalled();
  });

  it('displays default image when no custom image uploaded', () => {
    render(<TitleSection {...defaultProps} />);
    const img = screen.getByAltText(/default/i);
    expect(img).toHaveAttribute('src', '/assets/images/hippotherapy/default-title.jpg');
  });

  it('displays custom image when uploaded', () => {
    const propsWithImage = {
      ...defaultProps,
      image: { url: 'https://example.com/custom.jpg', isDefault: false }
    };
    render(<TitleSection {...propsWithImage} />);
    const img = screen.getByAltText(/hero/i);
    expect(img).toHaveAttribute('src', 'https://example.com/custom.jpg');
  });
});
```

### Integration Tests
- Test form integration: heading change → validation → error display → fix → error clears
- Test character limit enforcement: type 51 characters → blocked at 50
- Test image upload flow: select file → validation → cropper opens → crop → upload success
- Test image delete flow: hover over image → delete button appears → click → confirmation → delete
- Test space management: type leading space → trimmed, type double space → single space

## Dependencies
**Technical Dependencies**:
- TS01: Foundation types (ImageData, VALIDATION_RULES, IMAGE_DIMENSIONS)
- TS02: Validation utilities (space management)
- TS15: ImageUploadField component
- TS16: TextInputField component

**Business Context**: This is part of BS01 sprint goal for title section management

## Estimated Effort
**4 hours**
- Component structure: 1h
- Props integration: 1h
- Styling: 1h
- Unit tests: 1h

## Technical Notes

### Patterns to Follow
- Look at existing section components in `src/components/admin/programs/` for styling consistency
- Use controlled component pattern (all state lifted to parent)
- Follow Material-UI spacing conventions (8px grid)

### Architecture Decisions
- Keep component purely presentational (no business logic)
- All validation logic handled by parent or shared components
- Image processing delegated to ImageUploadField component
- Error messages passed as props from parent form validation

### State Management
- Component is fully controlled (no internal state)
- Parent manages heading, description, and image state
- Parent handles validation and error state
- onChange handlers immediately propagate to parent

### Styling Conventions
- Use SCSS modules for scoped styles
- Follow BEM-like naming: `.titleSection`, `.sectionTitle`, `.fieldsContainer`
- Match existing admin panel card styling (white background, border, border-radius)
- Use project color variables from `src/assets/sass/variables/`

### Image Requirements
- Default image path: `/assets/images/hippotherapy/default-title.jpg`
- Recommended size: 1440×660 pixels
- Maximum file size: 5 MB
- Allowed formats: jpeg, jpg, png, webp
- Image cropper should maintain 1440:660 aspect ratio

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Component renders with all fields
- [ ] Heading input works with 50 char limit
- [ ] Description textarea works with 300 char limit
- [ ] Image upload works with dimension validation
- [ ] All onChange handlers fire correctly
- [ ] Errors display correctly
- [ ] Character counters update in real-time
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] Styling matches Figma design
- [ ] Component exported correctly from index.ts
