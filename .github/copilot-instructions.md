# Victory Center - GitHub Copilot Instructions

This file provides always-on guidance for GitHub Copilot when working on the Victory Center project.

## Project Overview

Victory Center is a **React 19 + TypeScript SPA** for a hippotherapy/rehabilitation center with:
- **Public site**: Multilingual website (Ukrainian/English)
- **Admin CMS**: JWT-authenticated content management
- **Backend API**: https://backend.victorycenter.online/api

## Tech Stack

- React 19.1.0 + TypeScript 5.9.3
- Material-UI 7.3.1 + Emotion CSS-in-JS
- React Hook Form 7.60.0 + Yup 1.6.1
- Lexical 0.39.0 (rich text editor)
- i18next 25.5.3 (uk/en translations)
- Axios 1.10.0 (HTTP client)
- Jest 29 + React Testing Library

## Mandatory Conventions

### Path Aliases (CRITICAL)
```typescript
// ✅ ALWAYS use path alias
import { Button } from '@/components/admin/button';

// ❌ NEVER use relative paths
import { Button } from '../../../components/admin/button';
```

### Naming Conventions
- Components: PascalCase (`TeamMemberCard.tsx`)
- Hooks: camelCase with 'use' (`useDataFetch.ts`)
- Types: PascalCase (`ProgramCreateUpdate`)
- Constants: UPPER_SNAKE_CASE (`MAX_CHARACTER_LIMIT`)
- Files: kebab-case for non-components (`api-routes.ts`)
- SASS: kebab-case modules (`.module.scss`)

### Import Order
1. React/external libraries
2. Internal components (`@/components/*`)
3. Hooks (`@/hooks/*`)
4. Services/Types/Constants/Utils
5. Styles
6. Assets

## Critical Rules

### DO:
- ✅ Use `@/*` path aliases for ALL imports
- ✅ Use `useTranslation` for ALL user-facing text
- ✅ Validate ALL forms with Yup schemas
- ✅ Show toast notifications for ALL user actions
- ✅ Use `adminClient` from `useAdminClient()` for admin API calls
- ✅ Write tests for ALL new components/utilities
- ✅ Handle loading and error states
- ✅ Sanitize HTML with DOMPurify before rendering
- ✅ Use TypeScript interfaces (never `any`)
- ✅ Use Material-UI components when possible
- ✅ Follow existing patterns in similar code

### DON'T:
- ❌ Don't use relative imports (`../../../`)
- ❌ Don't hardcode text (use i18next)
- ❌ Don't skip form validation
- ❌ Don't make API calls without error handling
- ❌ Don't forget user feedback (toasts, loading)
- ❌ Don't bypass authentication
- ❌ Don't render unsanitized HTML
- ❌ Don't use `any` type
- ❌ Don't commit `console.log`
- ❌ Don't use inline styles
- ❌ Don't create components over 300 lines

## Authentication Pattern

```typescript
import { useAdminClient } from '@/hooks/admin/use-admin-client';

const { adminClient, isAuthenticated } = useAdminClient();

// Authenticated request (auto-includes JWT)
const data = await adminClient.post('/admin/programs', formData);
```

## Form Pattern

```typescript
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { programSchema } from '@/validation/admin/program-schema';

const { control, handleSubmit, formState: { errors } } = useFormManager({
  schema: programSchema,
  defaultValues: initialData
});
```

## Internationalization

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('programsPage');
return <h1>{t('title')}</h1>;
```

## Component Structure

```typescript
// Standard component template
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ComponentName.module.scss';

interface ComponentNameProps {
  title: string;
  onSubmit?: () => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ title, onSubmit }) => {
  const { t } = useTranslation('namespace');

  return (
    <div className={styles.container}>
      <h1>{title}</h1>
    </div>
  );
};
```

## Testing Requirements

- Write tests for all new components/utilities
- Use React Testing Library for components
- Coverage targets: 93%+ lines, 86%+ branches
- Test file naming: `ComponentName.test.tsx`
- Co-locate tests with source files

## Security

- JWT tokens in localStorage (managed by AdminContext)
- Always use `adminClient` for admin endpoints
- Sanitize HTML: `DOMPurify.sanitize(content)`
- Validate inputs: Client-side (Yup) + server-side
- File uploads: Validate type, size, dimensions

## Project Structure

```
src/
├── components/       # admin/, public/, common/
├── pages/           # admin/, public/
├── hooks/           # admin/, common/
├── contexts/        # admin/ (Auth, Toast, VisitorPages)
├── services/api/    # admin/, public/
├── types/           # admin/, public/, common/
├── validation/      # Yup schemas
├── const/           # Constants & API routes
├── utils/           # Helper functions
├── locales/         # uk/, en/ translations
└── assets/          # sass/, images/, icons/
```

## Key Files

- Router: `src/routes/app-router/AppRouter.tsx`
- Auth: `src/contexts/admin/admin-context-provider/AdminContextProvider.tsx`
- API Config: `src/const/common/api-routes/main-api.ts`
- TypeScript: `tsconfig.json` (path alias `@/*` → `src/*`)

## Multilingual Content

All admin forms support Ukrainian (uk) and English (en):
```typescript
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit';

const { currentLocale, switchLocale } = useLocalizationToolkit();

// Field name: `title.${currentLocale}` becomes 'title.uk' or 'title.en'
```

## Common Commands

```bash
npm start              # Dev server
npm test               # Jest watch
npm run test:cover     # Coverage report
npm run lint           # ESLint check
npm run build          # Production build
```

## Error Handling Pattern

```typescript
import { useToast } from '@/contexts/admin/toast-context-provider';

const { showToast } = useToast();

try {
  await apiCall();
  showToast('Success!', 'success');
} catch (error) {
  showToast('Error occurred', 'error');
}
```

## Domain Terms

- **Hippotherapy**: Therapeutic horseback riding
- **Program**: Therapeutic program (title, description, sections)
- **Program Section**: Content block (text-only, image layouts)
- **Team Member**: Staff profile (photo, bio, position, category)
- **Visibility Status**: Published (public) or Draft (admin-only)
- **Localization**: Multi-language content (uk/en)

## When to Use Agent Skills

For complex, specialized tasks, use these slash commands:
- `/victory-center-pr-review` - Full PR review workflow (smells, lint, tests, commits)
- `/victory-center-docs` - Project documentation
- `/victory-center-structure` - Find files/navigate codebase
- `/victory-center-api` - API endpoints and data fetching
- `/victory-center-components` - Component patterns
- `/victory-center-forms` - Forms and validation

## Additional Context

- See `CLAUDE.md` for concise project overview
- See `AGENTS.md` for detailed coding guidelines
- See `README.md` for setup instructions
- See `.github/skills/` for specialized Agent Skills

---

**Note**: These instructions are always active. Follow them for all code generation, suggestions, and assistance in this repository.
