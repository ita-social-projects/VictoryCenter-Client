# TS46: End-to-End Integration Tests

## Implements
**Business Stories**: BS11 - Admin Page Integration

## Technical Goal
Create comprehensive end-to-end tests for complete hippotherapy admin workflow across all sections.

## Acceptance Criteria
- [ ] Test complete workflow: login → navigate to hippotherapy page → edit sections → publish
- [ ] Test navigation between all 10 sections via tabs
- [ ] Test unsaved changes warning when switching sections
- [ ] Test "Publish All" button publishes all sections
- [ ] Test "Save Draft" button saves all sections as draft
- [ ] Test auto-save functionality after 2 minutes
- [ ] Test translation workflow for one section (open modal, edit, save)
- [ ] Test error handling (network failures, validation errors)
- [ ] Test authentication expiration and token refresh
- [ ] Test page reload preserves data (draft auto-save)
- [ ] Test responsive design on mobile viewport
- [ ] Test accessibility (keyboard navigation, screen reader)

## Implementation Details

### Files to Create
- `e2e/hippotherapy-admin.spec.ts` (Playwright or Cypress)

### Code Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Hippotherapy Admin E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin-panel/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to hippotherapy page
    await page.goto('/admin-panel/hippotherapy');
  });

  test('should navigate between all sections', async ({ page }) => {
    const sections = [
      'Title',
      'What Is Hippotherapy',
      'Testimonials',
      'What Is Ipoventia',
      'Center of Ipoventia',
      'Why This Approach',
      'Who Programs Suit',
      'Scientific Research',
      'Principles',
    ];

    for (const section of sections) {
      await page.click(`text=${section}`);
      await expect(page.locator(`[role="tabpanel"][aria-labelledby*="${section}"]`)).toBeVisible();
    }
  });

  test('should edit and publish title section', async ({ page }) => {
    // Edit title section
    await page.fill('[name="heading"]', 'Updated Title Heading');
    await page.fill('[name="description"]', 'Updated description text');
    
    // Upload image
    await page.setInputFiles('[name="image"]', 'test-fixtures/test-image.jpg');
    
    // Publish
    await page.click('button:has-text("Publish")');
    
    // Verify success toast
    await expect(page.locator('text=Successfully published')).toBeVisible();
  });

  test('should show unsaved changes warning', async ({ page }) => {
    // Edit title section
    await page.fill('[name="heading"]', 'Unsaved Heading');
    
    // Try to switch section
    await page.click('text=Testimonials');
    
    // Verify warning modal
    await expect(page.locator('text=Unsaved changes')).toBeVisible();
  });

  test('should publish all sections', async ({ page }) => {
    await page.click('button:has-text("Publish All")');
    
    // Verify success
    await expect(page.locator('text=All sections published')).toBeVisible();
  });

  test('should auto-save after 2 minutes', async ({ page }) => {
    // Edit section
    await page.fill('[name="heading"]', 'Auto-save Test');
    
    // Wait 2 minutes
    await page.waitForTimeout(120000);
    
    // Verify auto-save toast
    await expect(page.locator('text=Auto-saved')).toBeVisible();
  });

  test('should open translation modal', async ({ page }) => {
    // Click translation icon for English
    await page.click('[aria-label*="English translation"]');
    
    // Verify modal opens
    await expect(page.locator('text=Translation')).toBeVisible();
    
    // Edit translation
    await page.fill('[name="heading"]', 'English Heading');
    
    // Save translation
    await page.click('button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=Translation saved')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true);
    
    // Try to publish
    await page.click('button:has-text("Publish")');
    
    // Verify error toast
    await expect(page.locator('text=Network error')).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Enter to open translation modal
    await page.keyboard.press('Enter');
    
    // Escape to close modal
    await page.keyboard.press('Escape');
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify responsive layout
    await expect(page.locator('[role="tablist"]')).toBeVisible();
  });
});
```

## Test Cases

### E2E Test Scenarios (12 scenarios)
1. Complete workflow: login → edit → publish
2. Navigate between all 10 sections
3. Unsaved changes warning
4. Publish All functionality
5. Save Draft functionality
6. Auto-save after 2 minutes
7. Translation modal workflow
8. Error handling (network, validation)
9. Token refresh on expiration
10. Page reload with auto-saved data
11. Keyboard accessibility
12. Responsive design on mobile

## Dependencies
- TS20: HippotherapyAdminPage (must complete first)
- TS21: useHippotherapyAdmin hook (must complete first)
- All section components (TS08-TS14, TS18-TS19)

## Estimated Effort

**6 hours**

- E2E test setup: 1 hour
- Test implementation: 4 hours
- Debugging and stabilization: 1 hour

## Technical Notes

### Patterns to Follow
- Use Playwright for E2E tests (if already in project) or Cypress
- Use test fixtures for images and data
- Mock external API calls if needed
- Run tests in isolation (clean database state)
- Use stable selectors (data-testid, ARIA labels)

### Risks and Mitigation
- **Risk**: E2E tests are slow and flaky
  - **Mitigation**: Use parallelization, stable selectors, explicit waits
- **Risk**: Auto-save test takes 2 minutes
  - **Mitigation**: Mock timer or reduce timeout in test environment
- **Risk**: Image uploads in CI/CD
  - **Mitigation**: Use small test fixtures, mock file system

### Test Environment
- Use test database with seed data
- Use test JWT tokens with long expiration
- Mock backend API if needed for faster tests
- Clean up test data after each test

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All 12 E2E scenarios passing
- [ ] Tests run in CI/CD pipeline
- [ ] Tests are stable (no flakiness)
- [ ] Test execution time <10 minutes total
- [ ] Code reviewed and approved
- [ ] Documentation updated with test instructions
