import { FocusEvent, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Select } from '@/components/common/select/Select';
import { Modal } from '@/components/common/modal/Modal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { useDirtyModalCloseConfirmation } from '@/hooks/admin/use-dirty-modal-close-confirmation/useDirtyModalCloseConfirmation';
import { useProgramExpenseRecordForm } from '@/hooks/admin/use-program-expense-record-form/useProgramExpenseRecordForm';
import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';
import { getReportingYearOptions } from '@/utils/functions/get-reporting-year-options/get-reporting-year-options';
import styles from './AddProgramExpenseRecordModal.module.scss';

interface AddProgramExpenseRecordModalProps {
    isOpen: boolean;
    programs: ProgramExpensesProgram[];
    records: ProgramExpensesRecord[];
    exchangeRate: string | null;
    onClose: () => void;
}

const PROGRAM_EXPENSE_AMOUNT_MAX_LENGTH = 12;

export const AddProgramExpenseRecordModal = ({
    isOpen,
    programs,
    records,
    exchangeRate,
    onClose,
}: AddProgramExpenseRecordModalProps) => {
    const yearOptions = useMemo(() => getReportingYearOptions(), []);
    const reportingYearSelectRef = useRef<HTMLDivElement | null>(null);
    const programSelectRef = useRef<HTMLDivElement | null>(null);
    const {
        formState,
        programOptions,
        isProgramSelectDisabled,
        isDirty,
        isSubmitDisabled,
        handleReportingYearChange,
        handleReportingYearBlur,
        handleProgramChange,
        handleProgramBlur,
        handleAmountChange,
        handleAmountBlur,
    } = useProgramExpenseRecordForm({
        isOpen,
        programs,
        records,
    });

    const { isCloseConfirmOpen, handleRequestClose, handleConfirmClose, handleCancelClose } =
        useDirtyModalCloseConfirmation({
            isDirty,
            onClose,
        });

    useEffect(() => {
        if (!isOpen) {
            handleCancelClose();
        }
    }, [handleCancelClose, isOpen]);

    const handleReportingYearFieldBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (reportingYearSelectRef.current?.contains(event.relatedTarget as Node | null)) {
            return;
        }

        handleReportingYearBlur();
    };

    const handleProgramFieldBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (programSelectRef.current?.contains(event.relatedTarget as Node | null)) {
            return;
        }

        handleProgramBlur();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleRequestClose} className={styles.modal} maxWidth="650px">
                <Modal.Title>
                    <div className={styles.header}>
                        <h2 className={styles.title}>{PROGRAM_EXPENSES_TEXT.MODAL.ADD.TITLE}</h2>
                        <p className={styles.subtitle}>{PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBTITLE}</p>
                    </div>
                </Modal.Title>
                <Modal.Content>
                    <div className={styles.panel}>
                        <div className={styles.form}>
                            <div className={styles.field} onBlurCapture={handleReportingYearFieldBlur}>
                                <label className={styles.label}>
                                    <span className={styles.required}>*</span>
                                    {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_LABEL}
                                </label>
                                <Select<string>
                                    value={formState.reportingYear}
                                    onValueChange={handleReportingYearChange}
                                    selectContainerRef={reportingYearSelectRef}
                                    placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER}
                                    className={styles.select}
                                    optionClassName={styles['select-option']}
                                >
                                    {yearOptions.map((year) => (
                                        <Select.Option key={year} value={year} name={year} />
                                    ))}
                                </Select>
                                {formState.errors.reportingYear && (
                                    <p className={styles.error}>{formState.errors.reportingYear}</p>
                                )}
                            </div>

                            <div className={styles.field} onBlurCapture={handleProgramFieldBlur}>
                                <label className={styles.label}>
                                    <span className={styles.required}>*</span>
                                    {PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_LABEL}
                                </label>
                                {isProgramSelectDisabled ? (
                                    <div className={styles['disabled-select-placeholder']}>
                                        {PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_NO_AVAILABLE}
                                    </div>
                                ) : (
                                    <Select<number>
                                        value={formState.programId}
                                        onValueChange={handleProgramChange}
                                        selectContainerRef={programSelectRef}
                                        placeholder={PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER}
                                        className={styles.select}
                                        optionClassName={styles['select-option']}
                                    >
                                        {programOptions.map((program) => (
                                            <Select.Option key={program.id} value={program.id} name={program.name} />
                                        ))}
                                    </Select>
                                )}
                                {formState.errors.programId && (
                                    <p className={styles.error}>{formState.errors.programId}</p>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>
                                    <span className={styles.required}>*</span>
                                    {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_UAH_LABEL}
                                </label>
                                <InputWithCharacterLimit
                                    id="add-program-expense-amount-uah"
                                    name="amountUah"
                                    type="text"
                                    value={formState.amountUah}
                                    onChange={(event) => handleAmountChange('amountUah', event.target.value)}
                                    onBlur={() => handleAmountBlur('amountUah')}
                                    maxLength={PROGRAM_EXPENSE_AMOUNT_MAX_LENGTH}
                                    showCounter={false}
                                    className={styles.input}
                                    hasError={Boolean(formState.errors.amountUah)}
                                />
                                {formState.errors.amountUah && (
                                    <p className={styles.error}>{formState.errors.amountUah}</p>
                                )}
                            </div>

                            <div className={styles.field}>
                                <div className={styles['amount-usd-header']}>
                                    <label className={styles.label}>
                                        <span className={styles.required}>*</span>
                                        {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_USD_LABEL}
                                    </label>
                                    <div className={styles['exchange-rate-chip']}>
                                        <span className={styles['exchange-rate-chip-label']}>
                                            {FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL}
                                        </span>
                                        <input
                                            type="text"
                                            value={exchangeRate ?? ''}
                                            disabled
                                            className={styles['exchange-rate-value']}
                                            aria-label={FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL}
                                        />
                                    </div>
                                </div>
                                <InputWithCharacterLimit
                                    id="add-program-expense-amount-usd"
                                    name="amountUsd"
                                    type="text"
                                    value={formState.amountUsd}
                                    onChange={(event) => handleAmountChange('amountUsd', event.target.value)}
                                    onBlur={() => handleAmountBlur('amountUsd')}
                                    maxLength={PROGRAM_EXPENSE_AMOUNT_MAX_LENGTH}
                                    showCounter={false}
                                    className={styles.input}
                                    hasError={Boolean(formState.errors.amountUsd)}
                                />
                                {formState.errors.amountUsd && (
                                    <p className={styles.error}>{formState.errors.amountUsd}</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <Button buttonStyle="primary" disabled={isSubmitDisabled} className={styles.submit}>
                                {PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBMIT_BUTTON}
                            </Button>
                            <Button buttonStyle="secondary" onClick={handleRequestClose} className={styles.cancel}>
                                {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                            </Button>
                        </div>
                    </div>
                </Modal.Content>
                <Modal.Actions>{null}</Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={isCloseConfirmOpen}
                title={PROGRAM_EXPENSES_TEXT.MODAL.ADD.CONFIRM_CLOSE_TITLE}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
            />
        </>
    );
};
