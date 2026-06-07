# TS28: Testimonials Translation Modal

## Implements
**Business Stories**: BS03 - Testimonials Section Management

## Technical Goal
Create translation modal for testimonials section with dynamic testimonial list management.

## Acceptance Criteria
- [ ] Modal extends TranslationModalBase
- [ ] Modal displays list of testimonials (array)
- [ ] Modal allows adding/removing testimonials
- [ ] Each testimonial has: personName, text, image fields
- [ ] Modal validates all testimonial fields
- [ ] Modal saves testimonials array on submit

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/translation-modals/TestimonialsTranslationModal.tsx`

### Code Example

```typescript
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, Box } from '@mui/material';
import { TranslationModalBase } from '../shared/translation-modal-base';
import { TextInputField } from '../shared/text-input-field';
import { ImageUploadField } from '../shared/image-upload-field';
import { testimonialsSchema } from '@/validation/admin/hippotherapy-validation-schema';

export const TestimonialsTranslationModal: React.FC<TranslationModalProps> = ({
  open,
  onClose,
  sectionId,
  currentLanguage,
  onSave,
  loading,
}) => {
  const form = useForm({
    resolver: yupResolver(testimonialsSchema),
    defaultValues: { testimonials: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'testimonials',
  });

  const handleSave = async () => {
    await onSave(currentLanguage, form.getValues());
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
      {fields.map((field, index) => (
        <Box key={field.id}>
          <TextInputField
            name={`testimonials.${index}.personName`}
            control={form.control}
            label={`Person Name ${index + 1}`}
            required
          />
          <TextInputField
            name={`testimonials.${index}.text`}
            control={form.control}
            label={`Text ${index + 1}`}
            required
            multiline
            rows={4}
          />
          <ImageUploadField
            name={`testimonials.${index}.image`}
            control={form.control}
            label={`Image ${index + 1}`}
            required
          />
          <Button onClick={() => remove(index)}>Remove</Button>
        </Box>
      ))}
      <Button onClick={() => append({ personName: '', text: '', image: null })}>
        Add Testimonial
      </Button>
    </TranslationModalBase>
  );
};
```

## Dependencies
- TS26, TS15, TS16

## Estimated Effort
**3 hours**
