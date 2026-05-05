import { useCallback, useState } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { Select } from '@/components/common/select/Select';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { HintBox } from '@/components/admin/hint-box/HintBox';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { ReportFundsExpendituresCategory, ReportFundsExpendituresRecord } from '@/types/admin/reports';
import styles from './DeleteFundsExpendituresCategoryModal.module.scss';

interface DeleteFundsExpendituresCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ReportFundsExpendituresCategory[];
    records: ReportFundsExpendituresRecord[];
    onSubmit: (categoryId: number) => Promise<boolean>;
}

export const DeleteFundsExpendituresCategoryModal = ({
    isOpen,
    onClose,
    categories,
    records,
    onSubmit,
}: DeleteFundsExpendituresCategoryModalProps) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
    const hasRecord = records.some((r) => r.categoryId === selectedCategoryId);

    const recordError =
        selectedCategory && hasRecord
            ? selectedCategory.type === 'income'
                ? FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.HAS_INCOME_RECORD
                : FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.ERROR.HAS_EXPENSE_RECORD
            : undefined;

    const resetForm = useCallback(() => {
        setSelectedCategoryId(undefined);
        setIsConfirmOpen(false);
        setIsSubmitting(false);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    const handleDeleteClick = useCallback(() => {
        setIsConfirmOpen(true);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!selectedCategoryId) return;
        setIsSubmitting(true);
        const success = await onSubmit(selectedCategoryId);
        if (success) {
            setIsConfirmOpen(false);
            resetForm();
            onClose();
        } else {
            setIsSubmitting(false);
            setIsConfirmOpen(false);
        }
    }, [selectedCategoryId, onSubmit, resetForm, onClose]);

    const handleCancelConfirm = useCallback(() => {
        setIsConfirmOpen(false);
    }, []);

    const isDeleteDisabled = !selectedCategoryId || hasRecord || isSubmitting;

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} className={styles.modal} maxWidth="650px">
                <Modal.Title>
                    <h2 className={styles.title}>{FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.TITLE}</h2>
                </Modal.Title>

                <Modal.Content>
                    <div className={styles.content}>
                        <div className={styles.panel}>
                            <div className={styles.field}>
                                <div className={styles.labelRow}>
                                    <label className={styles.label}>
                                        {FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.CATEGORY_LABEL}
                                    </label>
                                    {selectedCategory && (
                                        <span className={styles.type}>
                                            {selectedCategory.type === 'income'
                                                ? FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME
                                                : FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE}
                                        </span>
                                    )}
                                </div>
                                <Select<number | undefined>
                                    value={selectedCategoryId}
                                    onValueChange={(val) => setSelectedCategoryId(val as number)}
                                    placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.CATEGORY_PLACEHOLDER}
                                    className={styles.selectContainer}
                                    headClassName={styles.selectHead}
                                >
                                    {categories.map((c) => (
                                        <Select.Option key={c.id} value={c.id} name={c.name} />
                                    ))}
                                </Select>
                            </div>

                            {recordError && <HintBox title={recordError} />}
                        </div>
                    </div>
                </Modal.Content>

                <Modal.Actions>
                    <div className={styles.actions}>
                        <Button buttonStyle="secondary" onClick={handleClose} disabled={isSubmitting}>
                            {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                        </Button>
                        <Button
                            buttonStyle="primary"
                            onClick={handleDeleteClick}
                            disabled={isDeleteDisabled}
                            className={styles.deleteButton}
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.DELETE}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                title={FUNDS_EXPENDITURES_TEXT.MODAL.DELETE_CATEGORY.CONFIRM_TITLE}
                onConfirm={handleConfirm}
                onCancel={handleCancelConfirm}
                onClose={handleCancelConfirm}
                isButtonsDisabled={isSubmitting}
            />
        </>
    );
};
