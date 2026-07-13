import { useCallback, useMemo, useState } from 'react';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { validateFundsExpendituresCategoryName } from '@/validation/admin/reports-schema/funds-expenditures-category-schema/funds-expenditures-category-schema';
import styles from './EditFundsExpendituresCategoryModal.module.scss';

interface EditFundsExpendituresCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ReportFundsExpendituresCategory[];
    onSubmit: (categoryId: number, name: string) => Promise<boolean>;
}

export const EditFundsExpendituresCategoryModal = ({
    isOpen,
    onClose,
    categories,
    onSubmit,
}: EditFundsExpendituresCategoryModalProps) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<string | undefined>(undefined);
    const [hasNameBeenBlurred, setHasNameBeenBlurred] = useState(false);
    const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

    const otherCategories = useMemo(
        () => categories.filter((c) => c.id !== selectedCategoryId),
        [categories, selectedCategoryId],
    );

    const isDirty = name.trim().length > 0;

    const isSubmitDisabled = useMemo(
        () =>
            !selectedCategoryId ||
            name.trim() === selectedCategory?.name.trim() ||
            validateFundsExpendituresCategoryName(name, selectedCategory?.type, otherCategories) !== undefined,
        [selectedCategoryId, name, selectedCategory?.name, selectedCategory?.type, otherCategories],
    );

    const resetForm = useCallback(() => {
        setSelectedCategoryId(undefined);
        setName('');
        setNameError(undefined);
        setHasNameBeenBlurred(false);
        setIsConfirmSaveOpen(false);
        setIsCloseConfirmOpen(false);
        setIsSubmitting(false);
    }, []);

    const handleCategoryChange = useCallback(
        (id: number | undefined) => {
            setSelectedCategoryId(id);
            if (hasNameBeenBlurred) {
                const newSelected = categories.find((c) => c.id === id);
                const others = categories.filter((c) => c.id !== id);
                setNameError(validateFundsExpendituresCategoryName(name, newSelected?.type, others));
            }
        },
        [hasNameBeenBlurred, name, categories],
    );

    const handleNameBlur = useCallback(() => {
        setHasNameBeenBlurred(true);
        setName(getNormalizedInputText(name));
        setNameError(validateFundsExpendituresCategoryName(name, selectedCategory?.type, otherCategories));
    }, [name, selectedCategory?.type, otherCategories]);

    const handleSaveClick = useCallback(() => {
        setIsConfirmSaveOpen(true);
    }, []);

    const handleConfirmSave = useCallback(async () => {
        if (!selectedCategoryId) return;
        setIsSubmitting(true);
        const success = await onSubmit(selectedCategoryId, getNormalizedInputText(name));
        if (success) {
            resetForm();
            onClose();
        } else {
            setIsSubmitting(false);
            setIsConfirmSaveOpen(false);
        }
    }, [selectedCategoryId, name, onSubmit, resetForm, onClose]);

    const handleCancelSave = useCallback(() => {
        setIsConfirmSaveOpen(false);
    }, []);

    const handleRequestClose = useCallback(() => {
        if (isDirty) {
            setIsCloseConfirmOpen(true);
            return;
        }
        resetForm();
        onClose();
    }, [isDirty, resetForm, onClose]);

    const handleConfirmClose = useCallback(() => {
        setIsCloseConfirmOpen(false);
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    const handleCancelClose = useCallback(() => {
        setIsCloseConfirmOpen(false);
    }, []);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleRequestClose} className={styles.modal} maxWidth="650px">
                <Modal.Title>
                    <div className={styles.header}>
                        <h2 className={styles.title}>{FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.TITLE}</h2>
                        <p className={styles.subtitle}>{FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.SUBTITLE}</p>
                    </div>
                </Modal.Title>

                <Modal.Content>
                    <div className={styles.content}>
                        <div className={styles.panel}>
                            <div className={styles.form}>
                                <div className={styles.field}>
                                    <SingleSelectInputGroup<ReportFundsExpendituresCategory>
                                        id="edit-category-select"
                                        label={FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CATEGORY_LABEL}
                                        isRequired
                                        options={categories}
                                        value={selectedCategory}
                                        onChange={(val) => handleCategoryChange(val?.id)}
                                        getOptionId={(c) => c.id}
                                        getOptionName={(c) => c.name}
                                        placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CATEGORY_PLACEHOLDER}
                                    />
                                    {selectedCategory && (
                                        <span className={styles.type}>
                                            {selectedCategory.type === 'income'
                                                ? FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME
                                                : FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE}
                                        </span>
                                    )}
                                </div>

                                <div className={styles.field}>
                                    <TextAreaWithCharacterLimitGroup
                                        label={FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.NAME_LABEL}
                                        isRequired
                                        id="edit-category-name"
                                        name="editCategoryName"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={handleNameBlur}
                                        maxLength={FUNDS_EXPENDITURES_VALIDATION.categoryNameMax}
                                        maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                                            FUNDS_EXPENDITURES_VALIDATION.categoryNameMax,
                                        )}
                                        placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.NAME_PLACEHOLDER}
                                        error={nameError}
                                        className={styles.input}
                                        rows={1}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Content>

                <Modal.Actions>
                    <div className={styles.actions}>
                        <Button
                            buttonStyle="primary"
                            onClick={handleSaveClick}
                            disabled={isSubmitDisabled || isSubmitting}
                            className={styles.submit}
                        >
                            {FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.SUBMIT_BUTTON}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmSaveOpen}
                title={FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CONFIRM_SAVE_TITLE}
                onConfirm={handleConfirmSave}
                onCancel={handleCancelSave}
                onClose={handleCancelSave}
                isButtonsDisabled={isSubmitting}
            />

            <ConfirmationModal
                isOpen={isCloseConfirmOpen}
                title={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CONFIRM_CLOSE_TITLE}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
            />
        </>
    );
};
