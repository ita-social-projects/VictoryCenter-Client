# Victory Center

**A React-based hippotherapy/rehabilitation center management platform with public site and admin CMS.**

---

## Project Overview

This is the **frontend-only** SPA for Victory Center - a dual-purpose application:
- **Public Site**: Browse programs, team, donation info (multilingual: Ukrainian/English)
- **Admin Panel**: JWT-authenticated CMS for content management

**Live Backend**: https://backend.victorycenter.online/api

---

## Tech Stack

- **Framework**: React 19.1.0 + TypeScript 5.9.3
- **Router**: React Router DOM 7.5.3
- **UI Library**: Material-UI 7.3.1 + Emotion CSS-in-JS
- **Forms**: React Hook Form 7.60.0 + Yup 1.6.1
- **Rich Text**: Lexical 0.39.0 (Meta's editor)
- **i18n**: i18next 25.5.3 (Ukrainian default, English)
- **HTTP**: Axios 1.10.0
- **Build**: Create React App + Craco
- **Testing**: Jest 29 + React Testing Library
- **Node**: 20+

---

## Project Structure

```
src/
├── components/        # React components
│   ├── admin/        # Admin-only (rich text editor, image cropper, forms)
│   ├── public/       # Public site (header, footer, FAQ)
│   └── common/       # Shared (loaders, modals, templates)
├── pages/            # Page components
│   ├── admin/        # Admin pages (programs, team, FAQ, donate, partners)
│   └── public/       # Public pages (about-us, programs, team, donate)
├── hooks/            # Custom React hooks
│   ├── admin/        # Admin hooks (useAdminClient, useFormManager)
│   └── common/       # Shared hooks (useDataFetch, useGetLocalization)
├── contexts/         # React contexts
│   └── admin/        # AdminContext (auth), ToastContext, VisitorPagesContext
├── services/api/     # API services
│   ├── admin/        # Admin API (programs, team, FAQ, images, donate)
│   └── public/       # Public API (read-only published content)
├── types/            # TypeScript types
├── validation/       # Yup schemas
│   └── admin/        # Form validation schemas
├── const/            # Constants
│   ├── admin/        # Admin constants
│   ├── common/       # API routes, shared constants
│   └── public/       # Public constants
├── utils/            # Utilities
│   └── functions/    # Helpers (mappers, formatters, localization)
├── locales/          # i18n translations (uk/, en/)
├── assets/           # Static assets (images, icons, sass)
└── routes/           # Router configuration
```

---

## Key Commands

```bash
# Development
npm start                 # Dev server (HTTP)
npm run start-with-cert   # Dev server (HTTPS with auto SSL cert)

# Testing
npm test                  # Jest watch mode
npm run test:cover        # Coverage report (thresholds: 93.5% lines, 86.9% branches)

# Quality
npm run lint              # ESLint (max 10 warnings allowed)
npm run lint:fix          # Auto-fix lint issues
npm run format            # Prettier formatting

# Production
npm run build             # Production build → /build
```

---

## Important Patterns

### Path Aliases
Use `@/*` instead of relative paths:
```typescript
import { Button } from '@/components/admin/button';  // ✅ Good
import { Button } from '../../../components/admin/button';  // ❌ Avoid
```

### Authentication Flow
1. Login via [AdminContextProvider](src/contexts/admin/admin-context-provider/AdminContextProvider.tsx)
2. JWT stored in localStorage
3. Use `useAdminClient()` hook for authenticated API calls
4. Auto token refresh on expiration

### API Calls
```typescript
// Public data (no auth)
import { getPublicPrograms } from '@/services/api/public/programs';

// Admin data (requires auth)
const { adminClient } = useAdminClient();
await adminClient.post('/admin/programs', data);
```

### Forms & Validation
```typescript
import { useFormManager } from '@/hooks/admin/use-form-manager';
import { programSchema } from '@/validation/admin/program-schema';

const { register, handleSubmit, formState: { errors } } = useFormManager({
  schema: programSchema,
  defaultValues: initialData
});
```

### Toast Notifications
```typescript
import { useToast } from '@/contexts/admin/toast-context-provider';

const { showToast } = useToast();
showToast('Success!', 'success');  // Types: success, error, info, warning
```

### Internationalization
```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation('programsPage');
return <h1>{t('title')}</h1>;  // Reads from locales/[uk|en]/programsPage.json
```

---

## Routing

**Language-based routing**:
- Ukrainian (default): `/*` (e.g., `/programs`)
- English: `/en/*` (e.g., `/en/programs`)

**Public routes**: `/`, `/programs`, `/programs/:slug`, `/team`, `/donate`, `/partners`, `/reports`

**Admin routes** (JWT-protected): `/admin-panel/*`
- Login: `/admin-panel/login`
- Pages: `/admin-panel/programs`, `/admin-panel/team`, `/admin-panel/faq`, `/admin-panel/donate`, `/admin-panel/partners`, `/admin-panel/who-we-are`

**Route guards**:
- [PrivateRoute](src/components/admin/private-route/) - Redirects to login if not authenticated
- [PublicRoute](src/components/admin/public-route/) - Redirects to admin if authenticated

---

## Key Features

### Admin Panel
- **Programs**: CRUD, categorization, rich text descriptions, drag-to-reorder, multilingual
- **Team**: Member profiles, categories, drag-to-reorder, multilingual
- **FAQ**: Q&A management, page assignment (which pages show which FAQs)
- **Donate**: Bank details (UAH + foreign), correspondent banks, support options
- **Partners**: Partner info and branding
- **Who We Are**: Custom content section editor
- **Rich Text Editor**: Lexical-based with plugins (MaxLength, Focus, Toolbar, EnterKey)
- **Image Management**: Upload, crop, validate dimensions

### Public Site
- Browse programs (published only)
- View team members
- FAQ sections per page
- Donation information (bank details, payment methods)
- Partner showcase
- Multilingual (UK/EN)

---

## Coding Conventions

### Component Structure
```typescript
// Standard component file structure
import React from 'react';
import styles from './ComponentName.module.scss';

interface ComponentNameProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentNameProps> = ({ props }) => {
  // Component logic
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};
```

### Naming Conventions
- **Components**: PascalCase (`TeamMemberCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useDataFetch.ts`)
- **Types**: PascalCase (`ProgramCreateUpdate`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CHARACTER_LIMIT`)
- **Utilities**: camelCase (`getCroppedImageBase64`)
- **SASS modules**: kebab-case (`component-name.module.scss`)

### File Organization
- One component per file
- Co-locate tests: `ComponentName.test.tsx` alongside `ComponentName.tsx`
- Index files for re-exports: `index.ts`
- Keep related files together (component + styles + tests)

### Import Order
1. React/external libraries
2. Internal components (via `@/*` alias)
3. Hooks
4. Types
5. Styles
6. Assets

---

## Domain Terminology

- **Hippotherapy**: Therapeutic horseback riding
- **Program**: A specific therapeutic program offered by Victory Center
- **Program Section**: Content block within a program (text-only, image variants)
- **Team Member**: Staff member profile
- **Category**: Organizational grouping (program categories, team categories)
- **Visitor Page**: Public-facing page (used for FAQ assignment)
- **Localization**: Multi-language content (UK/EN)
- **Visibility Status**: Published or Draft
- **Admin Client**: Authenticated Axios instance with JWT bearer token

---

## Testing

**Strategy**:
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for API services
- High coverage targets (93%+ lines)

**Test file location**: Alongside source files (e.g., `MyComponent.test.tsx`)

**Run tests**:
```bash
npm test              # Watch mode
npm run test:cover    # With coverage
```

**Mocks**: See `src/__mocks__/` and `src/jest/`

---

## Environment Variables

**Development** (`.env.development`):
```
HTTPS=true
SSL_KEY_FILE=certs/localhost-key.pem
SSL_CRT_FILE=certs/localhost-cert.pem
REACT_APP_BACKEND_URL=/api                              # Proxied to backend
REACT_APP_PROXY_TARGET=https://backend.victorycenter.online/api
```

**Production**:
```
REACT_APP_BACKEND_URL=https://backend.victorycenter.online/api
```

---

## Current Work

**Branch**: `fix-issues-with-reach-text`

**Recent focus**:
- Rich text editor (Lexical) improvements
- EnterKey plugin implementation
- Bug fixes in rich text input components

**File of interest**: [EnterKeyPlugin.tsx](src/components/admin/rich-text-input/plugins/EnterKeyPlugin.tsx)

---

## Architecture Notes

### Authentication
- JWT-based (access + refresh tokens)
- Stored in localStorage
- Auto-refresh before expiration
- Axios interceptors for token injection and retry logic
- See: [AdminContextProvider](src/contexts/admin/admin-context-provider/AdminContextProvider.tsx)

### State Management
- React Context for global state (Auth, Toast, Visitor Pages)
- React Hook Form for form state
- Custom hooks for shared logic
- No Redux/external state library

### Styling
- Emotion CSS-in-JS for MUI integration
- SASS modules for component styles
- Centralized variables: `src/assets/sass/variables/`
- Mixins: `src/assets/sass/mixins/`

### Data Flow
1. Public: Pages → Services → Backend API → Display
2. Admin: Pages → Forms → Validation → Services (with JWT) → Backend API → Toast feedback

---

## Quick Links

- [Contributing Guidelines](CONTRIBUTING.md)
- [Main Router](src/routes/app-router/AppRouter.tsx)
- [API Routes Config](src/const/common/api-routes/main-api.ts)
- [Admin Auth Context](src/contexts/admin/admin-context-provider/AdminContextProvider.tsx)

---

## Resources

- **Frontend Repo**: https://github.com/ita-social-projects/VictoryCenter-Client
- **Backend Repo**: https://github.com/ita-social-projects/VictoryCenter-Back
- **SoftServe Academy**: https://softserve.academy/

---

**Note**: This file should be updated when:
- New major features are added
- Project structure changes significantly
- New coding conventions are established
- Tech stack is upgraded

Tell Claude: "Update CLAUDE.md to reflect recent changes" after major refactors.
