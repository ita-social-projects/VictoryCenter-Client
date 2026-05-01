import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Select } from '@/components/common/select/Select';
import { Modal } from '@/components/common/modal/Modal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesProgram } from '@/types/admin/reports';
import { getReportingYearOptions } from '@/utils/functions/get-reporting-year-options/get-reporting-year-options';
import styles from './AddProgramExpenseRecordModal.module.scss';

interface AddProgramExpenseRecordModalProps {
    isOpen: boolean;
    programs: ProgramExpensesProgram[];
    exchangeRate: string | null;
    onClose: () => void;
}

interface ProgramExpenseFormState {
    reportingYear: string | undefined;
    programId: number | undefined;
    amountUah: string;
    amountUsd: string;
}

const INITIAL_FORM_STATE: ProgramExpenseFormState = {
    reportingYear: undefined,
    programId: undefined,
    amountUah: '',
    amountUsd: '',
};

const PROGRAM_EXPENSE_AMOUNT_MAX_LENGTH = 12;

const normalizeProgramExpenseAmountInput = (value: string): string => {
    const withCommaSeparator = value.replaceAll('.', ',').replaceAll(/\s/g, '');
    const firstCommaIndex = withCommaSeparator.indexOf(',');
    const integerSource = firstCommaIndex === -1 ? withCommaSeparator : withCommaSeparator.slice(0, firstCommaIndex);
    const integerPart = integerSource.replaceAll(/\D/g, '').slice(0, 9);

    if (firstCommaIndex === -1) {
        return integerPart;
    }

    if (!integerPart) {
        return '';
    }

    const decimalPart = withCommaSeparator
        .slice(firstCommaIndex + 1)
        .replaceAll(/\D/g, '')
        .slice(0, 2);

    return `${integerPart},${decimalPart}`;
};

export const AddProgramExpenseRecordModal = ({
    isOpen,
    programs,
    exchangeRate,
    onClose,
}: AddProgramExpenseRecordModalProps) => {
    const yearOptions = useMemo(() => getReportingYearOptions(), []);
    const programOptions = useMemo(
        () =>
            [...programs].sort((firstProgram, secondProgram) =>
                firstProgram.name.localeCompare(secondProgram.name, 'uk'),
            ),
        [programs],
    );

    const [formState, setFormState] = useState<ProgramExpenseFormState>(INITIAL_FORM_STATE);
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setFormState(INITIAL_FORM_STATE);
            setIsCloseConfirmOpen(false);
        }
    }, [isOpen]);

    const isDirty =
        Boolean(formState.reportingYear) ||
        Boolean(formState.programId) ||
        formState.amountUah.trim() !== '' ||
        formState.amountUsd.trim() !== '';

    const handleAmountChange = (field: 'amountUah' | 'amountUsd', value: string) => {
        const normalizedValue = normalizeProgramExpenseAmountInput(value);

        setFormState((previousState) => ({
            ...previousState,
            [field]: normalizedValue,
        }));
    };

    const handleRequestClose = useCallback(() => {
        if (isDirty) {
            setIsCloseConfirmOpen(true);
            return;
        }

        onClose();
    }, [isDirty, onClose]);

    const handleConfirmClose = useCallback(() => {
        setIsCloseConfirmOpen(false);
        onClose();
    }, [onClose]);

    const handleCancelClose = useCallback(() => {
        setIsCloseConfirmOpen(false);
    }, []);

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
                            <div className={styles.field}>
                                <label className={styles.label}>
                                    {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_LABEL}
                                </label>
                                <Select<string>
                                    value={formState.reportingYear}
                                    onValueChange={(reportingYear) =>
                                        setFormState((previousState) => ({
                                            ...previousState,
                                            reportingYear,
                                        }))
                                    }
                                    placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_PLACEHOLDER}
                                    className={styles.select}
                                    optionClassName={styles['select-option']}
                                >
                                    {yearOptions.map((year) => (
                                        <Select.Option key={year} value={year} name={year} />
                                    ))}
                                </Select>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>{PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_LABEL}</label>
                                {programOptions.length === 0 ? (
                                    <div className={styles['disabled-select-placeholder']}>
                                        {PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_NO_AVAILABLE}
                                    </div>
                                ) : (
                                    <Select<number>
                                        value={formState.programId}
                                        onValueChange={(programId) =>
                                            setFormState((previousState) => ({
                                                ...previousState,
                                                programId,
                                            }))
                                        }
                                        placeholder={PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER}
                                        className={styles.select}
                                        optionClassName={styles['select-option']}
                                    >
                                        {programOptions.map((program) => (
                                            <Select.Option key={program.id} value={program.id} name={program.name} />
                                        ))}
                                    </Select>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>
                                    {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_UAH_LABEL}
                                </label>
                                <InputWithCharacterLimit
                                    id="add-program-expense-amount-uah"
                                    name="amountUah"
                                    type="text"
                                    value={formState.amountUah}
                                    onChange={(event) => handleAmountChange('amountUah', event.target.value)}
                                    maxLength={PROGRAM_EXPENSE_AMOUNT_MAX_LENGTH}
                                    showCounter={false}
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.field}>
                                <div className={styles['amount-usd-header']}>
                                    <label className={styles.label}>
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
                                    maxLength={PROGRAM_EXPENSE_AMOUNT_MAX_LENGTH}
                                    showCounter={false}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <Button buttonStyle="primary" disabled className={styles.submit}>
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
