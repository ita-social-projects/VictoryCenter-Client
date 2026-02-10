---
name: victory-center-forms
description: Help with Victory Center forms, validation schemas, React Hook Form patterns, and multilingual form handling
invoked-by: both
tools:
  - read
  - search
---

# Victory Center Forms Skill

This skill helps you work with forms, validation, and form state management in Victory Center.

## What This Skill Does

Helps you:
- Create new forms with validation
- Understand validation schemas
- Use React Hook Form patterns
- Handle multilingual form fields
- Implement form submission
- Use form input components

## How to Use

**User invocation**: `/victory-center-forms [query]`

**Examples**:
- `/victory-center-forms how to create a new form with validation?`
- `/victory-center-forms show me program form validation`
- `/victory-center-forms how to handle multilingual fields?`
- `/victory-center-forms what validation schemas exist?`

## Instructions

When this skill is invoked:

1. **Understand the Request**:
   - Creating new form
   - Understanding validation
   - Form submission handling
   - Multilingual forms
   - Input components

2. **Key Files to Reference**:

   **Form Hook**:
   - [src/hooks/admin/use-form-manager/](src/hooks/admin/use-form-manager/) - Central form management hook

   **Validation Schemas** (`src/validation/admin/`):
   - [program-schema](src/validation/admin/program-schema/) - Program validation
   - [team-member-schema](src/validation/admin/team-member-schema/) - Team member validation
   - [faq-schema](src/validation/admin/faq-schema/) - FAQ validation
   - [program-category-schema](src/validation/admin/program-category-schema/) - Category validation
   - [team-category-schema](src/validation/admin/team-category-schema/) - Team category validation

   **Example Forms**:
   - [src/pages/admin/programs/components/program-form/](src/pages/admin/programs/components/program-form/) - Complex form with sections
   - [src/pages/admin/team/components/member-form/](src/pages/admin/team/components/member-form/) - Multilingual form
   - [src/pages/admin/faq/components/faq-form/](src/pages/admin/faq/components/faq-form/) - Simple form

   **Input Components** (`src/components/admin/input-groups/`):
   - [input-with-character-limit-group](src/components/admin/input-groups/input-with-character-limit-group/)
   - [text-area-with-character-limit-group](src/components/admin/input-groups/text-area-with-character-limit-group/)
   - [multi-select-input-group](src/components/admin/input-groups/multi-select-input-group/)
   - [single-select-input-group](src/components/admin/input-groups/single-select-input-group/)
   - [photo-input-group](src/components/admin/input-groups/photo-input-group/)

3. **Provide Complete Example**:

## Form Creation Pattern

### Step 1: Define TypeScript Types

```typescript
// src/types/admin/my-resource.ts
export interface MyResource {
  id: string;
  title: {
    uk: string;
    en: string;
  };
  description: {
    uk: string;
    en: string;
  };
  category: string;
  isPublished: boolean;
}

export interface MyResourceCreateUpdate {
  title: {
    uk: string;
    en: string;
  };
  description: {
    uk: string;
    en: string;
  };
  category: string;
}
```

### Step 2: Create Validation Schema

```typescript
// src/validation/admin/my-resource-schema/index.ts
import * as Yup from 'yup';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

export const myResourceSchema = Yup.object().shape({
  title: Yup.object().shape({
    uk: Yup.string()
      .required('Title (UK) is required')
      .max(MAX_TITLE_LENGTH, `Max ${MAX_TITLE_LENGTH} characters`),
    en: Yup.string()
      .required('Title (EN) is required')
      .max(MAX_TITLE_LENGTH, `Max ${MAX_TITLE_LENGTH} characters`),
  }),
  description: Yup.object().shape({
    uk: Yup.string()
      .required('Description (UK) is required')
      .max(MAX_DESCRIPTION_LENGTH, `Max ${MAX_DESCRIPTION_LENGTH} characters`),
    en: Yup.string()
      .required('Description (EN) is required')
      .max(MAX_DESCRIPTION_LENGTH, `Max ${MAX_DESCRIPTION_LENGTH} characters`),
  }),
  category: Yup.string().required('Category is required'),
});
```

### Step 3: Create Form Component

```typescript
// src/pages/admin/my-resource/components/my-resource-form/MyResourceForm.tsx
import React from 'react';
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit';
import { useToast } from '@/contexts/admin/toast-context-provider';
import { myResourceSchema } from '@/validation/admin/my-resource-schema';
import { MyResourceCreateUpdate } from '@/types/admin/my-resource';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group';
import { LocalizationToolkit } from '@/components/admin/localization-toolkit';
import styles from './MyResourceForm.module.scss';

interface MyResourceFormProps {
  initialData?: MyResourceCreateUpdate;
  onSubmit: (data: MyResourceCreateUpdate) => Promise<void>;
  onCancel: () => void;
  categories: Array<{ value: string; label: string }>;
}

export const MyResourceForm: React.FC<MyResourceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  categories
}) => {
  const { showToast } = useToast();
  const { currentLocale, switchLocale } = useLocalizationToolkit();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useFormManager<MyResourceCreateUpdate>({
    schema: myResourceSchema,
    defaultValues: initialData || {
      title: { uk: '', en: '' },
      description: { uk: '', en: '' },
      category: ''
    }
  });

  const handleFormSubmit = async (data: MyResourceCreateUpdate) => {
    try {
      await onSubmit(data);
      showToast('Saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
      <LocalizationToolkit
        currentLocale={currentLocale}
        onLocaleChange={switchLocale}
      />

      <InputWithCharacterLimitGroup
        label="Title"
        name={`title.${currentLocale}`}
        control={control}
        errors={errors}
        maxLength={100}
        required
      />

      <TextAreaWithCharacterLimitGroup
        label="Description"
        name={`description.${currentLocale}`}
        control={control}
        errors={errors}
        maxLength={500}
        required
      />

      <SingleSelectInputGroup
        label="Category"
        name="category"
        control={control}
        errors={errors}
        options={categories}
        required
      />

      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};
```

## Available Input Components

### InputWithCharacterLimitGroup
Single-line text input with character counter.

```typescript
<InputWithCharacterLimitGroup
  label="Title"
  name="title"
  control={control}
  errors={errors}
  maxLength={100}
  required
/>
```

### TextAreaWithCharacterLimitGroup
Multi-line text input with character counter.

```typescript
<TextAreaWithCharacterLimitGroup
  label="Description"
  name="description"
  control={control}
  errors={errors}
  maxLength={500}
  rows={5}
  required
/>
```

### SingleSelectInputGroup
Dropdown select with single selection.

```typescript
<SingleSelectInputGroup
  label="Category"
  name="category"
  control={control}
  errors={errors}
  options={[
    { value: '1', label: 'Category 1' },
    { value: '2', label: 'Category 2' }
  ]}
  required
/>
```

### MultiSelectInputGroup
Dropdown with multiple selection.

```typescript
<MultiSelectInputGroup
  label="Pages"
  name="pages"
  control={control}
  errors={errors}
  options={pageOptions}
  required
/>
```

### PhotoInputGroup
Image upload with cropping and preview.

```typescript
<PhotoInputGroup
  label="Photo"
  name="photo"
  control={control}
  errors={errors}
  required
/>
```

## Validation Schema Patterns

### String Validation
```typescript
Yup.string()
  .required('Field is required')
  .min(3, 'Minimum 3 characters')
  .max(100, 'Maximum 100 characters')
  .matches(/^[a-zA-Z0-9]+$/, 'Only alphanumeric')
```

### Email Validation
```typescript
Yup.string()
  .required('Email is required')
  .email('Invalid email format')
```

### URL Validation
```typescript
Yup.string()
  .url('Invalid URL format')
  .nullable()
```

### Number Validation
```typescript
Yup.number()
  .required('Number is required')
  .min(0, 'Must be positive')
  .max(100, 'Maximum 100')
```

### Array Validation
```typescript
Yup.array()
  .of(Yup.string())
  .min(1, 'Select at least one')
  .required('Required')
```

### Nested Object Validation
```typescript
Yup.object().shape({
  title: Yup.object().shape({
    uk: Yup.string().required('UK title required'),
    en: Yup.string().required('EN title required'),
  }),
})
```

### Conditional Validation
```typescript
Yup.string().when('otherField', {
  is: (val) => val === 'condition',
  then: (schema) => schema.required('Required when condition met'),
  otherwise: (schema) => schema.nullable(),
})
```

## Multilingual Form Handling

### Using LocalizationToolkit

```typescript
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit';

const { currentLocale, switchLocale, getLocalization } = useLocalizationToolkit();

// Show locale tabs
<LocalizationToolkit
  currentLocale={currentLocale}
  onLocaleChange={switchLocale}
/>

// Dynamic field names based on locale
<InputWithCharacterLimitGroup
  label="Title"
  name={`title.${currentLocale}`}  // 'title.uk' or 'title.en'
  control={control}
  errors={errors}
  maxLength={100}
/>
```

### Validation for Multilingual Fields

```typescript
// Both languages required
title: Yup.object().shape({
  uk: Yup.string().required('Title (UK) is required'),
  en: Yup.string().required('Title (EN) is required'),
})

// Only current locale required
title: Yup.object().shape({
  [currentLocale]: Yup.string().required(`Title (${currentLocale.toUpperCase()}) is required`),
})
```

## Form Submission Pattern

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    // Show loading state
    setIsSubmitting(true);

    // Call API
    if (isEditMode) {
      await updateResource(adminClient, resourceId, data);
    } else {
      await createResource(adminClient, data);
    }

    // Show success toast
    showToast('Saved successfully!', 'success');

    // Close modal or navigate
    onClose();

    // Refresh data
    refetch();
  } catch (error) {
    // Show error toast
    showToast('Failed to save', 'error');
    console.error(error);
  } finally {
    setIsSubmitting(false);
  }
};
```

## Common Validation Constants

```typescript
// src/const/admin/validation.ts
export const VALIDATION = {
  TITLE: {
    MIN: 1,
    MAX: 100,
  },
  DESCRIPTION: {
    MIN: 10,
    MAX: 500,
  },
  RICH_TEXT: {
    MAX: 10000,
  },
  NAME: {
    MIN: 2,
    MAX: 50,
  },
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
};
```

## Output Format

```markdown
## [Query Summary]

### Solution

[Explanation of the solution]

### Code Example

\`\`\`typescript
[Complete, working code example]
\`\`\`

### Related Files

- Validation Schema: [schema-file](path/to/schema.ts)
- Form Component: [form-file](path/to/form.tsx)
- Types: [types-file](path/to/types.ts)
- Example: [example-form](path/to/example.tsx)

### Key Points

- [Important point 1]
- [Important point 2]
- [Important point 3]
```

## Tips

- Always use `useFormManager` hook for forms
- Always create Yup validation schema
- Use input group components (include label + error + counter)
- Handle both create and edit modes
- Show loading state during submission
- Always show toast notification (success/error)
- Validate both UK and EN for multilingual fields
- Use `LocalizationToolkit` for language switching in forms
- Keep validation schemas in `src/validation/admin/`
- Define max length constants in validation files
- Test form validation thoroughly
- Handle API errors gracefully
- This skill uses Copilot's read and search tools
