# TS25: Page Routing and Navigation

## Implements
**Business Stories**: BS11 - Admin Page Integration

## Technical Goal
Configure routing for hippotherapy admin page with authentication protection and navigation integration.

## Acceptance Criteria
- [ ] Route configured at `/admin-panel/hippotherapy`
- [ ] Route protected with PrivateRoute component (JWT auth)
- [ ] Route accessible from admin panel navigation menu
- [ ] Breadcrumb navigation displays correctly
- [ ] Route supports deep linking to specific sections (optional)
- [ ] Route handles 404 for invalid section IDs
- [ ] Route redirects to login if not authenticated

## Implementation Details

### Files to Modify
- `src/routes/app-router/AppRouter.tsx` - Add hippotherapy route
- `src/components/admin/common/admin-navigation/AdminNavigation.tsx` - Add menu item
- `src/locales/[uk|en]/adminNavigation.json` - Add navigation labels

### Code Example

**AppRouter.tsx**:
```typescript
import { HippotherapyAdminPage } from '@/pages/admin/hippotherapy';

// In admin routes section
<Route
  path="/admin-panel/hippotherapy"
  element={
    <PrivateRoute>
      <HippotherapyAdminPage />
    </PrivateRoute>
  }
/>
```

**AdminNavigation.tsx**:
```typescript
import HippotherapyIcon from '@mui/icons-material/Accessible';

const navigationItems = [
  // ... existing items
  {
    label: t('adminNavigation.hippotherapy'),
    path: '/admin-panel/hippotherapy',
    icon: <HippotherapyIcon />,
  },
];
```

## Test Cases

### Integration Tests
- Test route requires authentication
- Test route renders HippotherapyAdminPage
- Test navigation menu item links to route
- Test breadcrumbs display correct path

## Dependencies
- TS20: HippotherapyAdminPage (must complete first)

## Estimated Effort
**2 hours**

## Definition of Done
- [ ] Route configured and protected
- [ ] Navigation menu item added
- [ ] Tests passing
