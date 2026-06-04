# US02: Utility Functions for Space Management and Validation

## User Story
**As a** developer  
**I want** reusable utility functions for space management and validation  
**So that** all text inputs have consistent behavior and image uploads are properly validated

## Acceptance Criteria
- [ ] Space management utilities handle leading/trailing spaces correctly
- [ ] Multiple consecutive spaces are collapsed to single spaces
- [ ] Image validation checks file size, format, and dimensions
- [ ] Character counter utilities work correctly
- [ ] All utilities are pure functions (no side effects)
- [ ] 100% test coverage for utility functions
- [ ] Functions follow existing project patterns

## Technical Details

### Files to Create

1. **src/utils/functions/admin/hippotherapy/space-management.ts**
   ```typescript
   /**
    * Trims leading and trailing spaces from a string
    */
   export const trimLeadingTrailingSpaces = (value: string): string => {
     return value.trim();
   };

   /**
    * Prevents space as the first character
    */
   export const preventLeadingSpace = (value: string): string => {
     if (value.startsWith(' ')) {
       return value.trimStart();
     }
     return value;
   };

   /**
    * Collapses multiple consecutive spaces into single space
    */
   export const collapseMultipleSpaces = (value: string): string => {
     return value.replace(/\s{2,}/g, ' ');
   };

   /**
    * Applies all space cleaning rules
    * Use on blur event
    */
   export const cleanTextInput = (value: string): string => {
     let cleaned = preventLeadingSpace(value);
     cleaned = collapseMultipleSpaces(cleaned);
     cleaned = trimLeadingTrailingSpaces(cleaned);
     return cleaned;
   };

   /**
    * Applies space cleaning during typing (less aggressive)
    * Use on change event
    */
   export const cleanTextInputOnChange = (value: string): string => {
     let cleaned = preventLeadingSpace(value);
     cleaned = collapseMultipleSpaces(cleaned);
     return cleaned;
   };
   ```

2. **src/utils/functions/admin/hippotherapy/validation-helpers.ts**
   ```typescript
   import { VALIDATION_RULES } from '@/const/admin/hippotherapy/validation-rules';

   export interface ImageValidationResult {
     valid: boolean;
     error?: string;
   }

   /**
    * Validates image file size, format, and dimensions
    */
   export const validateImageFile = async (
     file: File,
     minWidth: number,
     minHeight: number
   ): Promise<ImageValidationResult> => {
     // Check file size
     const maxSizeBytes = VALIDATION_RULES.IMAGE_MAX_SIZE_MB * 1024 * 1024;
     if (file.size > maxSizeBytes) {
       return {
         valid: false,
         error: 'Зображення не більше 5 Mb'
       };
     }

     // Check file format
     const fileExtension = file.name.split('.').pop()?.toLowerCase();
     if (!fileExtension || !VALIDATION_RULES.ALLOWED_IMAGE_FORMATS.includes(fileExtension)) {
       return {
         valid: false,
         error: 'Невірний формат фото, дозволено jpeg, jpg, png, webp'
       };
     }

     // Check dimensions
     const dimensionsValid = await validateImageDimensions(file, minWidth, minHeight);
     if (!dimensionsValid) {
       return {
         valid: false,
         error: 'Дозволено розмір картинки не менше рекомендованого'
       };
     }

     return { valid: true };
   };

   /**
    * Validates image dimensions meet minimum requirements
    */
   export const validateImageDimensions = (
     file: File,
     minWidth: number,
     minHeight: number
   ): Promise<boolean> => {
     return new Promise((resolve) => {
       const img = new Image();
       const objectUrl = URL.createObjectURL(file);

       img.onload = () => {
         URL.revokeObjectURL(objectUrl);
         resolve(img.width >= minWidth && img.height >= minHeight);
       };

       img.onerror = () => {
         URL.revokeObjectURL(objectUrl);
         resolve(false);
       };

       img.src = objectUrl;
     });
   };

   /**
    * Calculates remaining characters for character counter
    */
   export const getRemainingCharacters = (current: number, max: number): number => {
     return Math.max(0, max - current);
   };

   /**
    * Formats character counter display text
    */
   export const formatCharacterCounter = (current: number, max: number): string => {
     return `${current}/${max}`;
   };
   ```

3. **src/utils/functions/admin/hippotherapy/space-management.test.ts**
   - Test trimLeadingTrailingSpaces
   - Test preventLeadingSpace
   - Test collapseMultipleSpaces
   - Test cleanTextInput
   - Test cleanTextInputOnChange

4. **src/utils/functions/admin/hippotherapy/validation-helpers.test.ts**
   - Test validateImageFile with various scenarios
   - Test validateImageDimensions
   - Test getRemainingCharacters
   - Test formatCharacterCounter

## Dependencies
- US01 (types and constants)

## Estimated Effort
**3 hours**

## Testing Requirements
```typescript
// Example test cases
describe('space-management', () => {
  it('should trim leading and trailing spaces', () => {
    expect(trimLeadingTrailingSpaces('  hello  ')).toBe('hello');
  });

  it('should prevent leading space', () => {
    expect(preventLeadingSpace(' hello')).toBe('hello');
  });

  it('should collapse multiple spaces', () => {
    expect(collapseMultipleSpaces('hello    world')).toBe('hello world');
  });

  it('should apply all cleaning rules', () => {
    expect(cleanTextInput('  hello    world  ')).toBe('hello world');
  });
});

describe('validation-helpers', () => {
  it('should reject file larger than 5MB', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg');
    const result = await validateImageFile(largeFile, 100, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5 Mb');
  });

  it('should reject invalid file format', async () => {
    const invalidFile = new File(['data'], 'file.gif');
    const result = await validateImageFile(invalidFile, 100, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Невірний формат');
  });

  it('should calculate remaining characters correctly', () => {
    expect(getRemainingCharacters(45, 50)).toBe(5);
    expect(getRemainingCharacters(50, 50)).toBe(0);
  });

  it('should format character counter correctly', () => {
    expect(formatCharacterCounter(45, 50)).toBe('45/50');
  });
});
```

## Definition of Done
- All utility functions implemented and working
- 100% test coverage achieved
- All tests passing
- Functions are pure (no side effects)
- Code review completed
- No ESLint warnings
- Functions are properly exported and documented
