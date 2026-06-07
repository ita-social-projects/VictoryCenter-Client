# TS03: Yup Validation Schema

## Implements
**Business Stories**: 
- BS01 - Title Section Content Management
- BS02 - What Is Hippotherapy Content
- BS03 - Testimonials Section Management
- BS04 - What Is Ipoventia Content
- BS05 - Center of Ipoventia Section
- BS06 - Why This Approach Content
- BS07 - What This Approach Shows
- BS08 - Scientific Research Management
- BS09 - Who Programs Suit Content
- BS10 - Hippotherapy Principles Section
- BS11 - Admin Page Integration

## Technical Goal
Create comprehensive Yup validation schemas for all hippotherapy section forms, ensuring data integrity and providing clear error messages for admin users.

## Acceptance Criteria
- [ ] Title section schema validates heading (1-200 chars), description (1-1000 chars), and image
- [ ] What Is schema validates heading, description, and image
- [ ] Testimonials schema validates each testimonial (person name, text, image)
- [ ] What Is Ipoventia schema validates heading and description
- [ ] Center of Ipoventia schema validates heading, description, and image
- [ ] Card sections schema validates heading, description, and optional images
- [ ] Scientific Research schema validates general text and research entries array
- [ ] Research entry schema validates title, description, link, and optional image
- [ ] Principles schema validates principles array (heading, description per principle)
- [ ] All schemas support multilingual validation (UK/EN)
- [ ] Image validation includes type (jpg/png/webp), size (max 5MB), and dimensions
- [ ] Required/optional field rules match business requirements
- [ ] Error messages are descriptive and actionable
- [ ] Schemas are reusable across similar section types

## Implementation Details

### Files to Create
- `src/validation/admin/hippotherapy-validation-schema.ts`

### Code Example

```typescript
import * as yup from 'yup';
import { MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@/const/admin/hippotherapy-constants';

// Shared validation rules
const imageValidation = yup
  .mixed()
  .test('fileType', 'Image must be JPG, PNG, or WebP', (value) => {
    if (!value) return true; // Optional images
    return value instanceof File && ALLOWED_IMAGE_TYPES.includes(value.type);
  })
  .test('fileSize', `Image must be less than ${MAX_IMAGE_SIZE_MB}MB`, (value) => {
    if (!value) return true;
    return value instanceof File && value.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024;
  });

const requiredImageValidation = imageValidation.required('Image is required');

const headingValidation = yup
  .string()
  .trim()
  .min(1, 'Heading must be at least 1 character')
  .max(200, 'Heading must be at most 200 characters')
  .required('Heading is required');

const descriptionValidation = yup
  .string()
  .trim()
  .min(1, 'Description must be at least 1 character')
  .max(1000, 'Description must be at most 1000 characters')
  .required('Description is required');

const richTextValidation = yup
  .string()
  .trim()
  .min(1, 'Content is required')
  .max(5000, 'Content must be at most 5000 characters')
  .required('Content is required');

// Title Section Schema
export const titleSectionSchema = yup.object().shape({
  heading: headingValidation,
  description: descriptionValidation,
  image: requiredImageValidation,
  isPublished: yup.boolean().required(),
});

// What Is Hippotherapy Schema
export const whatIsHippotherapySchema = yup.object().shape({
  heading: headingValidation,
  description: richTextValidation,
  image: requiredImageValidation,
  isPublished: yup.boolean().required(),
});

// Testimonials Schema
export const testimonialsSchema = yup.object().shape({
  testimonials: yup
    .array()
    .of(
      yup.object().shape({
        personName: yup
          .string()
          .trim()
          .min(2, 'Name must be at least 2 characters')
          .max(100, 'Name must be at most 100 characters')
          .required('Person name is required'),
        text: yup
          .string()
          .trim()
          .min(10, 'Testimonial must be at least 10 characters')
          .max(500, 'Testimonial must be at most 500 characters')
          .required('Testimonial text is required'),
        image: requiredImageValidation,
      })
    )
    .min(1, 'At least one testimonial is required')
    .max(10, 'Maximum 10 testimonials allowed')
    .required(),
  isPublished: yup.boolean().required(),
});

// What Is Ipoventia Schema
export const whatIsIpoventiaSchema = yup.object().shape({
  heading: headingValidation,
  description: richTextValidation,
  isPublished: yup.boolean().required(),
});

// Center of Ipoventia Schema
export const centerOfIpoventiaSchema = yup.object().shape({
  heading: headingValidation,
  description: richTextValidation,
  image: requiredImageValidation,
  isPublished: yup.boolean().required(),
});

// Card Section Schema (Why/Who)
export const cardSectionSchema = yup.object().shape({
  heading: headingValidation,
  description: richTextValidation,
  imageLeft: imageValidation.optional(),
  imageRight: imageValidation.optional(),
  isPublished: yup.boolean().required(),
});

// Scientific Research Schema
export const scientificResearchSchema = yup.object().shape({
  generalText: richTextValidation,
  researchEntries: yup
    .array()
    .of(
      yup.object().shape({
        title: yup
          .string()
          .trim()
          .min(5, 'Title must be at least 5 characters')
          .max(200, 'Title must be at most 200 characters')
          .required('Research title is required'),
        description: yup
          .string()
          .trim()
          .min(10, 'Description must be at least 10 characters')
          .max(1000, 'Description must be at most 1000 characters')
          .required('Research description is required'),
        link: yup
          .string()
          .url('Must be a valid URL')
          .required('Research link is required'),
        image: imageValidation.optional(),
      })
    )
    .min(1, 'At least one research entry is required')
    .max(20, 'Maximum 20 research entries allowed')
    .required(),
  isPublished: yup.boolean().required(),
});

// Principles Schema
export const principlesSchema = yup.object().shape({
  principles: yup
    .array()
    .of(
      yup.object().shape({
        heading: headingValidation,
        description: descriptionValidation,
      })
    )
    .min(1, 'At least one principle is required')
    .max(10, 'Maximum 10 principles allowed')
    .required(),
  isPublished: yup.boolean().required(),
});
```

### Architecture Decisions
- Use Yup for consistency with existing Victory Center validation patterns
- Create shared validation rules to avoid duplication
- Support both create and update operations with same schemas
- Validation messages match user-facing language in admin panel
- Image validation at form level (detailed validation at upload component level)

## Test Cases

### Unit Tests

**File**: `src/validation/admin/hippotherapy-validation-schema.test.ts`

- Test titleSectionSchema with valid data passes
- Test titleSectionSchema with missing heading fails
- Test titleSectionSchema with heading too long (>200 chars) fails
- Test titleSectionSchema with invalid image type fails
- Test titleSectionSchema with image too large (>5MB) fails
- Test whatIsHippotherapySchema with valid rich text passes
- Test testimonialsSchema with valid array passes
- Test testimonialsSchema with empty array fails
- Test testimonialsSchema with >10 testimonials fails
- Test testimonialsSchema with testimonial text too short (<10 chars) fails
- Test whatIsIpoventiaSchema without image passes (no image required)
- Test centerOfIpoventiaSchema with image required
- Test cardSectionSchema with optional images
- Test scientificResearchSchema with valid research entries
- Test scientificResearchSchema with invalid URL fails
- Test scientificResearchSchema with >20 entries fails
- Test principlesSchema with valid principles array
- Test principlesSchema with empty principles array fails

### Integration Tests
- Test schema integration with React Hook Form in TitleSectionForm
- Test error message display in form components
- Test async validation behavior (if added later for unique checks)

## Dependencies

**Technical Dependencies**:
- TS01: Foundation Types (must complete first - provides base types)
- TS02: Constants (must complete first - provides validation limits)

**Business Context**: Foundation for ALL business stories (BS01-BS11)

## Estimated Effort

**4 hours**

- Schema definition: 2 hours
- Test cases: 1.5 hours
- Documentation: 0.5 hours

## Technical Notes

### Patterns to Follow
- Follow existing Victory Center validation patterns (see `src/validation/admin/program-schema.ts`)
- Use shared validation rules to avoid duplication
- Error messages should be user-friendly and actionable
- Support both create and update operations

### Risks and Mitigation
- **Risk**: Validation rules too strict, blocking legitimate content
  - **Mitigation**: Start with reasonable limits, adjust based on user feedback
- **Risk**: Image validation complexity (dimensions, aspect ratio)
  - **Mitigation**: Keep basic validation here, delegate detailed checks to ImageUploadField component
- **Risk**: Rich text validation (HTML structure, sanitization)
  - **Mitigation**: Validate string length and required, Lexical editor handles structure

### Performance Considerations
- Yup validation is synchronous and fast
- Image file size checks happen on File object, not full read
- Schema compilation happens once, reused for all validations

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Schemas defined for all 10 sections
- [ ] Shared validation rules extracted
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Schemas integrate with React Hook Form
- [ ] Error messages tested and user-friendly
- [ ] Documentation complete
- [ ] Code reviewed and approved
- [ ] No lint warnings
- [ ] Schemas tested in at least one form component
