# TS27: Set1 Translation Modal (Title, What Is...)

## Implements
**Business Stories**: BS01 - Title Section, BS02 - What Is Hippotherapy

## Technical Goal
Create translation modal for sections with heading + description + image structure (Title and What Is Hippotherapy sections).

## Acceptance Criteria
- [ ] Modal extends TranslationModalBase
- [ ] Modal contains heading field (text input)
- [ ] Modal contains description field (rich text for What Is, plain text for Title)
- [ ] Modal contains image upload field
- [ ] Modal pre-fills with existing translation data
- [ ] Modal validates all required fields
- [ ] Modal saves translation on submit
- [ ] Modal updates translation status on success

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/translation-modals/Set1TranslationModal.tsx`

### Code Example

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TranslationModalBase } from '../shared/translation-modal-base';
import { TextInputField } from '../shared/text-input-field';
import { ImageUploadField } from '../shared/image-upload-field';
import { TranslationModalProps } from '@/types/admin/hippotherapy-translation.types';
import { titleSectionSchema } from '@/validation/admin/hippotherapy-validation-schema';

export const Set1TranslationModal: React.FC<TranslationModalProps> = ({
  open,
  onClose,
  sectionId,
  currentLanguage,
  onSave,
  loading,
}) => {
  const form = useForm({
    resolver: yupResolver(titleSectionSchema),
    defaultValues: {
      heading: '',
      description: '',
      image: null,
    },
  });

  const handleSave = async () => {
    const data = form.getValues();
    await onSave(currentLanguage, data);
  };

  return (
    <TranslationModalBase
      open={open}
      onClose={onClose}
      onSave={handleSave}
      sectionName={sectionId}
      language={currentLanguage}
      form={form}
      loading={loading}
    >
      <TextInputField
        name="heading"
        control={form.control}
        label="Heading"
        required
        maxLength={200}
        error={form.formState.errors.heading}
      />
      <TextInputField
        name="description"
        control={form.control}
        label="Description"
        required
        multiline
        rows={6}
        maxLength={1000}
        error={form.formState.errors.description}
      />
      <ImageUploadField
        name="image"
        control={form.control}
        label="Image"
        required
        error={form.formState.errors.image}
      />
    </TranslationModalBase>
  );
};
```

## Test Cases
- Test modal renders all fields
- Test form validation
- Test form submission
- Test image upload

## Dependencies
- TS26: TranslationModalBase
- TS15: ImageUploadField
- TS16: TextInputField

## Estimated Effort
**3 hours**

## Definition of Done
- [ ] Modal complete with all fields
- [ ] Tests passing
