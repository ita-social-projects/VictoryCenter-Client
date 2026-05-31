import { ChangeEvent, FocusEvent, ReactNode, useEffect, useMemo, useRef } from 'react';
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
import { ReactComponent as InfoIcon } from '@/assets/icons/info.svg';

interface AddProgramExpenseRecordModalProps {
    isOpen: boolean;
    programs: ProgramExpensesProgram[];
    records: ProgramExpensesRecord[];
    exchangeRate: string | null;
    onClose: () => void;
}

const PROGRAM_EXPENSE_AMOUNT_MAX_LENGTH = 12;

interface RequiredFieldLabelProps {
    children: ReactNode;
}

const RequiredFieldLabel = ({ children }: RequiredFieldLabelProps) => (
    <label className={styles.label}>
        <span className={styles.required}>*</span>
        {children}
    </label>
);

interface FieldErrorProps {
    message?: string;
}

const FieldError = ({ message }: FieldErrorProps) => (message ? <p className={styles.error}>{message}</p> : null);

interface SelectFieldProps {
    label: string;
    error?: string;
    onBlurCapture: (event: FocusEvent<HTMLDivElement>) => void;
    children: ReactNode;
}

const SelectField = ({ label, error, onBlurCapture, children }: SelectFieldProps) => (
    <div className={styles.field} onBlurCapture={onBlurCapture}>
        <RequiredFieldLabel>{label}</RequiredFieldLabel>
        {children}
        <FieldError message={error} />
    </div>
);

interface ExchangeRateChipProps {
    exchangeRate: string | null;
}

const ExchangeRateChip = ({ exchangeRate }: ExchangeRateChipProps) => (
    <div className={styles['exchange-rate-chip']}>
        <span className={styles['exchange-rate-chip-label']}>{FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL}</span>
        <input
            type="text"
            value={exchangeRate ?? ''}
            disabled
            className={styles['exchange-rate-value']}
            aria-label={FUNDS_EXPENDITURES_TEXT.EXCHANGE_RATE_LABEL}
        />
    </div>
);

interface AmountFieldProps {
    id: string;
    name: 'amountUah' | 'amountUsd';
    label: string;
    value: string;
    error?: string;
    headerAddon?: ReactNode;
    footer?: ReactNode;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
}

const AmountField = ({ id, name, label, value, error, headerAddon, footer, onChange, onBlur }: AmountFieldProps) => (
    <div className={styles.field}>
        <div className={headerAddon ? styles['amount-usd-header'] : undefined}>
            <RequiredFieldLabel>{label}</RequiredFieldLabel>
            {headerAddon}
        </div>
        <InputWithCharacterLimit
            id={id}
            name={name}
            type="text"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={PROGRAM_EXPENSE_AMOUNT_MAX_LENGTH}
            showCounter={false}
            className={styles.input}
            hasError={Boolean(error)}
        />
        <FieldError message={error} />
        {footer}
    </div>
);

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
        usdMismatchMessage,
        handleReportingYearChange,
        handleReportingYearBlur,
        handleProgramChange,
        handleProgramBlur,
        handleAmountChange,
        handleUsdChange,
        handleAmountBlur,
    } = useProgramExpenseRecordForm({
        isOpen,
        programs,
        records,
        exchangeRate,
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
                            <SelectField
                                label={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_LABEL}
                                error={formState.errors.reportingYear}
                                onBlurCapture={handleReportingYearFieldBlur}
                            >
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
                            </SelectField>

                            <SelectField
                                label={PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_LABEL}
                                error={formState.errors.programId}
                                onBlurCapture={handleProgramFieldBlur}
                            >
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
                            </SelectField>

                            <AmountField
                                id="add-program-expense-amount-uah"
                                name="amountUah"
                                label={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_UAH_LABEL}
                                value={formState.amountUah}
                                error={formState.errors.amountUah}
                                onChange={(event) => handleAmountChange(event.target.value)}
                                onBlur={() => handleAmountBlur('amountUah')}
                            />

                            <AmountField
                                id="add-program-expense-amount-usd"
                                name="amountUsd"
                                label={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_USD_LABEL}
                                value={formState.amountUsd}
                                error={formState.errors.amountUsd}
                                headerAddon={<ExchangeRateChip exchangeRate={exchangeRate} />}
                                onChange={(event) => handleUsdChange(event.target.value)}
                                onBlur={() => handleAmountBlur('amountUsd')}
                                footer={
                                    usdMismatchMessage && (
                                        <div className={styles.info}>
                                            <InfoIcon className={styles['info-icon']} aria-hidden="true" />
                                            <p className={styles['info-text']}>{usdMismatchMessage}</p>
                                        </div>
                                    )
                                }
                            />
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
