---
name: victory-center-components
description: Find and understand Victory Center components, create new components following project patterns
invoked-by: both
allowed-tools:
  - Read
  - Glob
  - Grep
---

# Victory Center Components Skill

This skill helps you find, understand, and create components in the Victory Center project.

## What This Skill Does

Helps you:
- Find existing components
- Understand component structure and patterns
- Create new components following conventions
- Understand component relationships
- Locate reusable components

## How to Use

**User invocation**: `/victory-center-components [query]`

**Examples**:
- `/victory-center-components show me the rich text editor`
- `/victory-center-components how to create a new admin form component?`
- `/victory-center-components find all modal components`
- `/victory-center-components what input components are available?`

## Instructions

When this skill is invoked:

1. **Understand the Query Type**:
   - Finding existing component
   - Understanding component usage
   - Creating new component
   - Exploring component patterns

2. **Component Categories**:

   **Admin Components** (`src/components/admin/`):
   - **Forms**: input-with-character-limit, textarea-with-character-limit, multi-select-input
   - **Input Groups**: Complete form fields with label + input + error + counter
   - **Rich Text**: Lexical editor with plugins (MaxLength, Focus, Toolbar, EnterKey)
   - **Image**: image-input, cropper-modal
   - **Drag & Drop**: draggable-list-item, drag-preview
   - **Modals**: confirmation-modal, generic-modal-wrapper
   - **Localization**: localization-toolkit, localization-statuses
   - **UI**: button, tooltip, hint-box, toast
   - **Navigation**: admin-navigation, category-bar
   - **Search**: search-bar with search items
   - **Route Guards**: private-route, public-route

   **Public Components** (`src/components/public/`):
   - **Layout**: header, footer
   - **i18n**: language-switcher, language-sync-wrapper
   - **Content**: faq-section, program-card, swiper
   - **Navigation**: dropdown-menu
   - **Media**: background-media

   **Common Components** (`src/components/common/`):
   - **Loaders**: inline-loader, page-loader
   - **UI**: modal, tabs, select, single-select-input
   - **Content**: partners, program-section-templates
   - **Templates**: single-image-top, single-image-bottom, single-image-right, text-only

3. **For Finding Components**:
   - Use Glob to search by pattern: `src/components/**/*[keyword]*.tsx`
   - Read component file to understand props and usage
   - Check if there's a test file: `ComponentName.test.tsx`
   - Check for styles: `ComponentName.module.scss`

4. **For Creating Components**:
   - Show the standard component template
   - Identify similar existing components as examples
   - List required files (component, test, styles)
   - Show proper import/export patterns

## Component Template

### Standard Component Structure

```typescript
// ComponentName.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ComponentName.module.scss';

interface ComponentNameProps {
  // Define props with TypeScript
  title: string;
  onSubmit?: () => void;
  isLoading?: boolean;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  onSubmit,
  isLoading = false
}) => {
  const { t } = useTranslation('namespace');

  // Hooks (state, effects, custom hooks)

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      {/* Component JSX */}
    </div>
  );
};
```

### Component Test Template

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const onSubmit = jest.fn();
    render(<ComponentName title="Test" onSubmit={onSubmit} />);
    // Test interaction
  });
});
```

### SASS Module Template

```scss
// ComponentName.module.scss
@import '@/assets/sass/variables/colors';
@import '@/assets/sass/mixins/typography.mixins';

.container {
  display: flex;
  flex-direction: column;
  padding: 20px;

  .title {
    @include heading-large;
    color: $primary-color;
  }
}
```

## Key Patterns

### Compound Components (Input Groups)

Victory Center uses compound components for form inputs:

```typescript
// Input + Label + Error + Character Counter
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group';

<InputWithCharacterLimitGroup
  label="Title"
  name="title"
  control={control}
  errors={errors}
  maxLength={100}
  required
/>
```

Available input groups:
- `InputWithCharacterLimitGroup`
- `TextAreaWithCharacterLimitGroup`
- `MultiSelectInputGroup`
- `SingleSelectInputGroup`
- `PhotoInputGroup`

### Modal Pattern

```typescript
import { GenericModalWrapper } from '@/components/admin/generic-modal-wrapper';

<GenericModalWrapper
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
>
  {/* Modal content */}
</GenericModalWrapper>
```

### Localized Components

For multilingual admin forms:

```typescript
import { LocalizationToolkit } from '@/components/admin/localization-toolkit';

<LocalizationToolkit
  currentLocale={currentLocale}
  onLocaleChange={setCurrentLocale}
  localizationStatuses={statuses}
/>
```

## Common Component Locations

### Rich Text Editor
- **Main**: [src/components/admin/rich-text-input/](src/components/admin/rich-text-input/)
- **Plugins**: [src/components/admin/rich-text-input/plugins/](src/components/admin/rich-text-input/plugins/)
  - EnterKeyPlugin, MaxLengthPlugin, FocusPlugin, ToolbarPlugin, OnChangePlugin

### Form Components
- **Input**: [src/components/admin/input-with-character-limit/](src/components/admin/input-with-character-limit/)
- **Textarea**: [src/components/admin/textarea-with-character-limit/](src/components/admin/textarea-with-character-limit/)
- **Select**: [src/components/admin/multi-select-input/](src/components/admin/multi-select-input/)
- **Image**: [src/components/admin/image-input/](src/components/admin/image-input/)

### Layout Components
- **Admin Navigation**: [src/components/admin/admin-navigation/](src/components/admin/admin-navigation/)
- **Public Header**: [src/components/public/header/](src/components/public/header/)
- **Public Footer**: [src/components/public/footer/](src/components/public/footer/)

### Reusable UI
- **Modals**: [src/components/admin/generic-modal-wrapper/](src/components/admin/generic-modal-wrapper/)
- **Loaders**: [src/components/common/page-loader/](src/components/common/page-loader/)
- **Toast**: [src/components/admin/toast/](src/components/admin/toast/)

## Output Format

```markdown
## [Component Query]

### Found Component

**Location**: [ComponentName.tsx](path/to/ComponentName.tsx)
**Type**: [Admin/Public/Common]
**Purpose**: [Brief description]

### Props Interface

\`\`\`typescript
interface ComponentNameProps {
  prop1: string;
  prop2?: boolean;
}
\`\`\`

### Usage Example

\`\`\`typescript
import { ComponentName } from '@/components/[path]/ComponentName';

<ComponentName prop1="value" />
\`\`\`

### Related Files

- Test: [ComponentName.test.tsx](path/to/test.tsx)
- Styles: [ComponentName.module.scss](path/to/styles.scss)
- Types: [types.ts](path/to/types.ts)

### Similar Components

[List similar components that might be useful]
```

## Tips

- Use `@/components/*` path alias for imports
- Every component should have a test file
- Use SASS modules for component styles (`.module.scss`)
- Extract reusable logic into custom hooks
- Keep components under 300 lines (split if larger)
- Use TypeScript interfaces for props (never `any`)
- Use Material-UI components when possible
- Follow existing naming conventions (PascalCase)
- Co-locate related files (component + test + styles)
