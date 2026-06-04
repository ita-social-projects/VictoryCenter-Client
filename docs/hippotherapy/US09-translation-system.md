# US09: Translation System

## User Story
**As a** content admin  
**I want** to translate Hippotherapy content to English  
**So that** international visitors can read the page in their language

## Acceptance Criteria
- [ ] Translation icon appears next to each section
- [ ] Translation icon is disabled until Ukrainian content is published
- [ ] Translation icon changes state when translation exists (add vs edit)
- [ ] Clicking icon opens appropriate modal variant for that section
- [ ] 8 different modal variants handle different field configurations
- [ ] "Додати переклад" modal opens for new translations
- [ ] "Редагувати переклад" modal opens for existing translations
- [ ] X button closes modal (with confirmation if data entered)
- [ ] Language dropdown shows only "Англійська" (selected by default)
- [ ] "Зберегти переклад" button is disabled until all required fields are valid
- [ ] Saving translation updates icon state to "has translation"
- [ ] Success toast appears after save
- [ ] Scientific Research has TWO independent translation icons (section + per entry)

## Translation Modal Variants

### 1. Set1Modal (heading + description)
**Used by**: WhatIsHippotherapy, WhatIsIpoventia, WhatTheApproachShows
- Fields: Heading (50), Description (1000)

### 2. TitleModal (heading + description)
**Used by**: Title section
- Fields: Heading (50), Description (300)
- Note: No image translation

### 3. TestimonialsModal (description + additional description)
**Used by**: Testimonials sections
- Fields: Description (100), Additional Description (50)

### 4. CenterIpoventiaModal (heading + description + additional)
**Used by**: CenterOfIpoventia
- Fields: Heading (50), Description (300), Additional Description (50)

### 5. Set2Modal (heading + 4× image + description)
**Used by**: WhyThisApproach, WhoProgramsSuit
- Fields: Heading (50), 4× Description (300) with readonly image preview

### 6. ResearchGeneralModal (heading + description)
**Used by**: ScientificResearch section heading/description
- Fields: Heading (50), Description (300)

### 7. ResearchEntryModal (name only)
**Used by**: Individual scientific reference entries
- Fields: Name (150)
- Note: Link is NOT translated (shared across languages)

### 8. PrinciplesModal (heading + 5× description)
**Used by**: Principles section
- Fields: Heading (50), 5× Description (300)

## Technical Details

### Files to Create

1. **src/components/admin/hippotherapy/translation/TranslationIcon.tsx**
   ```typescript
   import React from 'react';
   import { IconButton, Tooltip } from '@mui/material';
   import TranslateIcon from '@mui/icons-material/Translate';
   import EditIcon from '@mui/icons-material/Edit';
   import styles from './TranslationIcon.module.scss';

   export interface TranslationIconProps {
     sectionId: string;
     isUkrainianPublished: boolean;
     hasTranslation: boolean;
     onOpen: () => void;
     disabled?: boolean;
   }

   export const TranslationIcon: React.FC<TranslationIconProps> = ({
     sectionId,
     isUkrainianPublished,
     hasTranslation,
     onOpen,
     disabled = false
   }) => {
     const isDisabled = !isUkrainianPublished || disabled;
     
     const tooltipTitle = isDisabled
       ? 'Спочатку опублікуйте українську версію'
       : hasTranslation
       ? 'Редагувати переклад'
       : 'Додати переклад';

     return (
       <Tooltip title={tooltipTitle}>
         <span>
           <IconButton
             onClick={onOpen}
             disabled={isDisabled}
             size="small"
             className={`${styles.translationIcon} ${hasTranslation ? styles.hasTranslation : ''}`}
           >
             {hasTranslation ? <EditIcon /> : <TranslateIcon />}
           </IconButton>
         </span>
       </Tooltip>
     );
   };
   ```

2. **src/components/admin/hippotherapy/translation/TranslationModalBase.tsx**
   ```typescript
   import React from 'react';
   import {
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     Button,
     Select,
     MenuItem,
     IconButton,
     Box
   } from '@mui/material';
   import CloseIcon from '@mui/icons-material/Close';
   import styles from './TranslationModalBase.module.scss';

   export interface TranslationModalBaseProps {
     open: boolean;
     title: string;
     onClose: () => void;
     onSave: () => void;
     isSaveDisabled: boolean;
     hasUnsavedChanges: boolean;
     children: React.ReactNode;
   }

   export const TranslationModalBase: React.FC<TranslationModalBaseProps> = ({
     open,
     title,
     onClose,
     onSave,
     isSaveDisabled,
     hasUnsavedChanges,
     children
   }) => {
     const [showCloseConfirmation, setShowCloseConfirmation] = React.useState(false);

     const handleCloseClick = () => {
       if (hasUnsavedChanges) {
         setShowCloseConfirmation(true);
       } else {
         onClose();
       }
     };

     return (
       <>
         <Dialog
           open={open}
           onClose={handleCloseClick}
           maxWidth="md"
           fullWidth
           className={styles.translationModal}
         >
           <DialogTitle>
             <Box className={styles.header}>
               <span>{title}</span>
               <Select
                 value="en"
                 size="small"
                 disabled
                 className={styles.languageSelect}
               >
                 <MenuItem value="en">Англійська</MenuItem>
               </Select>
               <IconButton onClick={handleCloseClick} size="small">
                 <CloseIcon />
               </IconButton>
             </Box>
           </DialogTitle>

           <DialogContent>{children}</DialogContent>

           <DialogActions>
             <Button onClick={onSave} variant="contained" disabled={isSaveDisabled}>
               Зберегти переклад
             </Button>
           </DialogActions>
         </Dialog>

         <ConfirmationModal
           open={showCloseConfirmation}
           title="Закрити без збереження?"
           onConfirm={onClose}
           onCancel={() => setShowCloseConfirmation(false)}
           confirmLabel="ТАК"
           cancelLabel="НІ"
         />
       </>
     );
   };
   ```

3. **Modal variant components** (8 files):
   - `Set1Modal.tsx`
   - `TitleModal.tsx`
   - `TestimonialsModal.tsx`
   - `CenterIpoventiaModal.tsx`
   - `Set2Modal.tsx`
   - `ResearchGeneralModal.tsx`
   - `ResearchEntryModal.tsx`
   - `PrinciplesModal.tsx`

4. **src/hooks/admin/hippotherapy/useTranslationGate.tsx**
   ```typescript
   import { useState, useEffect } from 'react';
   import { useAdminClient } from '@/hooks/admin/use-admin-client';
   import { getTranslationStatuses } from '@/services/api/admin/hippotherapy-translation-service';

   export const useTranslationGate = () => {
     const { adminClient } = useAdminClient();
     const [statuses, setStatuses] = useState<Record<string, boolean>>({});
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const fetchStatuses = async () => {
         try {
           const data = await getTranslationStatuses(adminClient);
           const statusMap = data.reduce((acc, status) => {
             acc[status.sectionId] = status.isUkrainianPublished;
             return acc;
           }, {} as Record<string, boolean>);
           setStatuses(statusMap);
         } catch (error) {
           console.error('Failed to fetch translation statuses:', error);
         } finally {
           setLoading(false);
         }
       };

       fetchStatuses();
     }, [adminClient]);

     const isEnabled = (sectionId: string): boolean => {
       return statuses[sectionId] ?? false;
     };

     return { isEnabled, loading };
   };
   ```

5. **src/hooks/admin/hippotherapy/useTranslationModal.tsx**
   ```typescript
   import { useState } from 'react';
   import { useAdminClient } from '@/hooks/admin/use-admin-client';
   import { useToast } from '@/contexts/admin/toast-context-provider';
   import { getTranslation, saveTranslation } from '@/services/api/admin/hippotherapy-translation-service';

   export const useTranslationModal = (sectionId: string) => {
     const { adminClient } = useAdminClient();
     const { showToast } = useToast();
     const [isOpen, setIsOpen] = useState(false);
     const [translationData, setTranslationData] = useState<Record<string, string>>({});
     const [loading, setLoading] = useState(false);

     const open = async () => {
       setIsOpen(true);
       setLoading(true);
       
       try {
         const existing = await getTranslation(adminClient, 'en', sectionId);
         if (existing) {
           setTranslationData(existing.fields);
         }
       } catch (error) {
         console.error('Failed to load translation:', error);
       } finally {
         setLoading(false);
       }
     };

     const close = () => {
       setIsOpen(false);
       setTranslationData({});
     };

     const save = async (fields: Record<string, string>) => {
       setLoading(true);
       
       try {
         const isNew = Object.keys(translationData).length === 0;
         await saveTranslation(adminClient, 'en', sectionId, fields, isNew);
         
         showToast('Переклад опубліковано', 'success');
         close();
       } catch (error) {
         console.error('Failed to save translation:', error);
         showToast('Помилка збереження. Спробуйте ще раз', 'error');
       } finally {
         setLoading(false);
       }
     };

     return { isOpen, open, close, save, translationData, loading };
   };
   ```

## Dependencies
- US03 (translation API service)
- US04 (TextInputField)
- US06 (ConfirmationModal)

## Estimated Effort
**20 hours**

## Technical Notes

### Translation Gate Logic
Each section checks `isUkrainianPublished` before enabling translation icon. This status is fetched from the backend and cached.

### Modal Field Configuration
Each modal variant is a thin wrapper around TranslationModalBase with specific fields. Consider creating a factory pattern to reduce code duplication.

### Scientific Research Special Case
Two independent translation icons:
1. Section heading/description (ResearchGeneralModal)
2. Each individual entry (ResearchEntryModal with entry ID)

## Definition of Done
- TranslationIcon component works with gate logic
- All 8 modal variants implemented
- Modals open/close correctly
- Save functionality works
- Toast notifications appear
- Translation status updates after save
- Scientific Research has both icons working independently
- Tests for TranslationIcon and hooks
- Code review completed
