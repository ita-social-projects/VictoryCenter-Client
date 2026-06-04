# US05: Image Upload Field Component

## User Story
**As a** content admin  
**I want** to upload, crop, and manage images for sections  
**So that** I can add visual content that meets size and format requirements

## Acceptance Criteria
- [ ] Click-to-upload opens file dialog
- [ ] Drag-and-drop support for image files
- [ ] File validation checks size (max 5MB), format (jpeg/jpg/png/webp), and dimensions
- [ ] Cropper interface appears after successful validation
- [ ] Preview shows current image or default image
- [ ] Delete confirmation modal appears when deleting uploaded image
- [ ] Default images cannot be deleted
- [ ] Hover over uploaded image shows Delete and Crop icons
- [ ] Error messages display for validation failures
- [ ] Successfully uploaded image enables the Publish button

## Technical Details

### Files to Create

1. **src/components/admin/hippotherapy/shared/image-upload-field/ImageUploadField.tsx**
   ```typescript
   import React, { useState, useRef } from 'react';
   import { Box, IconButton, Typography } from '@mui/material';
   import DeleteIcon from '@mui/icons-material/Delete';
   import CropIcon from '@mui/icons-material/Crop';
   import { ImageCropper } from '@/components/admin/image-cropper';
   import { validateImageFile } from '@/utils/functions/admin/hippotherapy/validation-helpers';
   import { ConfirmationModal } from '../confirmation-modal';
   import styles from './ImageUploadField.module.scss';

   export interface ImageUploadFieldProps {
     currentImage: string | null;
     defaultImage: string;
     recommendedSize: { width: number; height: number };
     onUpload: (file: File, croppedBase64: string) => void;
     onDelete: () => void;
     label: string;
     disabled?: boolean;
   }

   export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
     currentImage,
     defaultImage,
     recommendedSize,
     onUpload,
     onDelete,
     label,
     disabled = false
   }) => {
     const [isHovered, setIsHovered] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [showCropper, setShowCropper] = useState(false);
     const [fileToUpload, setFileToUpload] = useState<File | null>(null);
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const [isDragging, setIsDragging] = useState(false);
     const fileInputRef = useRef<HTMLInputElement>(null);

     const isDefaultImage = !currentImage;
     const displayImage = currentImage || defaultImage;

     const handleFileSelect = async (file: File) => {
       setError(null);

       // Validate file
       const validation = await validateImageFile(
         file,
         recommendedSize.width,
         recommendedSize.height
       );

       if (!validation.valid) {
         setError(validation.error || 'Invalid file');
         return;
       }

       // Show cropper
       setFileToUpload(file);
       setShowCropper(true);
     };

     const handleClick = () => {
       if (disabled) return;
       fileInputRef.current?.click();
     };

     const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (file) {
         handleFileSelect(file);
       }
       // Reset input value to allow selecting the same file again
       e.target.value = '';
     };

     const handleDragOver = (e: React.DragEvent) => {
       e.preventDefault();
       if (!disabled) {
         setIsDragging(true);
       }
     };

     const handleDragLeave = () => {
       setIsDragging(false);
     };

     const handleDrop = (e: React.DragEvent) => {
       e.preventDefault();
       setIsDragging(false);

       if (disabled) return;

       const file = e.dataTransfer.files?.[0];
       if (file) {
         handleFileSelect(file);
       }
     };

     const handleCropComplete = (croppedBase64: string) => {
       if (fileToUpload) {
         onUpload(fileToUpload, croppedBase64);
       }
       setShowCropper(false);
       setFileToUpload(null);
     };

     const handleCropCancel = () => {
       setShowCropper(false);
       setFileToUpload(null);
     };

     const handleDeleteClick = () => {
       if (!isDefaultImage) {
         setShowDeleteModal(true);
       }
     };

     const handleDeleteConfirm = () => {
       onDelete();
       setShowDeleteModal(false);
     };

     const handleDeleteCancel = () => {
       setShowDeleteModal(false);
     };

     return (
       <>
         <Box className={styles.imageUploadField}>
           <Typography variant="subtitle1" className={styles.label}>
             {label}
           </Typography>
           <Typography variant="caption" className={styles.recommendedSize}>
             Рекомендований розмір: {recommendedSize.width}×{recommendedSize.height}px
           </Typography>

           <Box
             className={`${styles.imageContainer} ${isDragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`}
             onClick={handleClick}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
           >
             <img src={displayImage} alt={label} className={styles.image} />

             {isHovered && !isDefaultImage && !disabled && (
               <Box className={styles.hoverOverlay}>
                 <IconButton
                   onClick={(e) => {
                     e.stopPropagation();
                     handleDeleteClick();
                   }}
                   className={styles.iconButton}
                   aria-label="delete image"
                 >
                   <DeleteIcon />
                 </IconButton>
                 <IconButton
                   onClick={handleClick}
                   className={styles.iconButton}
                   aria-label="crop image"
                 >
                   <CropIcon />
                 </IconButton>
               </Box>
             )}

             {isDefaultImage && !disabled && (
               <Box className={styles.uploadPrompt}>
                 <Typography variant="body2">
                   Натисніть або перетягніть файл для завантаження
                 </Typography>
               </Box>
             )}
           </Box>

           {error && (
             <Typography color="error" variant="caption" className={styles.error}>
               {error}
             </Typography>
           )}

           <input
             ref={fileInputRef}
             type="file"
             accept="image/jpeg,image/jpg,image/png,image/webp"
             onChange={handleFileInput}
             style={{ display: 'none' }}
           />
         </Box>

         {showCropper && fileToUpload && (
           <ImageCropper
             file={fileToUpload}
             aspectRatio={recommendedSize.width / recommendedSize.height}
             onCropComplete={handleCropComplete}
             onCancel={handleCropCancel}
           />
         )}

         <ConfirmationModal
           open={showDeleteModal}
           title="Видалити фото?"
           onConfirm={handleDeleteConfirm}
           onCancel={handleDeleteCancel}
           confirmLabel="ТАК"
           cancelLabel="НІ"
         />
       </>
     );
   };
   ```

2. **src/components/admin/hippotherapy/shared/image-upload-field/ImageUploadField.module.scss**
   ```scss
   @import '@/assets/sass/variables/colors';
   @import '@/assets/sass/mixins/responsive';

   .imageUploadField {
     margin-bottom: 2rem;

     .label {
       font-weight: 600;
       margin-bottom: 0.5rem;
     }

     .recommendedSize {
       color: $color-text-secondary;
       display: block;
       margin-bottom: 1rem;
     }

     .imageContainer {
       position: relative;
       width: 100%;
       max-width: 600px;
       height: 300px;
       border: 2px dashed $color-border;
       border-radius: 8px;
       overflow: hidden;
       cursor: pointer;
       transition: all 0.3s ease;

       &:hover:not(.disabled) {
         border-color: $color-primary;
       }

       &.dragging {
         border-color: $color-primary;
         background-color: rgba($color-primary, 0.1);
       }

       &.disabled {
         cursor: not-allowed;
         opacity: 0.6;
       }

       .image {
         width: 100%;
         height: 100%;
         object-fit: cover;
       }

       .hoverOverlay {
         position: absolute;
         top: 0;
         left: 0;
         right: 0;
         bottom: 0;
         background-color: rgba(0, 0, 0, 0.5);
         display: flex;
         align-items: center;
         justify-content: center;
         gap: 1rem;

         .iconButton {
           color: white;
           background-color: rgba(255, 255, 255, 0.2);

           &:hover {
             background-color: rgba(255, 255, 255, 0.3);
           }
         }
       }

       .uploadPrompt {
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         text-align: center;
         pointer-events: none;
         color: $color-text-secondary;
       }
     }

     .error {
       display: block;
       margin-top: 0.5rem;
     }
   }
   ```

3. **src/components/admin/hippotherapy/shared/image-upload-field/ImageUploadField.test.tsx**

4. **src/components/admin/hippotherapy/shared/image-upload-field/index.ts**

## Dependencies
- US02 (validation helpers)
- Existing ImageCropper component
- ConfirmationModal (created in parallel)

## Estimated Effort
**5 hours**

## Technical Notes

### Image Cropper Integration
Reuses existing `ImageCropper` component from `src/components/admin/image-cropper/`. Aspect ratio is calculated from recommendedSize.

### Validation Flow
1. User selects/drops file
2. Validate size (max 5MB)
3. Validate format (jpeg/jpg/png/webp)
4. Validate dimensions (min width/height)
5. If valid → show cropper
6. If invalid → show error message

### Delete Behavior
- Default images: Delete icon not shown
- Uploaded images: Delete icon shown on hover
- Confirmation modal before deletion
- After deletion: reverts to default image

## Definition of Done
- Component renders with default image
- Click-to-upload works
- Drag-and-drop works
- All validations work correctly
- Cropper integration works
- Delete confirmation works
- Cannot delete default images
- Error messages display correctly
- Tests passing with >85% coverage
- Code review completed
