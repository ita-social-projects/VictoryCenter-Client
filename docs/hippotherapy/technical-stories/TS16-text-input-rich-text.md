# TS16: Text Input Field with Rich Text

## Implements
**Business Stories**: 
- BS02 - What Is Hippotherapy Content
- BS04 - What Is Ipoventia Content
- BS05 - Center of Ipoventia Section
- BS06 - Why This Approach Content
- BS07 - What This Approach Shows
- BS08 - Scientific Research Management
- BS10 - Hippotherapy Principles Section

## Technical Goal
Create a reusable text input component with rich text editing capabilities using Lexical editor, integrated with React Hook Form for hippotherapy section forms.

## Acceptance Criteria
- [ ] Component supports plain text input mode
- [ ] Component supports rich text (Lexical) mode
- [ ] Rich text toolbar with formatting options (bold, italic, lists, links)
- [ ] Character count display with max length indicator
- [ ] Integration with React Hook Form Controller
- [ ] Real-time validation and error display
- [ ] Placeholder text support
- [ ] Disabled state support
- [ ] Multi-line text area support
- [ ] Auto-grow textarea (optional)
- [ ] Lexical plugins: MaxLength, Focus, EnterKey, Toolbar
- [ ] HTML sanitization for rich text output
- [ ] Accessibility: ARIA labels, keyboard shortcuts
- [ ] Responsive design (mobile-friendly)
- [ ] Support for both required and optional fields

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/shared/text-input-field/TextInputField.tsx`
- `src/components/admin/hippotherapy/shared/text-input-field/TextInputField.module.scss`
- `src/components/admin/hippotherapy/shared/text-input-field/TextInputField.test.tsx`
- `src/components/admin/hippotherapy/shared/text-input-field/index.ts`

### Files to Modify
- None (new component)

### Code Example

**TextInputField.tsx**:
```typescript
import React from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';
import { Box, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RichTextEditor } from '@/components/admin/common/rich-text-editor';
import styles from './TextInputField.module.scss';

interface TextInputFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  helperText?: string;
  richText?: boolean; // Enable Lexical rich text editor
  variant?: 'outlined' | 'filled' | 'standard';
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  name,
  control,
  label,
  required = false,
  multiline = false,
  rows = 4,
  maxLength,
  placeholder,
  error,
  disabled = false,
  helperText,
  richText = false,
  variant = 'outlined',
}) => {
  const { t } = useTranslation('hippotherapyAdmin');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <Box className={styles.container}>
          {richText ? (
            <>
              <Typography variant="body2" className={styles.label}>
                {label}
                {required && <span className={styles.required}>*</span>}
              </Typography>
              <RichTextEditor
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={disabled}
                error={!!error}
                aria-label={label}
                aria-required={required}
                aria-invalid={!!error}
              />
              {maxLength && (
                <Typography variant="caption" className={styles.charCount}>
                  {value?.length || 0} / {maxLength}
                </Typography>
              )}
            </>
          ) : (
            <TextField
              fullWidth
              label={label}
              variant={variant}
              multiline={multiline}
              rows={multiline ? rows : undefined}
              value={value || ''}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              error={!!error}
              helperText={error ? error.message : helperText}
              inputProps={{
                maxLength: maxLength,
                'aria-label': label,
                'aria-required': required,
                'aria-invalid': !!error,
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}

          {!richText && maxLength && (
            <Typography variant="caption" className={styles.charCount}>
              {value?.length || 0} / {maxLength}
            </Typography>
          )}

          {richText && helperText && !error && (
            <Typography variant="caption" className={styles.helperText}>
              {helperText}
            </Typography>
          )}

          {richText && error && (
            <Typography variant="caption" className={styles.errorText}>
              {error.message}
            </Typography>
          )}
        </Box>
      )}
    />
  );
};
```

**RichTextEditor component (reference existing or create)**:
```typescript
import React, { useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { MaxLengthPlugin } from '@/components/admin/rich-text-input/plugins/MaxLengthPlugin';
import { FocusPlugin } from '@/components/admin/rich-text-input/plugins/FocusPlugin';
import { EnterKeyPlugin } from '@/components/admin/rich-text-input/plugins/EnterKeyPlugin';
import { ToolbarPlugin } from '@/components/admin/rich-text-input/plugins/ToolbarPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import { EditorState } from 'lexical';
import styles from './RichTextEditor.module.scss';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  error?: boolean;
  'aria-label'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  disabled,
  error,
  ...ariaProps
}) => {
  const initialConfig = {
    namespace: 'HippotherapyEditor',
    theme: {
      // Lexical theme configuration
    },
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  };

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes();
        onChange(html);
      });
    },
    [onChange]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Box className={`${styles.editorContainer} ${error ? styles.error : ''}`}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={styles.contentEditable}
              aria-placeholder={placeholder}
              placeholder={<div className={styles.placeholder}>{placeholder}</div>}
              {...ariaProps}
            />
          }
          ErrorBoundary={() => <div>Error loading editor</div>}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <FocusPlugin />
        <EnterKeyPlugin />
        {maxLength && <MaxLengthPlugin maxLength={maxLength} />}
      </Box>
    </LexicalComposer>
  );
};
```

### Architecture Decisions
- Use Lexical editor (already in project) for rich text
- Support both plain text and rich text modes with single component
- Use React Hook Form Controller for seamless form integration
- Character count for both modes
- HTML output from Lexical for storage and rendering
- Reuse existing Lexical plugins (MaxLength, Focus, EnterKey, Toolbar)
- Material-UI TextField for plain text mode

## Test Cases

### Unit Tests

**File**: `TextInputField.test.tsx`

- Test component renders with label and required indicator
- Test plain text mode renders TextField
- Test rich text mode renders RichTextEditor
- Test character count displays correctly
- Test character count updates on input
- Test max length validation
- Test disabled state prevents editing
- Test error prop displays error message
- Test helper text displays when no error
- Test placeholder text displays
- Test multiline mode (plain text)
- Test onChange updates form value
- Test accessibility: ARIA labels present
- Test accessibility: required attribute set

**File**: `RichTextEditor.test.tsx`

- Test Lexical editor initializes
- Test toolbar renders formatting buttons
- Test bold formatting works
- Test italic formatting works
- Test list formatting works
- Test link insertion works
- Test HTML output is sanitized
- Test MaxLengthPlugin prevents input beyond limit
- Test EnterKeyPlugin behavior
- Test FocusPlugin behavior
- Test onChange callback fires on edit
- Test disabled state (if supported)

### Integration Tests
- Test integration with React Hook Form in WhatIsHippotherapyForm
- Test form validation triggers on empty required field
- Test form submit includes rich text HTML
- Test rich text preserves formatting on edit
- Test switching between sections preserves content

## Dependencies

**Technical Dependencies**:
- TS02: Constants (must complete first - provides max lengths)
- Existing Lexical plugins (MaxLengthPlugin, FocusPlugin, EnterKeyPlugin, ToolbarPlugin)

**Business Context**: Required for BS02, BS04, BS05, BS06, BS07, BS08, BS10

## Estimated Effort

**8 hours**

- Component implementation: 3 hours
- Rich text editor integration: 2 hours
- Lexical plugin configuration: 1.5 hours
- Styling and responsive design: 1 hour
- Test cases: 0.5 hours

## Technical Notes

### Patterns to Follow
- Follow existing Victory Center component patterns
- Reuse existing RichTextInput component if available, adapt for hippotherapy
- Use Material-UI TextField for plain text mode
- Use i18next for all user-facing strings
- Sanitize HTML output to prevent XSS

### Risks and Mitigation
- **Risk**: Lexical complexity and learning curve
  - **Mitigation**: Reuse existing plugins, keep configuration simple
- **Risk**: HTML sanitization gaps
  - **Mitigation**: Use DOMPurify or similar library
- **Risk**: Character count accuracy with HTML tags
  - **Mitigation**: Count plain text length, not HTML length
- **Risk**: Browser compatibility for Lexical
  - **Mitigation**: Test in all major browsers

### Performance Considerations
- Lexical is performant for large documents
- Debounce onChange to reduce form updates
- Lazy load Lexical editor if not immediately visible

### Accessibility Considerations
- Provide ARIA labels for editor
- Support keyboard shortcuts (Ctrl+B for bold, etc.)
- Provide screen reader feedback for formatting changes
- Ensure focus management in editor

### Lexical Integration
- Use existing plugins from `src/components/admin/rich-text-input/plugins/`
- Leverage MaxLengthPlugin for character limits
- Leverage EnterKeyPlugin for custom Enter behavior
- Leverage FocusPlugin for focus management
- Leverage ToolbarPlugin for formatting toolbar

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Component renders correctly in both plain and rich text modes
- [ ] Integration with React Hook Form tested
- [ ] Lexical editor works with all plugins
- [ ] Character count accurate
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Accessibility tested with screen reader
- [ ] Responsive design works on mobile
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No lint warnings
- [ ] HTML sanitization tested
