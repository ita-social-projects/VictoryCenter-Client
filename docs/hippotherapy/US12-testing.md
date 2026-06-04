# US12: Comprehensive Testing

## User Story
**As a** developer  
**I want** comprehensive test coverage for all Hippotherapy components  
**So that** the feature is reliable, maintainable, and meets quality standards

## Acceptance Criteria
- [ ] Line coverage ≥93% (project standard)
- [ ] Branch coverage ≥87% (project standard)
- [ ] All utility functions have unit tests
- [ ] All shared components have component tests
- [ ] All section components have component tests
- [ ] Integration tests for main page
- [ ] Translation system has tests
- [ ] API service mocks are in place
- [ ] All tests pass in CI/CD pipeline
- [ ] No ESLint warnings

## Test Categories

### 1. Unit Tests (Utilities)
**Location**: `src/utils/functions/admin/hippotherapy/`

**Files**:
- `space-management.test.ts`
- `validation-helpers.test.ts`

**Coverage**: 100% for utility functions

**Test Cases**:
- Space management: trim, prevent leading space, collapse multiple spaces
- Image validation: size, format, dimensions
- Character counter: formatting, remaining chars calculation

### 2. Component Tests (Shared Components)
**Location**: `src/components/admin/hippotherapy/shared/*/`

**Files**:
- `TextInputField.test.tsx`
- `ImageUploadField.test.tsx`
- `PublishButton.test.tsx`
- `ConfirmationModal.test.tsx`

**Test Cases per Component**:
- Renders with props
- User interactions (click, type, blur, focus)
- State changes (dirty, error, loading)
- Validation triggers
- Character counter updates
- Clear icon behavior
- Image upload/delete flow
- Button enable/disable states

### 3. Component Tests (Section Components)
**Location**: `src/components/admin/hippotherapy/sections/*/`

**Files** (10 sections):
- `TitleSection.test.tsx`
- `WhatIsHippotherapySection.test.tsx`
- `TestimonialsSection.test.tsx`
- `WhatIsIpoventiaSection.test.tsx`
- `CenterOfIpoventiaSection.test.tsx`
- `WhyThisApproachSection.test.tsx`
- `WhatTheApproachShowsSection.test.tsx`
- `ScientificReferencesSection.test.tsx`
- `WhoProgramsSuitSection.test.tsx`
- `PrinciplesSection.test.tsx`

**Common Test Cases**:
- Renders with section data
- Calls onChange handlers
- Displays validation errors
- TextInputField integration
- ImageUploadField integration (where applicable)

### 4. Component Tests (Translation System)
**Location**: `src/components/admin/hippotherapy/translation/*/`

**Files**:
- `TranslationIcon.test.tsx`
- Each modal variant test file (8 files)

**Test Cases**:
- TranslationIcon disabled when Ukrainian not published
- TranslationIcon shows correct state (add vs edit)
- Modal opens/closes correctly
- Modal validation works
- Modal save triggers API call
- Close confirmation when unsaved changes

### 5. Hook Tests
**Location**: `src/hooks/admin/hippotherapy/`

**Files**:
- `useHippotherapyAdmin.test.tsx`
- `useTranslationGate.test.tsx`
- `useTranslationModal.test.tsx`

**Test Cases**:
- Data fetching on mount
- Field change handling
- Image upload/delete
- Publish flow
- Dirty state tracking
- Validation state
- Translation gate logic
- Translation modal state

### 6. Integration Tests
**Location**: `src/pages/admin/hippotherapy/`

**File**: `HippotherapyAdminPage.test.tsx`

**Test Cases**:
- Page loads and fetches data
- All sections render
- Form submission works
- Publish confirmation modal
- Success/error toasts
- Translation icons render
- Loading state
- Error state handling

## Testing Patterns

### Mocking Strategy
```typescript
// Mock API services
jest.mock('@/services/api/admin/hippotherapy-admin-service');

// Mock hooks
jest.mock('@/hooks/admin/use-admin-client');
jest.mock('@/hooks/admin/use-toast');

// Mock form manager
jest.mock('@/hooks/admin/use-form-manager');
```

### Example Component Test
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TitleSection } from './TitleSection';

describe('TitleSection', () => {
  const mockProps = {
    heading: 'Test Heading',
    description: 'Test Description',
    image: { url: '/test.jpg', isDefault: false },
    onHeadingChange: jest.fn(),
    onDescriptionChange: jest.fn(),
    onImageUpload: jest.fn(),
    onImageDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with all fields', () => {
    render(<TitleSection {...mockProps} />);
    
    expect(screen.getByLabelText('Заголовок')).toBeInTheDocument();
    expect(screen.getByLabelText('Опис')).toBeInTheDocument();
    expect(screen.getByAltText('Головне зображення')).toBeInTheDocument();
  });

  it('calls onHeadingChange when heading changes', async () => {
    render(<TitleSection {...mockProps} />);
    
    const input = screen.getByLabelText('Заголовок');
    await userEvent.clear(input);
    await userEvent.type(input, 'New Heading');
    
    expect(mockProps.onHeadingChange).toHaveBeenCalledWith('New Heading');
  });

  it('displays validation error', () => {
    render(<TitleSection {...mockProps} headingError="Поле обов'язкове" />);
    
    expect(screen.getByText("Поле обов'язкове")).toBeInTheDocument();
  });
});
```

### Example Integration Test
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { HippotherapyAdminPage } from './HippotherapyAdminPage';
import * as hippotherapyService from '@/services/api/admin/hippotherapy-admin-service';

jest.mock('@/services/api/admin/hippotherapy-admin-service');

describe('HippotherapyAdminPage', () => {
  const mockData = {
    title: { heading: 'Test', description: 'Test desc', image: { url: null, isDefault: true } },
    // ... other sections
  };

  beforeEach(() => {
    (hippotherapyService.getHippotherapyData as jest.Mock).mockResolvedValue(mockData);
  });

  it('loads and displays data', async () => {
    render(<HippotherapyAdminPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Іпотерапія')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<HippotherapyAdminPage />);
    
    expect(screen.getByText('Завантаження...')).toBeInTheDocument();
  });

  it('enables publish button after changes', async () => {
    render(<HippotherapyAdminPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Опублікувати')).toBeDisabled();
    });

    // Make a change
    const input = screen.getByLabelText('Заголовок');
    await userEvent.type(input, 'Changed');

    await waitFor(() => {
      expect(screen.getByText('Опублікувати')).toBeEnabled();
    });
  });
});
```

## Test Utilities

### Custom Render with Providers
```typescript
// src/test-utils/render-with-providers.tsx
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

export const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};
```

### Mock Data Factories
```typescript
// src/test-utils/hippotherapy-mock-factory.ts
export const createMockHippotherapyData = (overrides?: Partial<HippotherapyData>) => {
  return {
    title: { heading: 'Test', description: 'Test', image: { url: null, isDefault: true } },
    whatIsHippotherapy: { heading: 'Test', description: 'Test' },
    // ... all sections with defaults
    ...overrides
  };
};
```

## Dependencies
- All US01-US11 (components must exist to test)

## Estimated Effort
**15 hours**
- Utility tests: 2 hours
- Shared component tests: 4 hours
- Section component tests: 5 hours
- Translation system tests: 2 hours
- Hook tests: 1 hour
- Integration tests: 1 hour

## Coverage Report Commands
```bash
# Run tests with coverage
npm run test:cover

# Generate coverage report
npm run test:cover -- --coverage --coverageDirectory=coverage

# View coverage thresholds
# Expected: ≥93.5% lines, ≥86.9% branches
```

## Continuous Testing
- Run tests in watch mode during development: `npm test`
- Fix tests as components are built
- Aim for >90% coverage per component before moving on

## Definition of Done
- All test files created
- Line coverage ≥93%
- Branch coverage ≥87%
- All tests pass locally
- All tests pass in CI/CD
- Coverage report reviewed
- No skipped or disabled tests without justification
- Code review completed
- Test documentation updated
