# US06: Shared Components (PublishButton, ConfirmationModal, SuccessToast)

## User Story
**As a** content admin  
**I want** consistent UI components for actions and feedback  
**So that** the admin experience is uniform across all operations

## Acceptance Criteria
- [ ] PublishButton is disabled by default
- [ ] PublishButton becomes active after field changes and validation passes
- [ ] PublishButton shows loading state during save
- [ ] ConfirmationModal displays consistent confirmation dialogs
- [ ] SuccessToast shows success messages and auto-closes after 3 seconds
- [ ] All components follow Material-UI patterns
- [ ] Components are reusable across the Hippotherapy page

## Technical Details

### Files to Create

1. **src/components/admin/hippotherapy/shared/publish-button/PublishButton.tsx**
   ```typescript
   import React from 'react';
   import { Button, CircularProgress } from '@mui/material';
   import PublishIcon from '@mui/icons-material/Publish';
   import styles from './PublishButton.module.scss';

   export interface PublishButtonProps {
     isValid: boolean;
     isDirty: boolean;
     onPublish: () => void;
     isLoading?: boolean;
     disabled?: boolean;
   }

   export const PublishButton: React.FC<PublishButtonProps> = ({
     isValid,
     isDirty,
     onPublish,
     isLoading = false,
     disabled = false
   }) => {
     const isDisabled = !isValid || !isDirty || isLoading || disabled;

     return (
       <Button
         variant="contained"
         color="primary"
         onClick={onPublish}
         disabled={isDisabled}
         startIcon={isLoading ? <CircularProgress size={20} /> : <PublishIcon />}
         className={styles.publishButton}
       >
         {isLoading ? 'Публікація...' : 'Опублікувати'}
       </Button>
     );
   };
   ```

2. **src/components/admin/hippotherapy/shared/publish-button/PublishButton.module.scss**

3. **src/components/admin/hippotherapy/shared/confirmation-modal/ConfirmationModal.tsx**
   ```typescript
   import React from 'react';
   import {
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     Button,
     Typography
   } from '@mui/material';
   import styles from './ConfirmationModal.module.scss';

   export interface ConfirmationModalProps {
     open: boolean;
     title: string;
     message?: string;
     onConfirm: () => void;
     onCancel: () => void;
     confirmLabel?: string;
     cancelLabel?: string;
   }

   export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
     open,
     title,
     message,
     onConfirm,
     onCancel,
     confirmLabel = 'ТАК',
     cancelLabel = 'НІ'
   }) => {
     return (
       <Dialog
         open={open}
         onClose={onCancel}
         className={styles.confirmationModal}
       >
         <DialogTitle>{title}</DialogTitle>
         {message && (
           <DialogContent>
             <Typography>{message}</Typography>
           </DialogContent>
         )}
         <DialogActions>
           <Button onClick={onCancel} color="secondary">
             {cancelLabel}
           </Button>
           <Button onClick={onConfirm} color="primary" variant="contained">
             {confirmLabel}
           </Button>
         </DialogActions>
       </Dialog>
     );
   };
   ```

4. **src/components/admin/hippotherapy/shared/confirmation-modal/ConfirmationModal.module.scss**

5. **Index files for all shared components**

## Dependencies
- Material-UI components

## Estimated Effort
**3 hours**

## Definition of Done
- All three components implemented
- PublishButton state logic works correctly
- ConfirmationModal handles confirm/cancel
- SuccessToast auto-closes
- Basic tests for each component
- Code review completed
