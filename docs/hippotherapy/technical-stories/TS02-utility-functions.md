# TS02: Space Management and Validation Utilities

## Implements
**Business Story**: Foundation for BS01-BS11 (supports all text input validation)

## Technical Goal
Build pure utility functions for space management and client-side validation that can be reused across all hippotherapy sections.

## Acceptance Criteria
- [ ] All utilities are pure functions (no side effects)
- [ ] Space management functions handle edge cases
- [ ] Validation functions return clear boolean or error messages
- [ ] All functions have unit tests with 100% coverage
- [ ] Functions follow existing project utility patterns
- [ ] JSDoc documentation for all functions

## Implementation Details

### Files to Create
- `src/utils/functions/admin/hippotherapy/space-management.ts`
- `src/utils/functions/admin/hippotherapy/validation-helpers.ts`
- `src/utils/functions/admin/hippotherapy/space-management.test.ts`
- `src/utils/functions/admin/hippotherapy/validation-helpers.test.ts`

### Code Examples

**space-management.ts**
```typescript
/**
 * Removes leading and trailing spaces
 */
export const trimLeadingTrailingSpaces = (value: string): string => {
  return value.trim();
};

/**
 * Prevents space as first character
 */
export const preventLeadingSpace = (value: string): string => {
  return value.replace(/^\s+/, '');
};

/**
 * Replaces multiple consecutive spaces with single space
 */
export const collapseMultipleSpaces = (value: string): string => {
  return value.replace(/\s{2,}/g, ' ');
};

/**
 * Applies all space management rules
 */
export const cleanTextInput = (value: string): string => {
  let cleaned = preventLeadingSpace(value);
  cleaned = collapseMultipleSpaces(cleaned);
  return cleaned;
};

/**
 * Clean text on blur (trim edges)
 */
export const cleanTextOnBlur = (value: string): string => {
  return trimLeadingTrailingSpaces(value);
};
```

**validation-helpers.ts**
```typescript
import { VALIDATION_RULES } from '@/const/admin/hippotherapy/validation-rules';

/**
 * Validates image file format and size
 */
export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  const maxSizeBytes = VALIDATION_RULES.IMAGE.MAX_SIZE_MB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: 'Image must be under 5 MB',
    };
  }
  
  if (!VALIDATION_RULES.IMAGE.ALLOWED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid format, allowed: jpeg, jpg, png, webp',
    };
  }
  
  return { valid: true };
};

/**
 * Validates image dimensions
 */
export const validateImageDimensions = (
  file: File,
  minWidth: number,
  minHeight: number
): Promise<{ valid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image must be at least ${minWidth}×${minHeight} pixels`,
        });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => {
      resolve({ valid: false, error: 'Failed to load image' });
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculates remaining characters
 */
export const getRemainingCharacters = (
  currentLength: number,
  maxLength: number
): number => {
  return maxLength - currentLength;
};

/**
 * Validates URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

### Architecture Decisions
- Keep all functions pure for easy testing
- Use Promise for async operations (image loading)
- Return structured error objects (not just booleans)
- Import validation rules from constants (DRY)
- Clean separation: space-management vs validation

## Test Cases

### Unit Tests - Space Management
- Test trimLeadingTrailingSpaces: "  text  " → "text"
- Test preventLeadingSpace: " text" → "text", "text " → "text "
- Test collapseMultipleSpaces: "a  b   c" → "a b c"
- Test cleanTextInput: "  a  b  " → "a b  " (doesn't trim end)
- Test edge cases: empty string, only spaces, special characters

### Unit Tests - Validation
- Test validateImageFile: valid file passes, oversized fails, wrong format fails
- Test validateImageDimensions: image larger than min passes, smaller fails
- Test getRemainingCharacters: 10, 50 → 40
- Test isValidUrl: "https://example.com" passes, "not-url" fails

## Dependencies
**Technical Dependencies**: TS01 (validation constants)

**Business Context**: Supports all text inputs across BS01-BS11

## Estimated Effort
**6 hours** (3h implementation + 3h testing)

## Technical Notes
- Image dimension validation requires loading image into memory
- Consider performance for large images (lazy load validation)
- URL validation uses browser's built-in URL constructor
- Space management should not affect formatted text (HTML)

## Definition of Done
- [ ] All functions implemented
- [ ] Unit tests written with 100% coverage
- [ ] JSDoc comments added
- [ ] No lint warnings
- [ ] Follows existing utility patterns in `src/utils/functions/`
