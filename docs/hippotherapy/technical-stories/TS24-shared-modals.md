# TS24: Shared Modals (Toast, etc.)

## Implements
**Business Stories**: BS01-BS11 (all stories)

## Technical Goal
Configure and integrate toast notification system for success/error feedback across all hippotherapy admin operations.

## Acceptance Criteria
- [ ] Toast notifications for save success/error
- [ ] Toast notifications for publish success/error
- [ ] Toast notifications for delete success/error
- [ ] Toast notifications for validation errors
- [ ] Toast notifications for image upload success/error
- [ ] Toast auto-dismiss after 5 seconds
- [ ] Toast manual dismiss option
- [ ] Toast stack multiple notifications
- [ ] Toast positioned top-right (or configurable)
- [ ] Toast supports different severity levels (success, error, warning, info)

## Implementation Details

### Files to Modify
- Integrate existing ToastContext from `src/contexts/admin/toast-context-provider`
- Add hippotherapy-specific toast messages to i18n files

### Code Example

```typescript
// Usage in components
import { useToast } from '@/contexts/admin/toast-context-provider';

const { showToast } = useToast();

// Success
showToast(t('hippotherapyAdmin.toast.saveSuccess'), 'success');

// Error
showToast(t('hippotherapyAdmin.toast.saveError'), 'error');

// Warning
showToast(t('hippotherapyAdmin.toast.unsavedChanges'), 'warning');

// Info
showToast(t('hippotherapyAdmin.toast.autoSaved'), 'info');
```

## Test Cases

### Integration Tests
- Test toast displays on save success
- Test toast displays on save error
- Test toast auto-dismisses after timeout
- Test multiple toasts stack correctly

## Dependencies
- Existing ToastContext (already in codebase)

## Estimated Effort
**4 hours** (primarily i18n integration and testing)

## Definition of Done
- [ ] Toast messages defined in i18n
- [ ] Toast integration tested in all forms
- [ ] Tests passing
