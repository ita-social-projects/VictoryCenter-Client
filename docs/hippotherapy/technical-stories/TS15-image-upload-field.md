# TS15: Image Upload Field Component

## Implements
**Business Stories**: 
- BS01 - Title Section Content Management
- BS02 - What Is Hippotherapy Content
- BS03 - Testimonials Section Management
- BS05 - Center of Ipoventia Section
- BS06 - Why This Approach Content
- BS07 - What This Approach Shows
- BS08 - Scientific Research Management

## Technical Goal
Create a reusable image upload component with drag-and-drop, preview, cropping, validation, and integration with React Hook Form for hippotherapy section forms.

## Acceptance Criteria
- [ ] Component supports drag-and-drop file upload
- [ ] Component supports click-to-browse file upload
- [ ] Image preview displayed after selection
- [ ] Image cropping modal with aspect ratio control
- [ ] File type validation (JPG, PNG, WebP only)
- [ ] File size validation (max 5MB)
- [ ] Dimension validation (min width/height configurable)
- [ ] Integration with React Hook Form Controller
- [ ] Error message display for validation failures
- [ ] Remove/replace image functionality
- [ ] Loading state during upload/crop operations
- [ ] Accessibility: keyboard navigation, ARIA labels, screen reader support
- [ ] Responsive design (mobile-friendly)
- [ ] Support for optional vs required images
- [ ] Image compression before upload (optional)

## Implementation Details

### Files to Create
- `src/components/admin/hippotherapy/shared/image-upload-field/ImageUploadField.tsx`
- `src/components/admin/hippotherapy/shared/image-upload-field/ImageUploadField.module.scss`
- `src/components/admin/hippotherapy/shared/image-upload-field/ImageUploadField.test.tsx`
- `src/components/admin/hippotherapy/shared/image-upload-field/index.ts`

### Files to Modify
- None (new component)

### Code Example

**ImageUploadField.tsx**:
```typescript
import React, { useState, useRef, useCallback } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';
import { Box, Button, Typography, IconButton, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { ImageCropperModal } from '@/components/admin/common/image-cropper-modal';
import { MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@/const/admin/hippotherapy-constants';
import styles from './ImageUploadField.module.scss';

interface ImageUploadFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  required?: boolean;
  aspectRatio?: number; // e.g., 16/9, 4/3, 1 (square)
  minWidth?: number;
  minHeight?: number;
  error?: FieldError;
  disabled?: boolean;
  helperText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  name,
  control,
  label,
  required = false,
  aspectRatio = 16 / 9,
  minWidth = 800,
  minHeight = 600,
  error,
  disabled = false,
  helperText,
}) => {
  const { t } = useTranslation('hippotherapyAdmin');
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Type validation
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return t('imageUpload.errors.invalidType');
      }

      // Size validation
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        return t('imageUpload.errors.tooLarge', { maxSize: MAX_IMAGE_SIZE_MB });
      }

      return null;
    },
    [t]
  );

  const handleFileSelect = useCallback(
    (file: File, onChange: (value: any) => void) => {
      const validationError = validateFile(file);
      if (validationError) {
        // Set error via React Hook Form
        return;
      }

      setSelectedFile(file);
      setCropModalOpen(true);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, onChange: (value: any) => void) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file, onChange);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCropComplete = useCallback(
    (croppedFile: File, onChange: (value: any) => void) => {
      setIsProcessing(true);
      
      // Create preview URL
      const url = URL.createObjectURL(croppedFile);
      setPreviewUrl(url);
      
      // Update form value
      onChange(croppedFile);
      
      setCropModalOpen(false);
      setSelectedFile(null);
      setIsProcessing(false);
    },
    []
  );

  const handleRemove = useCallback((onChange: (value: any) => void) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <Box className={styles.container}>
          <Typography variant="body2" className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </Typography>

          {!previewUrl ? (
            <Box
              className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${
                error ? styles.error : ''
              }`}
              onDrop={(e) => handleDrop(e, onChange)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={t('imageUpload.dropzoneLabel')}
            >
              <CloudUploadIcon className={styles.uploadIcon} />
              <Typography variant="body1" className={styles.dropzoneText}>
                {t('imageUpload.dragAndDrop')}
              </Typography>
              <Typography variant="body2" className={styles.dropzoneSubtext}>
                {t('imageUpload.or')}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleBrowse}
                disabled={disabled || isProcessing}
                aria-label={t('imageUpload.browseButton')}
              >
                {t('imageUpload.browse')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, onChange);
                }}
                className={styles.hiddenInput}
                aria-hidden="true"
              />
            </Box>
          ) : (
            <Box className={styles.preview}>
              <img src={previewUrl} alt={label} className={styles.previewImage} />
              <Box className={styles.previewActions}>
                <IconButton
                  size="small"
                  onClick={() => handleBrowse()}
                  disabled={disabled}
                  aria-label={t('imageUpload.replaceImage')}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleRemove(onChange)}
                  disabled={disabled}
                  aria-label={t('imageUpload.removeImage')}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          )}

          {helperText && !error && (
            <Typography variant="caption" className={styles.helperText}>
              {helperText}
            </Typography>
          )}

          {error && (
            <Typography variant="caption" className={styles.errorText}>
              {error.message}
            </Typography>
          )}

          {isProcessing && (
            <Box className={styles.processingOverlay}>
              <CircularProgress size={40} />
            </Box>
          )}

          {selectedFile && (
            <ImageCropperModal
              open={cropModalOpen}
              onClose={() => {
                setCropModalOpen(false);
                setSelectedFile(null);
              }}
              imageFile={selectedFile}
              aspectRatio={aspectRatio}
              minWidth={minWidth}
              minHeight={minHeight}
              onCropComplete={(croppedFile) => handleCropComplete(croppedFile, onChange)}
            />
          )}
        </Box>
      )}
    />
  );
};
```

### Architecture Decisions
- Use React Hook Form Controller for form integration
- Leverage existing ImageCropperModal component (if available) or create simple crop modal
- Use Material-UI components for consistency
- Support drag-and-drop with native HTML5 API
- Preview with object URLs (memory-efficient)
- Clean up object URLs on unmount to prevent memory leaks
- Validation at component level and schema level (double validation)

## Test Cases

### Unit Tests

**File**: `ImageUploadField.test.tsx`

- Test component renders with label and required indicator
- Test component renders dropzone when no image
- Test drag-and-drop triggers file selection
- Test click-to-browse opens file picker
- Test invalid file type shows error message
- Test file too large shows error message
- Test valid file opens crop modal
- Test crop complete updates preview and form value
- Test remove image clears preview and form value
- Test replace image allows selecting new file
- Test disabled state prevents interaction
- Test error prop displays error message
- Test helper text displays when no error
- Test accessibility: ARIA labels present
- Test accessibility: keyboard navigation works
- Test memory leak: object URLs cleaned up on unmount

### Integration Tests
- Test integration with React Hook Form in TitleSectionForm
- Test form validation triggers on invalid image
- Test form submit includes image file
- Test error messages from schema validation display correctly

## Dependencies

**Technical Dependencies**:
- TS02: Constants (must complete first - provides validation limits)
- Common ImageCropperModal component (or create simple version)

**Business Context**: Required for BS01, BS02, BS03, BS05, BS06, BS07, BS08

## Estimated Effort

**6 hours**

- Component implementation: 3 hours
- Drag-and-drop and file handling: 1 hour
- Integration with React Hook Form: 0.5 hours
- Styling and responsive design: 1 hour
- Test cases: 0.5 hours

## Technical Notes

### Patterns to Follow
- Follow existing Victory Center component patterns
- Use Material-UI components for consistency
- Use SASS modules for styling
- Use i18next for all user-facing strings
- Clean up side effects (object URLs) in useEffect cleanup

### Risks and Mitigation
- **Risk**: Large image files cause performance issues
  - **Mitigation**: Validate file size before loading, compress images if needed
- **Risk**: Browser compatibility for drag-and-drop
  - **Mitigation**: Test in all major browsers, provide fallback to click-to-browse
- **Risk**: Memory leaks from object URLs
  - **Mitigation**: Revoke object URLs on unmount and image removal
- **Risk**: Cropping complexity
  - **Mitigation**: Use existing ImageCropperModal or react-easy-crop library

### Performance Considerations
- Use object URLs instead of data URLs (more efficient)
- Lazy load crop modal only when needed
- Debounce drag events to reduce re-renders
- Compress images before upload if file size is large

### Accessibility Considerations
- Provide ARIA labels for dropzone and buttons
- Support keyboard navigation (Tab, Enter)
- Provide screen reader feedback for upload progress
- Ensure focus management in crop modal

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Component renders correctly with all props
- [ ] Drag-and-drop works in all major browsers
- [ ] File validation works (type, size, dimensions)
- [ ] Integration with React Hook Form tested
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Accessibility tested with screen reader
- [ ] Responsive design works on mobile
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No lint warnings
- [ ] Memory leaks checked and fixed
