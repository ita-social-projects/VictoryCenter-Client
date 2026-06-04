# US10: Main Page Integration

## User Story
**As a** content admin  
**I want** a complete Hippotherapy admin page that assembles all sections  
**So that** I can edit all content, see validation, and publish changes

## Acceptance Criteria
- [ ] Page loads existing Hippotherapy data on mount
- [ ] All 11 sections render in correct order
- [ ] Form state tracks dirty changes across all fields
- [ ] PublishButton is disabled by default
- [ ] PublishButton becomes active after valid changes
- [ ] Publish confirmation modal appears before save
- [ ] Publish button shows loading state during save
- [ ] Success toast appears after successful publish
- [ ] Error toast appears if save fails
- [ ] Translation icons appear next to each section
- [ ] Page integrates with admin auth context
- [ ] Loading state shows while fetching data
- [ ] Page is accessible via admin route

## Technical Details

### Files to Create

1. **src/pages/admin/hippotherapy/HippotherapyAdminPage.tsx**
   ```typescript
   import React, { useEffect } from 'react';
   import { Box, Typography, CircularProgress } from '@mui/material';
   import { useHippotherapyAdmin } from '@/hooks/admin/hippotherapy/useHippotherapyAdmin';
   import { useTranslationGate } from '@/hooks/admin/hippotherapy/useTranslationGate';
   import { PublishButton } from './components/shared/publish-button';
   import { ConfirmationModal } from './components/shared/confirmation-modal';
   import { TitleSection } from './components/sections/title-section';
   import { WhatIsHippotherapySection } from './components/sections/what-is-hippotherapy-section';
   // ... import all other sections
   import { TranslationIcon } from './components/translation/TranslationIcon';
   import styles from './HippotherapyAdminPage.module.scss';

   export const HippotherapyAdminPage: React.FC = () => {
     const {
       data,
       loading,
       errors,
       isDirty,
       isValid,
       isSaving,
       handleFieldChange,
       handleImageUpload,
       handleImageDelete,
       handlePublish,
       showPublishModal,
       setShowPublishModal
     } = useHippotherapyAdmin();

     const { isEnabled: isTranslationEnabled } = useTranslationGate();

     if (loading) {
       return (
         <Box className={styles.loading}>
           <CircularProgress />
           <Typography>Завантаження...</Typography>
         </Box>
       );
     }

     return (
       <Box className={styles.hippotherapyAdminPage}>
         <Box className={styles.header}>
           <Typography variant="h4">Іпотерапія</Typography>
           <PublishButton
             isValid={isValid}
             isDirty={isDirty}
             onPublish={() => setShowPublishModal(true)}
             isLoading={isSaving}
           />
         </Box>

         {/* Title Section */}
         <Box className={styles.sectionContainer}>
           <TitleSection
             heading={data.title.heading}
             description={data.title.description}
             image={data.title.image}
             onHeadingChange={(value) => handleFieldChange('title', 'heading', value)}
             onDescriptionChange={(value) => handleFieldChange('title', 'description', value)}
             onImageUpload={(file, cropped) => handleImageUpload('title', file, cropped)}
             onImageDelete={() => handleImageDelete('title')}
             headingError={errors.title?.heading}
             descriptionError={errors.title?.description}
           />
           <TranslationIcon
             sectionId="title"
             isUkrainianPublished={isTranslationEnabled('title')}
             hasTranslation={data.title.hasTranslation}
             onOpen={() => {/* Open title translation modal */}}
           />
         </Box>

         {/* What Is Hippotherapy Section */}
         <Box className={styles.sectionContainer}>
           <WhatIsHippotherapySection
             heading={data.whatIsHippotherapy.heading}
             description={data.whatIsHippotherapy.description}
             onHeadingChange={(value) => handleFieldChange('whatIsHippotherapy', 'heading', value)}
             onDescriptionChange={(value) => handleFieldChange('whatIsHippotherapy', 'description', value)}
             headingError={errors.whatIsHippotherapy?.heading}
             descriptionError={errors.whatIsHippotherapy?.description}
           />
           <TranslationIcon
             sectionId="whatIsHippotherapy"
             isUkrainianPublished={isTranslationEnabled('whatIsHippotherapy')}
             hasTranslation={data.whatIsHippotherapy.hasTranslation}
             onOpen={() => {/* Open set1 translation modal */}}
           />
         </Box>

         {/* ... repeat for all 11 sections ... */}

         <ConfirmationModal
           open={showPublishModal}
           title="Опублікувати зміни?"
           onConfirm={handlePublish}
           onCancel={() => setShowPublishModal(false)}
           confirmLabel="ТАК"
           cancelLabel="НІ"
         />
       </Box>
     );
   };
   ```

2. **src/hooks/admin/hippotherapy/useHippotherapyAdmin.tsx**
   ```typescript
   import { useState, useEffect, useCallback } from 'react';
   import { useAdminClient } from '@/hooks/admin/use-admin-client';
   import { useToast } from '@/contexts/admin/toast-context-provider';
   import { useFormManager } from '@/hooks/admin/use-form-manager';
   import { hippotherapySchema } from '@/validation/admin/hippotherapy-schema';
   import {
     getHippotherapyData,
     updateHippotherapyData,
     uploadHippotherapyImage,
     deleteHippotherapyImage
   } from '@/services/api/admin/hippotherapy-admin-service';
   import { HippotherapyData } from '@/types/admin/hippotherapy.types';

   export const useHippotherapyAdmin = () => {
     const { adminClient } = useAdminClient();
     const { showToast } = useToast();
     const [data, setData] = useState<HippotherapyData | null>(null);
     const [loading, setLoading] = useState(true);
     const [isSaving, setIsSaving] = useState(false);
     const [showPublishModal, setShowPublishModal] = useState(false);

     const {
       register,
       handleSubmit,
       formState: { errors, isDirty, isValid },
       setValue,
       reset
     } = useFormManager({
       schema: hippotherapySchema,
       mode: 'onBlur'
     });

     // Load data on mount
     useEffect(() => {
       const loadData = async () => {
         try {
           const hippotherapyData = await getHippotherapyData(adminClient);
           setData(hippotherapyData);
           reset(hippotherapyData);
         } catch (error) {
           console.error('Failed to load hippotherapy data:', error);
           showToast('Помилка завантаження даних', 'error');
         } finally {
           setLoading(false);
         }
       };

       loadData();
     }, [adminClient, reset, showToast]);

     // Handle field changes
     const handleFieldChange = useCallback(
       (section: string, field: string, value: any) => {
         setValue(`${section}.${field}`, value, { shouldDirty: true, shouldValidate: true });
       },
       [setValue]
     );

     // Handle image upload
     const handleImageUpload = useCallback(
       async (section: string, file: File, croppedBase64: string) => {
         try {
           const imageUrl = await uploadHippotherapyImage(adminClient, file, section);
           handleFieldChange(section, 'image.url', imageUrl);
           showToast('Зображення завантажено', 'success');
         } catch (error) {
           console.error('Failed to upload image:', error);
           showToast('Помилка завантаження зображення', 'error');
         }
       },
       [adminClient, handleFieldChange, showToast]
     );

     // Handle image delete
     const handleImageDelete = useCallback(
       async (section: string) => {
         // TODO: Get imageId from data
         try {
           // await deleteHippotherapyImage(adminClient, imageId);
           handleFieldChange(section, 'image.url', null);
           handleFieldChange(section, 'image.isDefault', true);
           showToast('Зображення видалено', 'success');
         } catch (error) {
           console.error('Failed to delete image:', error);
           showToast('Помилка видалення зображення', 'error');
         }
       },
       [handleFieldChange, showToast]
     );

     // Handle publish
     const handlePublish = async () => {
       setIsSaving(true);
       setShowPublishModal(false);

       try {
         await handleSubmit(async (formData) => {
           await updateHippotherapyData(adminClient, formData);
           showToast('Зміни успішно опубліковано', 'success');
           reset(formData);
         })();
       } catch (error) {
         console.error('Failed to publish:', error);
         showToast('Помилка публікації. Спробуйте ще раз', 'error');
       } finally {
         setIsSaving(false);
       }
     };

     return {
       data,
       loading,
       errors,
       isDirty,
       isValid,
       isSaving,
       handleFieldChange,
       handleImageUpload,
       handleImageDelete,
       handlePublish,
       showPublishModal,
       setShowPublishModal
     };
   };
   ```

3. **src/pages/admin/hippotherapy/HippotherapyAdminPage.module.scss**

4. **src/pages/admin/hippotherapy/index.ts**
   ```typescript
   export { HippotherapyAdminPage } from './HippotherapyAdminPage';
   ```

## Dependencies
- US01-US08 (all sections and shared components)
- US09 (translation system)

## Estimated Effort
**10 hours**

## Integration Checklist
- [ ] Import all section components
- [ ] Connect form state to each section
- [ ] Wire up validation errors
- [ ] Connect image upload/delete handlers
- [ ] Integrate PublishButton with form state
- [ ] Add publish confirmation modal
- [ ] Add translation icons to each section
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Add success/error toasts
- [ ] Test dirty state tracking
- [ ] Test validation flow
- [ ] Test publish flow

## Testing Requirements
- Mock API responses
- Test loading state
- Test form state management
- Test dirty tracking
- Test validation
- Test publish flow
- Test error handling
- Test translation icon integration

## Definition of Done
- Page loads and displays data
- All sections render correctly
- Form validation works across all fields
- Dirty state tracked correctly
- Publish button enables/disables correctly
- Publish confirmation works
- Save operation works (or uses mocks)
- Success/error toasts display
- Translation icons present
- Loading state works
- Tests passing
- Code review completed
