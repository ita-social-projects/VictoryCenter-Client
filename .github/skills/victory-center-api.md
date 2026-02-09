---
name: victory-center-api
description: Help with Victory Center API endpoints, services, authentication, and data fetching patterns
invoked-by: both
tools:
  - read
  - search
---

# Victory Center API Skill

This skill helps you work with the Victory Center API services, endpoints, and data fetching.

## What This Skill Does

Helps you:
- Find API service files
- Understand API endpoint structure
- Learn authentication patterns
- Implement data fetching
- Handle API errors
- Add new API endpoints

## How to Use

**User invocation**: `/victory-center-api [query]`

**Examples**:
- `/victory-center-api how to call admin programs endpoint?`
- `/victory-center-api show me authentication pattern`
- `/victory-center-api how to add a new API service?`
- `/victory-center-api what endpoints are available for FAQ?`

## Instructions

When this skill is invoked:

1. **Identify the Need**:
   - Finding existing endpoint
   - Understanding authentication
   - Adding new endpoint
   - Implementing data fetching
   - Error handling

2. **Read Relevant Files**:

   **API Configuration**:
   - [src/const/common/api-routes/main-api.ts](src/const/common/api-routes/main-api.ts) - All endpoint definitions

   **Admin Services** (requires auth):
   - [src/services/api/admin/programs/](src/services/api/admin/programs/) - Programs CRUD
   - [src/services/api/admin/team/team-members/](src/services/api/admin/team/team-members/) - Team members
   - [src/services/api/admin/faq/](src/services/api/admin/faq/) - FAQ management
   - [src/services/api/admin/image/](src/services/api/admin/image/) - Image uploads
   - [src/services/api/admin/login/](src/services/api/admin/login/) - Authentication

   **Public Services** (no auth):
   - [src/services/api/public/programs/](src/services/api/public/programs/) - Published programs
   - [src/services/api/public/team/](src/services/api/public/team/) - Published team
   - [src/services/api/public/faq/](src/services/api/public/faq/) - Published FAQ

   **Authentication**:
   - [src/contexts/admin/admin-context-provider/AdminContextProvider.tsx](src/contexts/admin/admin-context-provider/AdminContextProvider.tsx) - Auth context
   - [src/hooks/admin/use-admin-client/](src/hooks/admin/use-admin-client/) - Authenticated axios client
   - [src/services/auth/](src/services/auth/) - Auth utilities

3. **Provide Examples**:

   **For Authentication Queries**:
   ```typescript
   import { useAdminClient } from '@/hooks/admin/use-admin-client';

   const MyComponent = () => {
     const { adminClient, isAuthenticated } = useAdminClient();

     const fetchData = async () => {
       // adminClient automatically includes JWT token
       const response = await adminClient.get('/admin/programs');
       return response.data;
     };
   };
   ```

   **For Public API**:
   ```typescript
   import { getPublicPrograms } from '@/services/api/public/programs';
   import { useDataFetch } from '@/hooks/common/use-data-fetch';

   const { data, loading, error } = useDataFetch(() => getPublicPrograms());
   ```

   **For Adding New Endpoint**:
   ```typescript
   // 1. Add endpoint to src/const/common/api-routes/main-api.ts
   export const API_ROUTES = {
     NEW_RESOURCE: '/admin/new-resource',
   };

   // 2. Create service file src/services/api/admin/new-resource/new-resource-api.ts
   import { AxiosInstance } from 'axios';
   import { API_ROUTES } from '@/const/common/api-routes/main-api';

   export const getNewResources = async (client: AxiosInstance) => {
     const response = await client.get(API_ROUTES.NEW_RESOURCE);
     return response.data;
   };

   // 3. Use in component
   const { adminClient } = useAdminClient();
   const data = await getNewResources(adminClient);
   ```

4. **Show Related Files**:
   - Link to relevant API service files
   - Show corresponding types in `src/types/`
   - Show related hooks in `src/hooks/`

## API Architecture

### Base Configuration
- **Base URL**: `REACT_APP_BACKEND_URL` from .env
- **Development**: `/api` (proxied to backend)
- **Production**: `https://backend.victorycenter.online/api`

### Authentication Flow
1. User logs in via `/auth/login`
2. JWT tokens stored in localStorage
3. AdminContextProvider manages auth state
4. `adminClient` from `useAdminClient()` includes Bearer token
5. Automatic token refresh before expiration

### Admin Endpoints (Require JWT)
- `/admin/programs` - Program CRUD
- `/admin/team-members` - Team member CRUD
- `/admin/faq` - FAQ CRUD
- `/admin/images` - Image uploads
- `/admin/bank-details` - Donation info
- `/admin/partners` - Partner management

### Public Endpoints (No Auth)
- `/programs` - Published programs only
- `/programs/:slug` - Program by slug
- `/team` - Published team members
- `/faq` - Published FAQ items
- `/donate` - Donation information
- `/partners` - Public partners

## Common Patterns

### Data Fetching Hook
```typescript
import { useDataFetch } from '@/hooks/common/use-data-fetch';

const { data, loading, error } = useDataFetch(fetchFunction);
```

### Paginated Fetching
```typescript
import { useDataPaginationFetch } from '@/hooks/admin/fetch/use-data-pagination-fetch';

const { data, loading, hasMore, loadMore } = useDataPaginationFetch(
  (params) => getPrograms(adminClient, params),
  { limit: 20 }
);
```

### Error Handling
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

## Output Format

```markdown
## [Query Summary]

### Relevant Endpoint

**Endpoint**: `[METHOD] [path]`
**Authentication**: [Required/Not Required]
**Location**: [service-file-path](path/to/service.ts)

### Code Example

\`\`\`typescript
[Example code]
\`\`\`

### Related Files

- Types: [type-file](path/to/types.ts)
- Hook: [hook-file](path/to/hook.ts)
- Component usage: [component-file](path/to/component.tsx)

### Notes

[Any important notes about authentication, pagination, error handling, etc.]
```

## Key Points

- Always use `adminClient` from `useAdminClient()` for admin endpoints
- Never make authenticated calls with plain axios
- Public endpoints don't need authentication
- All admin endpoints return 401 if token is invalid/expired
- Token refresh is automatic via interceptors
- Use toast notifications for user feedback
- Type all API responses with TypeScript interfaces
- This skill uses Copilot's read and search tools
