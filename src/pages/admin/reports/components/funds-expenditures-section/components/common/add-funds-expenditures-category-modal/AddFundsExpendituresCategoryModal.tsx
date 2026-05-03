import { FocusEvent, useCallback, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Select } from '@/components/common/select/Select';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { FundsExpendituresTransactionType, ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import {
    validateFundsExpendituresCategoryName,
    validateFundsExpendituresCategoryType,
} from '@/validation/admin/reports-schema/funds-expenditures-category-schema/funds-expenditures-category-schema';
import styles from './AddFundsExpendituresCategoryModal.module.scss';

interface AddFundsExpendituresCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories?: ReportFundsExpendituresCategory[];
    onSubmit?: (data: { name: string; type: FundsExpendituresTransactionType }) => Promise<boolean>;
}

export const AddFundsExpendituresCategoryModal = ({
    isOpen,
    onClose,
    categories = [],
    onSubmit,
}: AddFundsExpendituresCategoryModalProps) => {
    const [type, setType] = useState<FundsExpendituresTransactionType | undefined>(undefined);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<string | undefined>(undefined);
    const [typeError, setTypeError] = useState<string | undefined>(undefined);
    const [hasNameBeenBlurred, setHasNameBeenBlurred] = useState(false);
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const typeSelectRef = useRef<HTMLDivElement | null>(null);

    const isDirty = type !== undefined || name.trim().length > 0;

    const isSubmitDisabled = useMemo(
        () =>
            validateFundsExpendituresCategoryType(type) !== undefined ||
            validateFundsExpendituresCategoryName(name, type, categories) !== undefined,
        [type, name, categories],
    );

    const resetForm = useCallback(() => {
        setName('');
        setType(undefined);
        setNameError(undefined);
        setTypeError(undefined);
        setHasNameBeenBlurred(false);
        setIsSubmitting(false);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!type || !onSubmit) return;
        setIsSubmitting(true);
        const success = await onSubmit({ name: getNormalizedInputText(name), type });
        if (success) {
            resetForm();
            onClose();
        } else {
            setIsSubmitting(false);
        }
    }, [type, name, onSubmit, resetForm, onClose]);

    const handleTypeChange = useCallback(
        (newType: FundsExpendituresTransactionType) => {
            setType(newType);
            setTypeError(undefined);
            if (hasNameBeenBlurred) {
                setNameError(validateFundsExpendituresCategoryName(name, newType, categories));
            }
        },
        [hasNameBeenBlurred, name, categories],
    );

    const handleTypeFieldBlur = useCallback(
        (event: FocusEvent<HTMLDivElement>) => {
            if (typeSelectRef.current?.contains(event.relatedTarget as Node | null)) return;
            setTypeError(validateFundsExpendituresCategoryType(type));
        },
        [type],
    );

    const handleNameBlur = useCallback(() => {
        setHasNameBeenBlurred(true);
        setName(getNormalizedInputText(name));
        setNameError(validateFundsExpendituresCategoryName(name, type, categories));
    }, [name, type, categories]);

    const handleRequestClose = useCallback(() => {
        if (isDirty) {
            setIsCloseConfirmOpen(true);
            return;
        }
        resetForm();
        onClose();
    }, [isDirty, onClose, resetForm]);

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
                        <h2 className={styles.title}>{FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.TITLE}</h2>
                        <p className={styles.subtitle}>{FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.SUBTITLE}</p>
                    </div>
                </Modal.Title>

                <Modal.Content>
                    <div className={styles.content}>
                        <div className={styles.panel}>
                            <div className={styles.form}>
                                <div className={styles.field} onBlurCapture={handleTypeFieldBlur}>
                                    <label className={styles.label}>
                                        <span className={styles.required}>*</span>
                                        {FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.TYPE_LABEL}
                                    </label>
                                    <Select<FundsExpendituresTransactionType>
                                        value={type}
                                        onValueChange={handleTypeChange}
                                        selectContainerRef={typeSelectRef}
                                        placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.TYPE_PLACEHOLDER}
                                        className={styles.selectContainer}
                                        headClassName={cn(styles.selectHead, {
                                            [styles.selectHeadError]: Boolean(typeError),
                                        })}
                                    >
                                        <Select.Option
                                            value="expense"
                                            name={FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.EXPENSE}
                                        />
                                        <Select.Option
                                            value="income"
                                            name={FUNDS_EXPENDITURES_TEXT.TABLE.TYPE_LABELS.INCOME}
                                        />
                                    </Select>
                                    <p className={cn(styles.error, { [styles.errorHidden]: !typeError })}>
                                        {typeError ?? ' '}
                                    </p>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        <span className={styles.required}>*</span>
                                        {FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.NAME_LABEL}
                                    </label>
                                    <div className={cn({ [styles.inputError]: Boolean(nameError) })}>
                                        <InputWithCharacterLimit
                                            id="category-name"
                                            name="categoryName"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onBlur={handleNameBlur}
                                            maxLength={FUNDS_EXPENDITURES_VALIDATION.categoryNameMax}
                                            maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                                                FUNDS_EXPENDITURES_VALIDATION.categoryNameMax,
                                            )}
                                            placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.NAME_PLACEHOLDER}
                                            showCounter={true}
                                            hasError={Boolean(nameError)}
                                            className={styles.input}
                                        />
                                    </div>
                                    <p className={cn(styles.error, { [styles.errorHidden]: !nameError })}>
                                        {nameError ?? ' '}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Content>

                <Modal.Actions>
                    <div className={styles.actions}>
                        <Button
                            buttonStyle="primary"
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled || isSubmitting}
                            className={styles.submit}
                        >
                            {FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.SUBMIT_BUTTON}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

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
