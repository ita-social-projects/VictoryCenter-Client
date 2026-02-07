---
name: victory-center-structure
description: Navigate and explore the Victory Center codebase structure, find files, and understand directory organization
invoked-by: both
allowed-tools:
  - Glob
  - Read
  - Grep
  - Bash
---

# Victory Center Structure Navigation Skill

This skill helps you navigate and understand the Victory Center codebase structure.

## What This Skill Does

Helps you:
- Find files by pattern or name
- Understand directory organization
- Locate components, pages, hooks, services
- Explore related files (component + styles + tests)
- Map feature to file locations

## How to Use

**User invocation**: `/victory-center-structure [query]`

**Examples**:
- `/victory-center-structure find all program components`
- `/victory-center-structure where are the admin forms?`
- `/victory-center-structure show me the FAQ page structure`
- `/victory-center-structure find rich text editor plugins`

## Instructions

When this skill is invoked:

1. **Parse the Query**:
   - Identify what the user is looking for (component, page, hook, service, etc.)
   - Identify keywords (program, team, faq, admin, public, etc.)

2. **Search Strategy**:

   **For Components**:
   - Admin components: `src/components/admin/**/*.tsx`
   - Public components: `src/components/public/**/*.tsx`
   - Common components: `src/components/common/**/*.tsx`

   **For Pages**:
   - Admin pages: `src/pages/admin/**/*.tsx`
   - Public pages: `src/pages/public/**/*.tsx`

   **For Hooks**:
   - Admin hooks: `src/hooks/admin/**/*.ts`
   - Common hooks: `src/hooks/common/**/*.ts`

   **For Services**:
   - Admin API: `src/services/api/admin/**/*.ts`
   - Public API: `src/services/api/public/**/*.ts`

   **For Types**:
   - Admin types: `src/types/admin/**/*.ts`
   - Public types: `src/types/public/**/*.ts`
   - Common types: `src/types/common/**/*.ts`

   **For Validation**:
   - Schemas: `src/validation/admin/**/*.ts`

   **For Translations**:
   - English: `src/locales/en/**/*.json`
   - Ukrainian: `src/locales/uk/**/*.json`

3. **Use Appropriate Tools**:
   - Use `Glob` for pattern-based file searches
   - Use `Grep` to search file contents for specific terms
   - Use `Read` to examine directory index files
   - Use `ls` via Bash to show directory contents

4. **Provide Organized Results**:
   - Group files by category (components, pages, hooks, etc.)
   - Show file paths as clickable markdown links
   - Indicate file relationships (component + test + styles)
   - Show directory tree when helpful

5. **Offer Context**:
   - Briefly explain what each file/directory is for
   - Suggest related files to explore
   - Mention if files follow specific patterns

## Directory Reference

```
src/
├── components/       # UI components
│   ├── admin/       # Admin-only (forms, editors, modals)
│   ├── public/      # Public site (header, footer, FAQ)
│   └── common/      # Shared (loaders, modals)
├── pages/           # Page components
│   ├── admin/       # Admin pages (programs, team, FAQ)
│   └── public/      # Public pages (about-us, programs)
├── hooks/           # Custom hooks
│   ├── admin/       # Admin hooks (useFormManager, useAdminClient)
│   └── common/      # Shared hooks (useDataFetch)
├── contexts/        # React contexts (auth, toast)
├── services/        # API services
│   └── api/
│       ├── admin/   # Admin endpoints
│       └── public/  # Public endpoints
├── types/           # TypeScript types
├── validation/      # Yup schemas
├── const/           # Constants & config
├── utils/           # Helper functions
├── locales/         # i18n (uk/, en/)
├── assets/          # Static assets
└── routes/          # Router config
```

## Output Format

```markdown
## Found: [Query Summary]

### [Category 1] ([count] files)

- [ComponentName.tsx](src/path/to/ComponentName.tsx) - [brief description]
- [ComponentName.test.tsx](src/path/to/ComponentName.test.tsx) - Tests
- [ComponentName.module.scss](src/path/to/ComponentName.module.scss) - Styles

### [Category 2] ([count] files)

...

### Related Files

[Suggest related files that might be relevant]

### Notes

[Any patterns or conventions noticed]
```

## Common Patterns

- **Component files**: `ComponentName.tsx`, `ComponentName.test.tsx`, `ComponentName.module.scss`
- **Index files**: `index.ts` for re-exports
- **Admin pages**: Usually have `components/` subdirectory with page-specific components
- **API services**: Named after the resource (e.g., `programs-api.ts`, `team-members-api.ts`)
- **Types**: Match service names (e.g., `programs.ts`, `team-members.ts`)
- **Validation**: Named `[resource]-schema/` with index.ts

## Tips

- Use path alias `@/*` which maps to `src/*`
- Related files are usually in the same directory
- Check `index.ts` files for exported components
- Admin features are JWT-protected
- Public features work without authentication
