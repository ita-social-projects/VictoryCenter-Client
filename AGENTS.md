# AGENTS.md

This file provides context and instructions for AI coding agents (GitHub Copilot, Cursor, etc.) working on the Victory Center project.

---

## Project Context

**Victory Center** is a React 19 + TypeScript SPA for a hippotherapy/rehabilitation center with:
- **Public website** (multilingual: Ukrainian/English)
- **Admin CMS panel** (JWT-authenticated content management)
- **Backend API**: https://backend.victorycenter.online/api

---

## Tech Stack

```yaml
Framework: React 19.1.0
Language: TypeScript 5.9.3
Router: React Router DOM 7.5.3
UI Library: Material-UI 7.3.1 + Emotion CSS-in-JS
Forms: React Hook Form 7.60.0 + Yup 1.6.1
Rich Text: Lexical 0.39.0
i18n: i18next 25.5.3 (uk, en)
HTTP Client: Axios 1.10.0
Build Tool: Create React App + Craco
Testing: Jest 29 + React Testing Library
Node: 20+
```

---

## File Structure

```
src/
├── components/       # UI components (admin/, public/, common/)
├── pages/           # Page components (admin/, public/)
├── hooks/           # Custom hooks (admin/, common/)
├── contexts/        # React contexts (auth, toast, visitor pages)
├── services/api/    # API services (admin/, public/)
├── types/           # TypeScript types
├── validation/      # Yup validation schemas
├── const/           # Constants & config
├── utils/           # Helper functions
├── locales/         # i18n translations (uk/, en/)
├── assets/          # Static assets
└── routes/          # Router setup
```

---

## Code Style & Conventions

### TypeScript Patterns

**Always use TypeScript interfaces for props:**
```typescript
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export const Component: React.FC<ComponentProps> = ({ title, onSubmit, isLoading = false }) => {
  // Implementation
};
```

**Use path aliases (REQUIRED):**
```typescript
// ✅ Always use this
import { Button } from '@/components/admin/button';
import { useAdminClient } from '@/hooks/admin/use-admin-client';

// ❌ Never use relative paths
import { Button } from '../../../components/admin/button';
```

### Naming Conventions

- **Components**: PascalCase (`TeamMemberCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useDataFetch.ts`)
- **Types/Interfaces**: PascalCase (`ProgramCreateUpdate`, `TeamMemberProps`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CHARACTER_LIMIT`, `API_BASE_URL`)
- **Functions**: camelCase (`getCroppedImage`, `formatBankDetails`)
- **Files**: kebab-case for non-components (`api-routes.ts`, `text-formatters.ts`)
- **SASS**: kebab-case modules (`component-name.module.scss`)

### Component Structure

```typescript
// Standard component template
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ComponentName.module.scss';

interface ComponentNameProps {
  // Props
}

export const ComponentName: React.FC<ComponentNameProps> = ({ props }) => {
  const { t } = useTranslation('namespace');

  // Hooks
  // Handlers
  // Effects

  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};
```

### Import Order

1. React & external libraries
2. Internal components (`@/components/*`)
3. Hooks (`@/hooks/*`)
4. Services (`@/services/*`)
5. Types (`@/types/*`)
6. Constants (`@/const/*`)
7. Utils (`@/utils/*`)
8. Styles
9. Assets

---

## Common Patterns

### Authentication

**Use AdminContext for all admin operations:**
```typescript
import { useAdminClient } from '@/hooks/admin/use-admin-client';

const { adminClient, isAuthenticated, login, logout } = useAdminClient();

// Authenticated API call
const response = await adminClient.post('/admin/programs', data);
```

### Forms with Validation

**Always use React Hook Form + Yup schema:**
```typescript
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { programSchema } from '@/validation/admin/program-schema';

const { register, handleSubmit, formState: { errors }, control } = useFormManager({
  schema: programSchema,
  defaultValues: initialData
});

const onSubmit = async (data: ProgramFormData) => {
  try {
    await saveProgram(data);
    showToast('Saved successfully!', 'success');
  } catch (error) {
    showToast('Failed to save', 'error');
  }
};
```

### Data Fetching

**Use custom hooks for data fetching:**
```typescript
// Simple fetch
import { useDataFetch } from '@/hooks/common/use-data-fetch';

const { data, loading, error } = useDataFetch(() => getPublicPrograms());

// Paginated admin fetch
import { useDataPaginationFetch } from '@/hooks/admin/fetch/use-data-pagination-fetch';

const { data, loading, hasMore, loadMore } = useDataPaginationFetch(
  (params) => getPrograms(params),
  { limit: 20 }
);
```

### Toast Notifications

**Always provide user feedback:**
```typescript
import { useToast } from '@/contexts/admin/toast-context-provider';

const { showToast } = useToast();

// Success, error, info, warning
showToast('Operation completed!', 'success');
```

### Internationalization

**Use i18next for all text:**
```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation('programsPage');

return (
  <>
    <h1>{t('title')}</h1>
    <button onClick={() => i18n.changeLanguage('en')}>EN</button>
  </>
);
```

**For admin forms with multilingual content:**
```typescript
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit';

const { currentLocale, switchLocale, getLocalization } = useLocalizationToolkit();
```

---

## Workflows

### Creating a New Admin Page

1. Create page component in `src/pages/admin/[page-name]/`
2. Create necessary child components in subdirectories
3. Add route in `src/const/admin/routes.ts`
4. Update router in `src/routes/app-router/AppRouter.tsx` with `<PrivateRoute>`
5. Add navigation link in `src/components/admin/admin-navigation/`
6. Create API service in `src/services/api/admin/[feature]/`
7. Add TypeScript types in `src/types/admin/[feature].ts`
8. Create validation schema in `src/validation/admin/[feature]-schema/`
9. Add i18n keys to `src/locales/[uk|en]/adminPanel.json`
10. Write tests

### Creating a New Public Page

1. Create page component in `src/pages/public/[page-name]/`
2. Add route in `src/const/public/routes.ts`
3. Update router in `src/routes/app-router/AppRouter.tsx`
4. Add navigation link in `src/components/public/header/`
5. Create API service in `src/services/api/public/[feature]/`
6. Add types in `src/types/public/[feature].ts`
7. Add i18n translations in `src/locales/[uk|en]/[page-name].json`
8. Write tests

### Adding a New Form

1. Define TypeScript interface for form data in `src/types/admin/`
2. Create Yup validation schema in `src/validation/admin/[feature]-schema/`
3. Use `useFormManager` hook with schema
4. Use input components from `src/components/admin/input-groups/`
5. Add character limits (constants in `src/const/admin/`)
6. Implement multilingual fields with `LocalizationToolkit`
7. Handle submission with API service
8. Show toast notifications for success/error

### Adding a New API Endpoint

1. Define types in `src/types/admin/` or `src/types/public/`
2. Add endpoint constant in `src/const/common/api-routes/main-api.ts`
3. Create service function in `src/services/api/[admin|public]/[feature]/`
4. Use `adminClient` for authenticated requests
5. Add error handling
6. Write tests with mocked responses

---

## Testing Requirements

### Unit Tests

- Test utilities and helper functions
- Test custom hooks with `renderHook`
- Mock external dependencies (axios, router, contexts)

### Component Tests

- Use React Testing Library
- Test user interactions with `@testing-library/user-event`
- Test accessibility (roles, labels)
- Mock API calls and contexts

### Coverage Targets

```
Statements: 93.5%
Branches: 86.9%
Functions: 91.1%
Lines: 94.9%
```

Run: `npm run test:cover`

---

## Commands

```bash
# Development
npm start                 # Dev server HTTP (port 3000)
npm run start-with-cert   # Dev server HTTPS (auto-generates SSL cert)

# Testing
npm test                  # Jest watch mode
npm run test:cover        # Coverage report

# Code Quality
npm run lint              # ESLint (max 10 warnings)
npm run lint:fix          # Auto-fix lint issues
npm run format            # Prettier formatting

# Build
npm run build             # Production build → /build/
```

---

## Important Rules

### DO:

✅ Always use TypeScript path aliases (`@/*`)
✅ Always use `useTranslation` for text content
✅ Always validate forms with Yup schemas
✅ Always show toast notifications for user actions
✅ Always use `adminClient` from `useAdminClient()` for admin API calls
✅ Always write tests for new components and utilities
✅ Always handle loading and error states
✅ Always sanitize HTML content with DOMPurify before rendering
✅ Use Material-UI components for consistency
✅ Use SASS modules for component-scoped styles
✅ Keep components small and focused (single responsibility)
✅ Use custom hooks for shared logic
✅ Follow existing patterns in similar components

### DON'T:

❌ Don't use relative imports (`../../../`) - use `@/*` aliases
❌ Don't hardcode text - use i18next translations
❌ Don't skip form validation
❌ Don't make API calls without error handling
❌ Don't forget to show user feedback (toasts, loading states)
❌ Don't bypass authentication checks
❌ Don't render unsanitized HTML (XSS risk)
❌ Don't create global styles (use modules or MUI)
❌ Don't ignore TypeScript errors
❌ Don't skip tests for new features
❌ Don't mutate props or state directly
❌ Don't use `any` type (use proper types or `unknown`)
❌ Don't commit `console.log` statements
❌ Don't use inline styles (use SASS or Emotion)
❌ Don't create components over 300 lines (split them)

---

## Security Guidelines

### Authentication

- JWT tokens stored in `localStorage`
- Tokens auto-refresh before expiration
- Use `PrivateRoute` for all admin pages
- Always use `adminClient` from context (includes auth headers)

### XSS Prevention

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML before rendering
const sanitizedHtml = DOMPurify.sanitize(userContent);
return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
```

### Input Validation

- Client-side: Yup schemas with strict validation
- Character limits enforced
- File upload validation (type, size, dimensions)
- URL validation for external links

---

## Domain-Specific Terms

- **Hippotherapy**: Therapeutic horseback riding programs
- **Program**: A therapeutic program with title, description, sections
- **Program Section**: Content block (text-only, single-image-top/bottom/right)
- **Team Member**: Staff profile with photo, bio, position, category
- **FAQ**: Question/answer pair assigned to specific pages
- **Visitor Page**: Public pages where FAQ can appear
- **Localization**: Multi-language content (Ukrainian/English)
- **Visibility Status**: Published (visible to public) or Draft (admin-only)
- **Category**: Grouping for programs or team members
- **Admin Client**: Authenticated Axios instance with JWT

---

## Current Branch Context

**Branch**: `fix-issues-with-reach-text`

**Recent Work**:
- Rich text editor (Lexical) improvements
- EnterKey plugin implementation
- Bug fixes in rich text input components

**Key File**: `src/components/admin/rich-text-input/plugins/EnterKeyPlugin.tsx`

---

## Dependencies & Tools

### Key Libraries

- **Lexical**: Rich text editor (Meta's framework)
  - Custom plugins in `src/components/admin/rich-text-input/plugins/`
  - Plugins: MaxLength, OnChange, Focus, Toolbar, EnterKey, InitialValue

- **React Hook Form**: Form state management
  - Use with `useFormManager` hook
  - Integration with Yup validation

- **Material-UI (MUI)**: UI component library
  - Use existing MUI components first
  - Custom styling via Emotion or SASS modules

- **Swiper**: Carousel/slider component
  - Used in public site for image galleries

- **React Image Crop**: Image cropping tool
  - Used in admin for photo uploads

---

## File References

**Key files to reference:**
- Router: `src/routes/app-router/AppRouter.tsx`
- Auth Context: `src/contexts/admin/admin-context-provider/AdminContextProvider.tsx`
- API Config: `src/const/common/api-routes/main-api.ts`
- Admin Routes: `src/const/admin/routes.ts`
- Public Routes: `src/const/public/routes.ts`
- TypeScript Config: `tsconfig.json`
- Build Config: `craco.config.js`

**For examples of patterns:**
- Admin form: `src/pages/admin/programs/components/program-form/`
- Public page: `src/pages/public/programs-page/`
- Custom hook: `src/hooks/admin/use-form-manager/`
- API service: `src/services/api/admin/programs/`
- Validation schema: `src/validation/admin/program-schema/`

---

## Agent Behavior

When working on this codebase:

1. **Analyze before coding**: Read similar components/patterns first
2. **Follow existing patterns**: Don't introduce new patterns without discussion
3. **Be consistent**: Match the style of surrounding code
4. **Think multilingual**: Always consider Ukrainian and English content
5. **Consider authentication**: Know which features are admin-only vs public
6. **Test your changes**: Write or update tests for your code
7. **Check types**: Ensure TypeScript compilation succeeds
8. **Validate forms**: Use existing validation schemas or create new ones
9. **Handle errors**: Always add try-catch and user feedback
10. **Update tests**: Maintain high coverage (93%+ target)

---

## Additional Resources

- **README**: `README.md` - Setup instructions
- **Contributing**: `CONTRIBUTING.md` - Contribution guidelines
- **CLAUDE.md**: Claude-specific context (similar to this file)
- **Frontend Repo**: https://github.com/ita-social-projects/VictoryCenter-Client
- **Backend Repo**: https://github.com/ita-social-projects/VictoryCenter-Back

---

**Last Updated**: 2026-02-07
**Maintained By**: Development team

*This file should be updated when significant changes are made to project structure, tech stack, or coding conventions.*
