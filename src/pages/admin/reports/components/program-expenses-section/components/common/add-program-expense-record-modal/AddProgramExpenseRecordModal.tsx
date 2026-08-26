import { ChangeEvent, FocusEvent, ReactNode, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Select } from '@/components/common/select/Select';
import { CategoryCombobox } from '@/components/common/category-combobox/CategoryCombobox';
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
    onSubmit: (data: {
        programId: number | undefined;
        programName: string;
        reportingYear: string;
        amountUah: string;
        amountUsd: string;
    }) => Promise<boolean>;
    recordToEdit?: ProgramExpensesRecord | null;
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
    disabled?: boolean;
}

const AmountField = ({
    id,
    name,
    label,
    value,
    error,
    headerAddon,
    footer,
    onChange,
    onBlur,
    disabled = false,
}: AmountFieldProps) => (
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
            disabled={disabled}
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
    onSubmit,
    recordToEdit = null,
}: AddProgramExpenseRecordModalProps) => {
    const yearOptions = useMemo(() => getReportingYearOptions(), []);
    const reportingYearSelectRef = useRef<HTMLDivElement | null>(null);
    const programSelectRef = useRef<HTMLDivElement | null>(null);
    const {
        formState,
        programOptions,
        isDirty,
        isSubmitDisabled,
        isSubmitting,
        isAddConfirmationOpen,
        usdMismatchMessage,
        handleReportingYearChange,
        handleReportingYearBlur,
        handleProgramChange,
        handleProgramInputChange,
        handleProgramBlur,
        handleAmountFieldChange,
        handleAmountBlur,
        handleOpenAddConfirmation,
        handleCloseConfirmation,
        handleConfirmAdd,
        handleSave,
    } = useProgramExpenseRecordForm({
        isOpen,
        programs,
        records,
        exchangeRate,
        recordToEdit,
        onSubmit,
    });

    const isEditMode = Boolean(recordToEdit);
    const titleText = isEditMode ? PROGRAM_EXPENSES_TEXT.MODAL.EDIT.TITLE : PROGRAM_EXPENSES_TEXT.MODAL.ADD.TITLE;
    const subtitleText = isEditMode
        ? PROGRAM_EXPENSES_TEXT.MODAL.EDIT.SUBTITLE
        : PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBTITLE;
    const submitText = isEditMode
        ? PROGRAM_EXPENSES_TEXT.MODAL.EDIT.SUBMIT_BUTTON
        : PROGRAM_EXPENSES_TEXT.MODAL.ADD.SUBMIT_BUTTON;
    const confirmCloseTitle = isEditMode
        ? PROGRAM_EXPENSES_TEXT.MODAL.EDIT.CONFIRM_CLOSE_TITLE
        : PROGRAM_EXPENSES_TEXT.MODAL.ADD.CONFIRM_CLOSE_TITLE;

    const { isCloseConfirmOpen, handleRequestClose, handleConfirmClose, handleCancelClose } =
        useDirtyModalCloseConfirmation({
            isDirty,
            onClose,
        });

    const handleClose = () => {
        if (isSubmitting) return;
        handleRequestClose();
    };

    const handleCloseAddConfirmation = () => {
        if (isSubmitting) return;
        handleCloseConfirmation();
    };

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
            <Modal isOpen={isOpen} onClose={handleClose} className={styles.modal} maxWidth="650px">
                <Modal.Title>
                    <div className={styles.header}>
                        <h2 className={styles.title}>{titleText}</h2>
                        <p className={styles.subtitle}>{subtitleText}</p>
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
                                    disabled={isSubmitting}
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
                                <CategoryCombobox
                                    id="add-program-expense-category"
                                    options={programOptions}
                                    inputValue={formState.programInputValue}
                                    onInputValueChange={handleProgramInputChange}
                                    onOptionSelect={(option) => handleProgramChange(option.id)}
                                    selectContainerRef={programSelectRef}
                                    placeholder={PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER}
                                    className={styles.select}
                                    optionClassName={styles['select-option']}
                                    disabled={isSubmitting}
                                />
                            </SelectField>

                            <AmountField
                                id="add-program-expense-amount-uah"
                                name="amountUah"
                                label={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_UAH_LABEL}
                                value={formState.amountUah}
                                error={formState.errors.amountUah}
                                onChange={(event) => handleAmountFieldChange('amountUah')(event.target.value)}
                                onBlur={() => handleAmountBlur('amountUah')}
                                disabled={isSubmitting}
                            />

                            <AmountField
                                id="add-program-expense-amount-usd"
                                name="amountUsd"
                                label={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_USD_LABEL}
                                value={formState.amountUsd}
                                error={formState.errors.amountUsd}
                                headerAddon={<ExchangeRateChip exchangeRate={exchangeRate} />}
                                onChange={(event) => handleAmountFieldChange('amountUsd')(event.target.value)}
                                onBlur={() => handleAmountBlur('amountUsd')}
                                disabled={isSubmitting}
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
                            <Button
                                buttonStyle="primary"
                                disabled={isSubmitDisabled}
                                className={styles.submit}
                                onClick={isEditMode ? handleSave : handleOpenAddConfirmation}
                            >
                                {submitText}
                            </Button>
                            <Button
                                buttonStyle="secondary"
                                disabled={isSubmitting}
                                onClick={handleRequestClose}
                                className={styles.cancel}
                            >
                                {COMMON_TEXT_ADMIN.BUTTON.CANCEL}
                            </Button>
                        </div>
                    </div>
                </Modal.Content>
                <Modal.Actions>{null}</Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={isCloseConfirmOpen}
                title={confirmCloseTitle}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                onClose={handleCancelClose}
            />

            <ConfirmationModal
                isOpen={isAddConfirmationOpen}
                title={PROGRAM_EXPENSES_TEXT.MODAL.ADD.CONFIRM_ADD_TITLE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={handleConfirmAdd}
                onCancel={handleCloseAddConfirmation}
                onClose={handleCloseAddConfirmation}
                isButtonsDisabled={isSubmitting}
            />
        </>
    );
};
