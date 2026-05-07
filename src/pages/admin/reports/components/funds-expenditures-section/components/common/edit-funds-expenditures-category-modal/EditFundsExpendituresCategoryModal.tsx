import { useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Select } from '@/components/common/select/Select';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { validateFundsExpendituresCategoryName } from '@/validation/admin/reports-schema/funds-expenditures-category-schema/funds-expenditures-category-schema';
import styles from './EditFundsExpendituresCategoryModal.module.scss';

const renderInputWithError = (
    input: React.ReactNode,
    error?: string,
    inputErrorClass?: string,
    errorClass?: string,
) => (
    <>
        <div className={cn({ [inputErrorClass || '']: Boolean(error) })}>{input}</div>
        <p className={cn(errorClass, { [styles.errorHidden]: !error })}>{error ?? ' '}</p>
    </>
);

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
        (id: number) => {
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
                                    <div className={styles.labelRow}>
                                        <label className={styles.label}>
                                            <span className={styles.required}>*</span>
                                            {FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CATEGORY_LABEL}
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
                                        onValueChange={(val) => handleCategoryChange(val as number)}
                                        placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.CATEGORY_PLACEHOLDER}
                                        className={styles.selectContainer}
                                        headClassName={styles.selectHead}
                                    >
                                        {categories.map((c) => (
                                            <Select.Option key={c.id} value={c.id} name={c.name} />
                                        ))}
                                    </Select>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        <span className={styles.required}>*</span>
                                        {FUNDS_EXPENDITURES_TEXT.MODAL.EDIT_CATEGORY.NAME_LABEL}
                                    </label>
                                    {renderInputWithError(
                                        <InputWithCharacterLimit
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
                                            showCounter={true}
                                            hasError={Boolean(nameError)}
                                            className={styles.input}
                                        />,
                                        nameError,
                                        styles.inputError,
                                        styles.error,
                                    )}
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
