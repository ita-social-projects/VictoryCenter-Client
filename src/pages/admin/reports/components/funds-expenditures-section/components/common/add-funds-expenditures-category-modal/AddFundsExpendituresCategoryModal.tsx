import { useCallback, useMemo, useState } from 'react';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Select } from '@/components/common/select/Select';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { FundsExpendituresTransactionType } from '@/types/admin/reports';
import styles from './AddFundsExpendituresCategoryModal.module.scss';

interface AddFundsExpendituresCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const normalizeForSave = (value: string) => value.replaceAll(/\s+/g, ' ').trim();

export const AddFundsExpendituresCategoryModal = ({ isOpen, onClose }: AddFundsExpendituresCategoryModalProps) => {
    const [type, setType] = useState<FundsExpendituresTransactionType | undefined>(undefined);
    const [name, setName] = useState('');
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

    const nameMax = FUNDS_EXPENDITURES_VALIDATION.categoryNameMax;
    const isDirty = type !== undefined || name.trim().length > 0;

    const isSubmitDisabled = useMemo(() => {
        return !type || normalizeForSave(name).length === 0;
    }, [type, name]);

    const resetForm = useCallback(() => {
        setName('');
        setType(undefined);
    }, []);

    const handleSubmit = () => {};

    const handleRequestClose = useCallback(() => {
        if (isDirty) {
            setIsCloseConfirmOpen(true);
            return;
        }
        onClose();
    }, [isDirty, onClose]);

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
                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        <span className={styles.required}>*</span>
                                        {FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.TYPE_LABEL}
                                    </label>
                                    <Select<FundsExpendituresTransactionType>
                                        value={type}
                                        onValueChange={(v) => setType(v)}
                                        placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.TYPE_PLACEHOLDER}
                                        className={styles.selectContainer}
                                        headClassName={styles.selectHead}
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
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>
                                        <span className={styles.required}>*</span>
                                        {FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.NAME_LABEL}
                                    </label>
                                    <InputWithCharacterLimit
                                        id="category-name"
                                        name="categoryName"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={() => setName((s) => s.replaceAll(/\s+/g, ' ').trim())}
                                        maxLength={nameMax}
                                        placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.CATEGORY.NAME_PLACEHOLDER}
                                        showCounter={true}
                                        className={styles.input}
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
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled}
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
