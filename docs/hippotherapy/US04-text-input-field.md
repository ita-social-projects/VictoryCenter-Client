# US04: Text Input Field Component

## User Story
**As a** content admin  
**I want** text input fields with live character counters and validation  
**So that** I can see how much space I have left and get immediate feedback on input errors

## Acceptance Criteria
- [ ] Character counter displays "current/max" format (e.g., "45/50")
- [ ] Counter updates in real-time on every keystroke
- [ ] Further input is blocked when maxLength is reached
- [ ] Clean-up icon (×) appears when field has content and is focused
- [ ] Clean-up icon clears field and maintains focus
- [ ] Space management prevents leading spaces and collapses multiple spaces
- [ ] Validation triggers on blur (focus lost)
- [ ] Error messages appear below field after validation fails
- [ ] Error messages disappear when field becomes valid
- [ ] Field auto-expands vertically for multiline content (no scrollbar)
- [ ] Optional rich-text toolbar (bold/italic/link) for long descriptions
- [ ] Follows existing Material-UI patterns in the project

## Technical Details

### Files to Create

1. **src/components/admin/hippotherapy/shared/text-input-field/TextInputField.tsx**
   ```typescript
   import React, { useState, useRef, useEffect } from 'react';
   import { TextField, InputAdornment, IconButton, Box, Typography } from '@mui/material';
   import ClearIcon from '@mui/icons-material/Clear';
   import { cleanTextInputOnChange, cleanTextInput } from '@/utils/functions/admin/hippotherapy/space-management';
   import { formatCharacterCounter } from '@/utils/functions/admin/hippotherapy/validation-helpers';
   import styles from './TextInputField.module.scss';

   export interface TextInputFieldProps {
     label: string;
     value: string;
     onChange: (value: string) => void;
     onBlur?: () => void;
     maxChars: number;
     multiline?: boolean;
     required?: boolean;
     error?: string;
     placeholder?: string;
     disabled?: boolean;
     name: string;
   }

   export const TextInputField: React.FC<TextInputFieldProps> = ({
     label,
     value,
     onChange,
     onBlur,
     maxChars,
     multiline = false,
     required = false,
     error,
     placeholder,
     disabled = false,
     name
   }) => {
     const [isFocused, setIsFocused] = useState(false);
     const inputRef = useRef<HTMLInputElement>(null);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const newValue = e.target.value;
       
       // Don't allow input beyond maxChars
       if (newValue.length > maxChars) {
         return;
       }

       // Apply space management during typing
       const cleaned = cleanTextInputOnChange(newValue);
       onChange(cleaned);
     };

     const handleBlur = () => {
       setIsFocused(false);
       
       // Apply full cleaning on blur
       const cleaned = cleanTextInput(value);
       if (cleaned !== value) {
         onChange(cleaned);
       }

       // Trigger validation
       if (onBlur) {
         onBlur();
       }
     };

     const handleFocus = () => {
       setIsFocused(true);
     };

     const handleClear = () => {
       onChange('');
       // Keep focus on the field
       inputRef.current?.focus();
     };

     const showClearIcon = isFocused && value.length > 0 && !disabled;

     return (
       <Box className={styles.textInputField}>
         <TextField
           inputRef={inputRef}
           label={label}
           name={name}
           value={value}
           onChange={handleChange}
           onBlur={handleBlur}
           onFocus={handleFocus}
           multiline={multiline}
           minRows={multiline ? 3 : 1}
           maxRows={multiline ? Infinity : 1}
           required={required}
           error={!!error}
           helperText={error}
           placeholder={placeholder}
           disabled={disabled}
           fullWidth
           InputProps={{
             endAdornment: showClearIcon && (
               <InputAdornment position="end">
                 <IconButton
                   onClick={handleClear}
                   edge="end"
                   size="small"
                   aria-label="clear field"
                 >
                   <ClearIcon />
                 </IconButton>
               </InputAdornment>
             )
           }}
           className={styles.input}
         />
         <Typography className={styles.characterCounter} variant="caption">
           {formatCharacterCounter(value.length, maxChars)}
         </Typography>
       </Box>
     );
   };
   ```

2. **src/components/admin/hippotherapy/shared/text-input-field/TextInputField.module.scss**
   ```scss
   @import '@/assets/sass/variables/colors';
   @import '@/assets/sass/mixins/responsive';

   .textInputField {
     position: relative;
     margin-bottom: 1.5rem;

     .input {
       width: 100%;

       textarea {
         overflow-y: auto !important;
         resize: vertical;
       }
     }

     .characterCounter {
       position: absolute;
       right: 0;
       bottom: -20px;
       color: $color-text-secondary;
       font-size: 0.75rem;
       user-select: none;
     }
   }
   ```

3. **src/components/admin/hippotherapy/shared/text-input-field/TextInputField.test.tsx**
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { TextInputField } from './TextInputField';

   describe('TextInputField', () => {
     const mockOnChange = jest.fn();
     const mockOnBlur = jest.fn();

     beforeEach(() => {
       jest.clearAllMocks();
     });

     it('renders with label and value', () => {
       render(
         <TextInputField
           label="Test Label"
           value="Test value"
           onChange={mockOnChange}
           maxChars={50}
           name="test"
         />
       );

       expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
       expect(screen.getByDisplayValue('Test value')).toBeInTheDocument();
     });

     it('displays character counter', () => {
       render(
         <TextInputField
           label="Test"
           value="Hello"
           onChange={mockOnChange}
           maxChars={50}
           name="test"
         />
       );

       expect(screen.getByText('5/50')).toBeInTheDocument();
     });

     it('blocks input beyond maxChars', async () => {
       render(
         <TextInputField
           label="Test"
           value="x".repeat(50)}
           onChange={mockOnChange}
           maxChars={50}
           name="test"
         />
       );

       const input = screen.getByLabelText('Test');
       await userEvent.type(input, 'a');

       expect(mockOnChange).not.toHaveBeenCalled();
     });

     it('shows clear icon when focused and has content', async () => {
       render(
         <TextInputField
           label="Test"
           value="content"
           onChange={mockOnChange}
           maxChars={50}
           name="test"
         />
       );

       const input = screen.getByLabelText('Test');
       fireEvent.focus(input);

       const clearButton = screen.getByRole('button', { name: /clear field/i });
       expect(clearButton).toBeInTheDocument();
     });

     it('clears field and maintains focus when clear icon clicked', async () => {
       render(
         <TextInputField
           label="Test"
           value="content"
           onChange={mockOnChange}
           maxChars={50}
           name="test"
         />
       );

       const input = screen.getByLabelText('Test');
       fireEvent.focus(input);

       const clearButton = screen.getByRole('button', { name: /clear field/i });
       fireEvent.click(clearButton);

       expect(mockOnChange).toHaveBeenCalledWith('');
       expect(input).toHaveFocus();
     });

     it('applies space management on blur', () => {
       render(
         <TextInputField
           label="Test"
           value="  hello    world  "
           onChange={mockOnChange}
           onBlur={mockOnBlur}
           maxChars={50}
           name="test"
         />
       );

       const input = screen.getByLabelText('Test');
       fireEvent.blur(input);

       expect(mockOnChange).toHaveBeenCalledWith('hello world');
       expect(mockOnBlur).toHaveBeenCalled();
     });

     it('displays error message when provided', () => {
       render(
         <TextInputField
           label="Test"
           value=""
           onChange={mockOnChange}
           maxChars={50}
           error="Поле обов'язкове"
           name="test"
         />
       );

       expect(screen.getByText("Поле обов'язкове")).toBeInTheDocument();
     });

     it('prevents leading space', async () => {
       render(
         <TextInputField
           label="Test"
           value=""
           onChange={mockOnChange}
           maxChars={50}
           name="test"
         />
       );

       const input = screen.getByLabelText('Test');
       await userEvent.type(input, ' hello');

       expect(mockOnChange).toHaveBeenCalledWith('hello');
     });
   });
   ```

4. **src/components/admin/hippotherapy/shared/text-input-field/index.ts**
   ```typescript
   export { TextInputField } from './TextInputField';
   export type { TextInputFieldProps } from './TextInputField';
   ```

## Dependencies
- US02 (utility functions)

## Estimated Effort
**4 hours**

## Technical Notes

### Auto-expand Behavior
The field uses Material-UI's `multiline` prop with `maxRows={Infinity}` to auto-expand vertically. CSS ensures no internal scrollbar appears.

### Space Management
- **On Change**: Prevents leading space, collapses multiple spaces
- **On Blur**: Full cleaning (trim + collapse + remove leading)

### Character Counter Position
Positioned absolutely at bottom-right of field container to avoid interfering with error messages.

### Clear Icon Visibility
Only shows when:
1. Field is focused
2. Field has content (length > 0)
3. Field is not disabled

## Testing Requirements
- Render with various props
- Character counter updates correctly
- Max length enforcement
- Clear icon appears/disappears correctly
- Clear icon maintains focus
- Space management on change and blur
- Error message display
- Validation on blur
- Multiline auto-expand

## Definition of Done
- Component renders correctly
- Character counter works in real-time
- Max length is enforced
- Clear icon functions properly
- Space management works as specified
- Validation triggers on blur
- All tests passing with >90% coverage
- No ESLint warnings
- Follows project styling patterns
- Code review completed
