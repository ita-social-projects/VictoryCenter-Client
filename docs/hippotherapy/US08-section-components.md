# US08: Section Components (11 Sections)

## User Story
**As a** content admin  
**I want** to edit all 11 content sections of the Hippotherapy page  
**So that** I can manage the complete page content with proper validation

## Acceptance Criteria
- [ ] All 11 sections render in correct order
- [ ] Each section uses appropriate field components (TextInputField, ImageUploadField)
- [ ] All character limits are enforced per specification
- [ ] Validation works for all fields
- [ ] Card-based sections (Why This Approach, Who Programs Suit) handle 4 cards
- [ ] Principles section handles 5 description fields
- [ ] All sections follow consistent styling
- [ ] Sections integrate with form state management

## Sections to Implement

### 1. Title Section
- **Fields**: Heading (50), Description (300), Image (1440×660)
- **File**: `src/components/admin/hippotherapy/sections/title-section/TitleSection.tsx`

### 2. What Is Hippotherapy Section
- **Fields**: Heading (50), Description (1000, rich text)
- **File**: `src/components/admin/hippotherapy/sections/what-is-hippotherapy-section/`

### 3. Testimonials Section (×2 instances)
- **Fields**: Description (100), Additional Description (50), Image (1400×800)
- **File**: `src/components/admin/hippotherapy/sections/testimonials-section/`

### 4. What Is Ipoventia Section
- **Fields**: Heading (50), Description (1000)
- **File**: `src/components/admin/hippotherapy/sections/what-is-ipoventia-section/`

### 5. Center Of Ipoventia Section
- **Fields**: Heading (50), Description (300), Additional Description (50), Image (1440×420)
- **File**: `src/components/admin/hippotherapy/sections/center-of-ipoventia-section/`

### 6. Why This Approach Section
- **Fields**: Heading (50), 4× Card (Image 360×430 + Description 300)
- **File**: `src/components/admin/hippotherapy/sections/why-this-approach-section/`

### 7. What The Approach Shows Section
- **Fields**: Heading (50), Description (1000)
- **File**: `src/components/admin/hippotherapy/sections/what-the-approach-shows-section/`

### 8. Scientific Research Section
- **Fields**: Heading (50), Description (300), Dynamic References List
- **File**: Already created in US07

### 9. Who Programs Suit Section
- **Fields**: Heading (50), 4× Card (Image 360×430 + Description 300)
- **File**: `src/components/admin/hippotherapy/sections/who-programs-suit-section/`

### 10. Principles Section
- **Fields**: Heading (50), 5× Description (300), Image (1440×800)
- **File**: `src/components/admin/hippotherapy/sections/principles-section/`

## Technical Details

### Example: TitleSection.tsx
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { ImageUploadField } from '../../shared/image-upload-field';
import { IMAGE_DIMENSIONS } from '@/const/admin/hippotherapy/validation-rules';
import styles from './TitleSection.module.scss';

export interface TitleSectionProps {
  heading: string;
  description: string;
  image: { url: string | null; isDefault: boolean };
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

      <TextInputField
        label="Заголовок"
        value={heading}
        onChange={onHeadingChange}
        maxChars={50}
        required
        error={headingError}
        name="title-heading"
      />

      <TextInputField
        label="Опис"
        value={description}
        onChange={onDescriptionChange}
        maxChars={300}
        multiline
        required
        error={descriptionError}
        name="title-description"
      />

      <ImageUploadField
        currentImage={image.url}
        defaultImage="/assets/images/default-title.jpg"
        recommendedSize={IMAGE_DIMENSIONS.TITLE_HERO}
        onUpload={onImageUpload}
        onDelete={onImageDelete}
        label="Головне зображення"
      />
    </Box>
  );
};
```

### Example: Card-Based Section (WhyThisApproachSection.tsx)
```typescript
export const WhyThisApproachSection: React.FC<Props> = ({
  heading,
  cards,
  onHeadingChange,
  onCardChange,
  errors
}) => {
  return (
    <Box className={styles.section}>
      <Typography variant="h6">Чому цей підхід</Typography>

      <TextInputField
        label="Заголовок"
        value={heading}
        onChange={onHeadingChange}
        maxChars={50}
        required
        error={errors.heading}
        name="whyThisApproach-heading"
      />

      <Box className={styles.cardsGrid}>
        {cards.map((card, index) => (
          <Box key={card.id} className={styles.card}>
            <Typography variant="subtitle2">Картка {index + 1}</Typography>
            
            <ImageUploadField
              currentImage={card.image.url}
              defaultImage="/assets/images/default-card.jpg"
              recommendedSize={IMAGE_DIMENSIONS.CARD}
              onUpload={(file, cropped) => onCardChange(card.id, 'image', cropped)}
              onDelete={() => onCardChange(card.id, 'imageDelete', null)}
              label={`Зображення картки ${index + 1}`}
            />

            <TextInputField
              label="Опис"
              value={card.description}
              onChange={(value) => onCardChange(card.id, 'description', value)}
              maxChars={300}
              multiline
              required
              error={errors[`card${index}`]}
              name={`whyThisApproach-card${index}-description`}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
```

## Files to Create

For each section (10 sections, excluding Scientific Research):
- `[SectionName].tsx` - Component implementation
- `[SectionName].module.scss` - Styles
- `[SectionName].test.tsx` - Tests
- `index.ts` - Exports

**Total**: 40 files (10 sections × 4 files)

## Dependencies
- US04 (TextInputField)
- US05 (ImageUploadField)
- US07 (ScientificReferencesSection)

## Estimated Effort
**25 hours** (2-3 hours per section, simpler sections take less time)

## Parallelization Strategy
Once shared components (US04-US06) are complete, sections can be built in parallel:
- **Developer 1**: Title, WhatIsHippotherapy, WhatIsIpoventia, WhatTheApproachShows
- **Developer 2**: Testimonials, CenterOfIpoventia, Principles
- **Developer 3**: WhyThisApproach, WhoProgramsSuit

## Testing Requirements
For each section:
- Renders with correct props
- Calls onChange handlers correctly
- Displays validation errors
- Character counters work
- Image upload/delete works
- Mock form context properly

## Definition of Done
- All 11 sections implemented and rendering
- Each section follows specification exactly
- All character limits enforced
- Validation works for all fields
- Consistent styling across sections
- All tests passing (>85% coverage per section)
- Code review completed
- No ESLint warnings
