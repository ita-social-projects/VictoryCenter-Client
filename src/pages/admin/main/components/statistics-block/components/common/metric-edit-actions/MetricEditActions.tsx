import { useState } from 'react';

import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';

import styles from './MetricEditActions.module.scss';

interface MetricEditActionsProps {
    isFormDirty: boolean;
    isValid: boolean;
    onCancel: () => void;
    onSave: () => void;
}

export const MetricEditActions = ({ isFormDirty, isValid, onCancel, onSave }: MetricEditActionsProps) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const handleCancelClick = () => {
        if (isFormDirty) {
            setIsCancelModalOpen(true);
        } else {
            onCancel();
        }
    };

    const handleConfirmCancel = () => {
        setIsCancelModalOpen(false);
        onCancel();
    };

    return (
        <>
            <div className={styles.actions}>
                <Button buttonStyle="secondary" onClick={handleCancelClick}>
                    {MAIN_PAGE_TEXT.BUTTONS.CANCEL}
                </Button>
                <Button buttonStyle="primary" onClick={onSave} disabled={!isFormDirty || !isValid}>
                    {MAIN_PAGE_TEXT.BUTTONS.SAVE}
                </Button>
            </div>

            <ConfirmationModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title={MAIN_PAGE_TEXT.BLOCKS.EDIT_PANEL.CANCEL_MODAL_TITLE}
                onConfirm={handleConfirmCancel}
                onCancel={() => setIsCancelModalOpen(false)}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />
        </>
    );
};
