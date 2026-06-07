# TS30: Title Section Integration Tests

## Implements
**Business Stories**: BS01 - Title Section Content Management

## Technical Goal
Create comprehensive integration tests for Title Section component, ensuring form submission, validation, image upload, and publish workflows work end-to-end.

## Acceptance Criteria
- [ ] Test form renders with all fields
- [ ] Test form pre-fills with existing data
- [ ] Test heading field validation (required, max length)
- [ ] Test description field validation (required, max length)
- [ ] Test image upload validation (required, type, size)
- [ ] Test image cropping workflow
- [ ] Test form submission with valid data
- [ ] Test form submission with invalid data shows errors
- [ ] Test publish button triggers publish API call
- [ ] Test save draft button triggers draft API call
- [ ] Test toast notifications on success/error
- [ ] Test translation gate integration
- [ ] Test translation modal opens on icon click
- [ ] Test unsaved changes warning on navigation

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/sections/title-section/TitleSection.test.tsx`

### Code Example

```typescript
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TitleSection } from './TitleSection';
import { HippotherapyAdminService } from '@/services/api/admin/hippotherapy-admin-service';

jest.mock('@/services/api/admin/hippotherapy-admin-service');

describe('TitleSection Integration Tests', () => {
  it('renders form with all fields', () => {
    render(<TitleSection data={mockData} />);
    
    expect(screen.getByLabelText('Heading')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Image')).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(<TitleSection data={null} />);
    
    const submitButton = screen.getByRole('button', { name: /publish/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Heading is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Image is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockUpdate = jest.fn();
    HippotherapyAdminService.prototype.updateTitleSection = mockUpdate;
    
    render(<TitleSection data={null} />);
    
    await userEvent.type(screen.getByLabelText('Heading'), 'Test Heading');
    await userEvent.type(screen.getByLabelText('Description'), 'Test Description');
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const imageInput = screen.getByLabelText('Image');
    await userEvent.upload(imageInput, file);
    
    const submitButton = screen.getByRole('button', { name: /publish/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          heading: 'Test Heading',
          description: 'Test Description',
        }),
        true
      );
    });
  });

  it('shows toast notification on save success', async () => {
    // Test implementation
  });

  it('shows toast notification on save error', async () => {
    // Test implementation
  });

  it('opens translation modal on icon click', async () => {
    // Test implementation
  });
});
```

## Test Cases

### Integration Tests (14 test cases)
1. Form renders with all fields
2. Form pre-fills with existing data
3. Heading validation (required, max 200)
4. Description validation (required, max 1000)
5. Image validation (required, type, size)
6. Image cropping workflow
7. Form submission with valid data
8. Form submission with invalid data
9. Publish button triggers API call
10. Draft button triggers API call
11. Success toast on save
12. Error toast on failure
13. Translation modal opens
14. Unsaved changes warning

## Dependencies
- TS08: TitleSection component (must complete first)
- TS22: API Service (must complete first)

## Estimated Effort
**3 hours**

- Test setup and mocks: 1 hour
- Test implementation: 1.5 hours
- Debugging and fixes: 0.5 hours

## Definition of Done
- [ ] All 14 integration tests passing
- [ ] Test coverage >90% for TitleSection
- [ ] Code reviewed and approved
- [ ] No flaky tests
