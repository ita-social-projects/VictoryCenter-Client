# TS13: Why This Approach Section Component

## Implements
**Business Story**: BS06 - Why This Approach Section Management

## Technical Goal
Build the Why This Approach section component with heading (50 chars) and 4 cards. Each card has an image (360×430) and description (300 chars). This section highlights key benefits of the therapeutic approach.

## Acceptance Criteria
- [ ] Renders heading input with 50 character limit
- [ ] Renders 4 card entries in grid layout
- [ ] Each card has image upload field (360×430) and description (300 chars)
- [ ] Character counters update in real-time for all fields
- [ ] Validation triggers on blur for all fields
- [ ] Clean-up icons appear on focus when description fields are non-empty
- [ ] Image uploads validate size (<5MB) and format
- [ ] Image uploads validate minimum dimensions (360×430)
- [ ] Each card has default image when no custom image uploaded
- [ ] Delete buttons appear on hover over uploaded images
- [ ] All errors display correctly per card
- [ ] Cards are visually numbered (Card 1, Card 2, Card 3, Card 4)

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/sections/why-this-approach-section/WhyThisApproachSection.tsx`
- `src/components/admin/hippotherapy/sections/why-this-approach-section/WhyThisApproachSection.module.scss`
- `src/components/admin/hippotherapy/sections/why-this-approach-section/ApproachCard.tsx`
- `src/components/admin/hippotherapy/sections/why-this-approach-section/ApproachCard.module.scss`
- `src/components/admin/hippotherapy/sections/why-this-approach-section/WhyThisApproachSection.test.tsx`
- `src/components/admin/hippotherapy/sections/why-this-approach-section/index.ts`

### Component Structure

**WhyThisApproachSection.tsx**
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { ApproachCard } from './ApproachCard';
import { VALIDATION_RULES } from '@/const/admin/hippotherapy';
import { HippotherapyCard } from '@/types/admin/hippotherapy.types';
import styles from './WhyThisApproachSection.module.scss';

export interface WhyThisApproachSectionProps {
  heading: string;
  cards: HippotherapyCard[];
  onHeadingChange: (value: string) => void;
  onCardChange: (cardId: string, field: 'description', value: string) => void;
  onCardImageUpload: (cardId: string, file: File, croppedBase64: string) => void;
  onCardImageDelete: (cardId: string) => void;
  headingError?: string;
  cardErrors: Record<string, { description?: string }>;
}

export const WhyThisApproachSection: React.FC<WhyThisApproachSectionProps> = ({
  heading,
  cards,
  onHeadingChange,
  onCardChange,
  onCardImageUpload,
  onCardImageDelete,
  headingError,
  cardErrors
}) => {
  return (
    <Box className={styles.whyThisApproachSection}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Чому цей підхід
      </Typography>

      <Box className={styles.fieldsContainer}>
        <TextInputField
          label="Заголовок"
          value={heading}
          onChange={onHeadingChange}
          maxChars={VALIDATION_RULES.HEADING.MAX_LENGTH}
          required
          error={headingError}
          name="whyThisApproach-heading"
          placeholder="Введіть заголовок розділу"
        />

        <Box className={styles.cardsGrid}>
          {cards.map((card, index) => (
            <ApproachCard
              key={card.id}
              cardNumber={index + 1}
              card={card}
              onDescriptionChange={(value) => onCardChange(card.id, 'description', value)}
              onImageUpload={(file, croppedBase64) => onCardImageUpload(card.id, file, croppedBase64)}
              onImageDelete={() => onCardImageDelete(card.id)}
              descriptionError={cardErrors[card.id]?.description}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
```

**ApproachCard.tsx**
```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';
import { TextInputField } from '../../shared/text-input-field';
import { ImageUploadField } from '../../shared/image-upload-field';
import { VALIDATION_RULES, IMAGE_DIMENSIONS } from '@/const/admin/hippotherapy';
import { HippotherapyCard } from '@/types/admin/hippotherapy.types';
import styles from './ApproachCard.module.scss';

export interface ApproachCardProps {
  cardNumber: number;
  card: HippotherapyCard;
  onDescriptionChange: (value: string) => void;
  onImageUpload: (file: File, croppedBase64: string) => void;
  onImageDelete: () => void;
  descriptionError?: string;
}

export const ApproachCard: React.FC<ApproachCardProps> = ({
  cardNumber,
  card,
  onDescriptionChange,
  onImageUpload,
  onImageDelete,
  descriptionError
}) => {
  return (
    <Box className={styles.approachCard}>
      <Typography variant="subtitle2" className={styles.cardTitle}>
        Картка {cardNumber}
      </Typography>

      <ImageUploadField
        currentImage={card.image.url}
        defaultImage="/assets/images/hippotherapy/default-card.jpg"
        recommendedSize={IMAGE_DIMENSIONS.CARD}
        onUpload={onImageUpload}
        onDelete={onImageDelete}
        label={`Зображення картки ${cardNumber}`}
        helperText="Рекомендований розмір: 360×430 пікселів"
      />

      <TextInputField
        label="Опис"
        value={card.description}
        onChange={onDescriptionChange}
        maxChars={VALIDATION_RULES.DESCRIPTION_SHORT.MAX_LENGTH}
        multiline
        required
        error={descriptionError}
        name={`whyThisApproach-card${cardNumber}-description`}
        placeholder="Опишіть переваги цього підходу"
      />
    </Box>
  );
};
```

**index.ts**
```typescript
export { WhyThisApproachSection } from './WhyThisApproachSection';
export type { WhyThisApproachSectionProps } from './WhyThisApproachSection';
```

### Styling Approach

**WhyThisApproachSection.module.scss**
```scss
.whyThisApproachSection {
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

.cardsGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
```

**ApproachCard.module.scss**
```scss
.approachCard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.cardTitle {
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #333333;
  margin: 0;
}
```

## Test Cases

### Unit Tests

**WhyThisApproachSection.test.tsx**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { WhyThisApproachSection } from './WhyThisApproachSection';
import { HippotherapyCard } from '@/types/admin/hippotherapy.types';

describe('WhyThisApproachSection', () => {
  const mockCards: HippotherapyCard[] = [
    { id: '1', image: { url: null, isDefault: true }, description: '' },
    { id: '2', image: { url: null, isDefault: true }, description: '' },
    { id: '3', image: { url: null, isDefault: true }, description: '' },
    { id: '4', image: { url: null, isDefault: true }, description: '' },
  ];

  const defaultProps = {
    heading: '',
    cards: mockCards,
    onHeadingChange: jest.fn(),
    onCardChange: jest.fn(),
    onCardImageUpload: jest.fn(),
    onCardImageDelete: jest.fn(),
    cardErrors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title', () => {
    render(<WhyThisApproachSection {...defaultProps} />);
    expect(screen.getByText('Чому цей підхід')).toBeInTheDocument();
  });

  it('renders heading input field', () => {
    render(<WhyThisApproachSection {...defaultProps} />);
    expect(screen.getByLabelText(/Заголовок/i)).toBeInTheDocument();
  });

  it('renders exactly 4 cards', () => {
    render(<WhyThisApproachSection {...defaultProps} />);
    expect(screen.getByText('Картка 1')).toBeInTheDocument();
    expect(screen.getByText('Картка 2')).toBeInTheDocument();
    expect(screen.getByText('Картка 3')).toBeInTheDocument();
    expect(screen.getByText('Картка 4')).toBeInTheDocument();
  });

  it('calls onHeadingChange when heading input changes', () => {
    render(<WhyThisApproachSection {...defaultProps} />);
    const input = screen.getByLabelText(/Заголовок/i);
    fireEvent.change(input, { target: { value: 'Why Choose Us' } });
    expect(defaultProps.onHeadingChange).toHaveBeenCalledWith('Why Choose Us');
  });

  it('calls onCardChange when card description changes', () => {
    render(<WhyThisApproachSection {...defaultProps} />);
    const descriptionInputs = screen.getAllByLabelText(/Опис/i);
    fireEvent.change(descriptionInputs[0], { target: { value: 'Benefit 1' } });
    expect(defaultProps.onCardChange).toHaveBeenCalledWith('1', 'description', 'Benefit 1');
  });

  it('displays heading error message', () => {
    render(<WhyThisApproachSection {...defaultProps} headingError="Minimum 5 characters" />);
    expect(screen.getByText('Minimum 5 characters')).toBeInTheDocument();
  });

  it('displays card description error', () => {
    const cardErrors = { '1': { description: 'Description too short' } };
    render(<WhyThisApproachSection {...defaultProps} cardErrors={cardErrors} />);
    expect(screen.getByText('Description too short')).toBeInTheDocument();
  });

  it('shows character limit for heading (50)', () => {
    render(<WhyThisApproachSection {...defaultProps} />);
    expect(screen.getByText(/0\/50/)).toBeInTheDocument();
  });

  it('shows character limit for each card description (300)', () => {
    render(<WhyThisApproachSection {...defaultProps} />);
    const counterMatches = screen.getAllByText(/0\/300/);
    expect(counterMatches).toHaveLength(4); // 4 cards
  });

  it('renders cards in 2x2 grid', () => {
    render(<WhyThisApproachSection {...defaultProps} />);
    const cardsGrid = screen.getByText('Картка 1').closest('.cardsGrid');
    expect(cardsGrid).toHaveStyle({ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' });
  });
});

describe('ApproachCard', () => {
  const mockCard: HippotherapyCard = {
    id: '1',
    image: { url: null, isDefault: true },
    description: ''
  };

  const defaultProps = {
    cardNumber: 1,
    card: mockCard,
    onDescriptionChange: jest.fn(),
    onImageUpload: jest.fn(),
    onImageDelete: jest.fn(),
  };

  it('renders card title with number', () => {
    render(<ApproachCard {...defaultProps} />);
    expect(screen.getByText('Картка 1')).toBeInTheDocument();
  });

  it('renders image upload field', () => {
    render(<ApproachCard {...defaultProps} />);
    expect(screen.getByText(/Зображення картки 1/i)).toBeInTheDocument();
  });

  it('renders description input', () => {
    render(<ApproachCard {...defaultProps} />);
    expect(screen.getByLabelText(/Опис/i)).toBeInTheDocument();
  });

  it('calls onDescriptionChange when description changes', () => {
    render(<ApproachCard {...defaultProps} />);
    const input = screen.getByLabelText(/Опис/i);
    fireEvent.change(input, { target: { value: 'New description' } });
    expect(defaultProps.onDescriptionChange).toHaveBeenCalledWith('New description');
  });
});
```

### Integration Tests
- Test full card editing: upload image to card 1 → enter description → validate → repeat for all 4 cards
- Test independent card states: edit card 1 → error on card 1 → cards 2-4 remain valid
- Test character limits: type 301 characters in card description → blocked at 300
- Test image validation: upload 350×430 image (too small width) → error shows
- Test grid layout: resize viewport → cards reflow to single column on mobile

## Dependencies
**Technical Dependencies**:
- TS01: Foundation types (HippotherapyCard, IMAGE_DIMENSIONS)
- TS02: Validation utilities (space management)
- TS15: ImageUploadField component
- TS16: TextInputField component

**Business Context**: This is part of BS06 sprint goal for benefits showcase

## Estimated Effort
**6 hours**
- Component structure (parent + card subcomponent): 2h
- Props integration for 4 cards: 1.5h
- Grid layout and styling: 1.5h
- Unit tests: 1h

## Technical Notes

### Patterns to Follow
- Split into parent section + reusable card subcomponent
- Use grid layout (2x2 on desktop, 1 column on mobile)
- Follow card styling pattern from existing components

### Architecture Decisions
- Separate ApproachCard component for better reusability and testing
- Parent manages all 4 cards in array
- Card IDs used for state management and error tracking
- Grid layout responsive (2 columns → 1 column on mobile)

### State Management
- Parent component manages array of 4 cards
- Each card has unique ID for tracking changes
- Errors tracked per card ID in cardErrors object
- onChange handlers propagate card ID + field name + value

### Card Structure
From TS01 HippotherapyCard:
```typescript
interface HippotherapyCard {
  id: string;
  image: ImageData;
  description: string;
}
```

### Image Requirements
- Default image path: `/assets/images/hippotherapy/default-card.jpg`
- Recommended size: 360×430 pixels (portrait aspect ratio)
- Maximum file size: 5 MB
- Allowed formats: jpeg, jpg, png, webp
- Image cropper should maintain 360:430 aspect ratio

### Validation Rules
- Heading: min 5 chars, max 50 chars, required
- Card description: min 10 chars, max 300 chars, required (all 4 cards)

### Grid Layout
- Desktop: 2 columns, equal width
- Tablet (≤768px): 1 column
- Gap between cards: 20px
- Cards have light background (#f9f9f9) to distinguish from section background

### Styling Conventions
- Section follows standard section card styling
- Each card has nested card styling (light gray background)
- Card numbers help admin track which card they're editing
- Maintain consistent spacing within cards

### Accessibility
- Use sequential card numbering for clarity
- Unique field names per card (e.g., `whyThisApproach-card1-description`)
- All images have descriptive alt text
- Keyboard navigation works across all cards

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Component renders with heading and 4 cards
- [ ] Heading input works with 50 char limit
- [ ] All 4 card descriptions work with 300 char limit
- [ ] All 4 card image uploads work with 360×430 validation
- [ ] Grid layout is responsive
- [ ] All onChange handlers fire correctly with card IDs
- [ ] Errors display correctly per card
- [ ] Character counters update in real-time
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] Styling matches Figma design
- [ ] Component exported correctly from index.ts
