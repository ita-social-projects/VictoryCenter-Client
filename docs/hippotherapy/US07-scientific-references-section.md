# US07: Scientific References Section

## User Story
**As a** content admin  
**I want** to manage a dynamic list of scientific references  
**So that** I can add, edit, and remove research citations with proper validation

## Acceptance Criteria
- [ ] References display as collapsible entries
- [ ] Each entry shows name in collapsed state
- [ ] Expanded entry shows name (150 chars) and link (1000 chars) fields
- [ ] "Додати +" button is active when all entries are valid
- [ ] "Додати +" button is disabled when any entry is invalid
- [ ] New entries are added in expanded state
- [ ] Delete icon shows only when more than 1 entry exists
- [ ] Delete confirmation modal appears before deletion
- [ ] Last remaining entry cannot be deleted
- [ ] Validation triggers on blur for each field
- [ ] Character counters display for both fields

## Technical Details

### Files to Create

1. **src/components/admin/hippotherapy/sections/scientific-references/ScientificReferencesSection.tsx**
   ```typescript
   import React, { useState } from 'react';
   import { Box, Button, Typography } from '@mui/material';
   import AddIcon from '@mui/icons-material/Add';
   import { ScientificReference } from '@/types/admin/hippotherapy.types';
   import { ScientificReferenceEntry } from './ScientificReferenceEntry';
   import styles from './ScientificReferencesSection.module.scss';

   export interface ScientificReferencesSectionProps {
     heading: string;
     description: string;
     references: ScientificReference[];
     onHeadingChange: (value: string) => void;
     onDescriptionChange: (value: string) => void;
     onReferenceChange: (id: string, field: 'name' | 'link', value: string) => void;
     onReferenceAdd: () => void;
     onReferenceDelete: (id: string) => void;
     onReferenceToggle: (id: string) => void;
     headingError?: string;
     descriptionError?: string;
     referenceErrors?: Record<string, { name?: string; link?: string }>;
   }

   export const ScientificReferencesSection: React.FC<ScientificReferencesSectionProps> = ({
     heading,
     description,
     references,
     onHeadingChange,
     onDescriptionChange,
     onReferenceChange,
     onReferenceAdd,
     onReferenceDelete,
     onReferenceToggle,
     headingError,
     descriptionError,
     referenceErrors = {}
   }) => {
     // Check if all references are valid
     const allReferencesValid = references.every(ref => {
       const errors = referenceErrors[ref.id];
       return ref.name.length >= 5 && ref.link.length >= 5 && !errors?.name && !errors?.link;
     });

     const canAddNew = allReferencesValid;
     const canDelete = references.length > 1;

     return (
       <Box className={styles.scientificReferencesSection}>
         <Typography variant="h6" className={styles.sectionTitle}>
           Наукові дослідження
         </Typography>

         <TextInputField
           label="Заголовок"
           value={heading}
           onChange={onHeadingChange}
           maxChars={50}
           required
           error={headingError}
           name="scientificResearch-heading"
         />

         <TextInputField
           label="Опис"
           value={description}
           onChange={onDescriptionChange}
           maxChars={300}
           multiline
           required
           error={descriptionError}
           name="scientificResearch-description"
         />

         <Box className={styles.referencesList}>
           <Typography variant="subtitle1" className={styles.referencesTitle}>
             Список досліджень
           </Typography>

           {references.map((reference) => (
             <ScientificReferenceEntry
               key={reference.id}
               reference={reference}
               onChange={(field, value) => onReferenceChange(reference.id, field, value)}
               onToggle={() => onReferenceToggle(reference.id)}
               onDelete={() => onReferenceDelete(reference.id)}
               canDelete={canDelete}
               errors={referenceErrors[reference.id]}
             />
           ))}

           <Button
             variant="outlined"
             startIcon={<AddIcon />}
             onClick={onReferenceAdd}
             disabled={!canAddNew}
             className={styles.addButton}
           >
             Додати +
           </Button>
         </Box>
       </Box>
     );
   };
   ```

2. **src/components/admin/hippotherapy/sections/scientific-references/ScientificReferenceEntry.tsx**
   ```typescript
   import React from 'react';
   import { Box, IconButton, Collapse, Paper, Typography } from '@mui/material';
   import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
   import DeleteIcon from '@mui/icons-material/Delete';
   import { ScientificReference } from '@/types/admin/hippotherapy.types';
   import { TextInputField } from '../../shared/text-input-field';
   import { ConfirmationModal } from '../../shared/confirmation-modal';
   import styles from './ScientificReferenceEntry.module.scss';

   export interface ScientificReferenceEntryProps {
     reference: ScientificReference;
     onChange: (field: 'name' | 'link', value: string) => void;
     onToggle: () => void;
     onDelete: () => void;
     canDelete: boolean;
     errors?: { name?: string; link?: string };
   }

   export const ScientificReferenceEntry: React.FC<ScientificReferenceEntryProps> = ({
     reference,
     onChange,
     onToggle,
     onDelete,
     canDelete,
     errors
   }) => {
     const [showDeleteModal, setShowDeleteModal] = React.useState(false);

     const handleDeleteClick = () => {
       if (canDelete) {
         setShowDeleteModal(true);
       }
     };

     const handleDeleteConfirm = () => {
       onDelete();
       setShowDeleteModal(false);
     };

     const displayTitle = reference.name || 'Нова публікація';

     return (
       <>
         <Paper className={styles.referenceEntry} elevation={1}>
           <Box className={styles.header} onClick={onToggle}>
             <Typography className={styles.title}>{displayTitle}</Typography>
             <Box className={styles.actions}>
               {canDelete && (
                 <IconButton
                   size="small"
                   onClick={(e) => {
                     e.stopPropagation();
                     handleDeleteClick();
                   }}
                   aria-label="delete reference"
                 >
                   <DeleteIcon />
                 </IconButton>
               )}
               <IconButton
                 size="small"
                 className={`${styles.expandIcon} ${reference.isExpanded ? styles.expanded : ''}`}
               >
                 <ExpandMoreIcon />
               </IconButton>
             </Box>
           </Box>

           <Collapse in={reference.isExpanded}>
             <Box className={styles.content}>
               <TextInputField
                 label="Назва"
                 value={reference.name}
                 onChange={(value) => onChange('name', value)}
                 maxChars={150}
                 required
                 error={errors?.name}
                 name={`reference-${reference.id}-name`}
               />

               <TextInputField
                 label="Посилання"
                 value={reference.link}
                 onChange={(value) => onChange('link', value)}
                 maxChars={1000}
                 required
                 error={errors?.link}
                 name={`reference-${reference.id}-link`}
               />
             </Box>
           </Collapse>
         </Paper>

         <ConfirmationModal
           open={showDeleteModal}
           title="Видалити наукове дослідження?"
           onConfirm={handleDeleteConfirm}
           onCancel={() => setShowDeleteModal(false)}
           confirmLabel="ТАК"
           cancelLabel="НІ"
         />
       </>
     );
   };
   ```

3. **SCSS files for both components**

4. **Test files**

## Dependencies
- US04 (TextInputField)
- US06 (ConfirmationModal)

## Estimated Effort
**8 hours**

## Definition of Done
- Section renders with heading, description, and references list
- Collapse/expand works for each entry
- Add button enables/disables correctly
- Delete works with confirmation
- Last entry cannot be deleted
- Validation works for all fields
- Character counters display
- Tests passing
- Code review completed
