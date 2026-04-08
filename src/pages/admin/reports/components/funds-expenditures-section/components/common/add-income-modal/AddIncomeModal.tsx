import { useCallback, useEffect, useMemo, useState } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimit } from '@/components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Select } from '@/components/common/select/Select';
import { FundsRecordModal } from '@/pages/admin/reports/components/funds-expenditures-section/components/common/funds-record-modal/FundsRecordModal';
import {
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
    FundsExpendituresTransactionType,
} from '@/types/admin/reports';
import { ReactComponent as InfoIcon } from '@/assets/icons/info.svg';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import { getReportingYearOptions } from '@/utils/functions/get-reporting-year-options/get-reporting-year-options';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
    validateFundsExpendituresCategory,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';
import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';
import styles from './AddIncomeModal.module.scss';

interface AddIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: ReportFundsExpendituresCategory[];
    records: ReportFundsExpendituresRecord[];
    exchangeRate: string | null;
    onSubmit: (data: {
        categoryId: number;
        reportingYear: string;
        amountUah: string;
        amountUsd: string;
        type: FundsExpendituresTransactionType;
    }) => Promise<boolean>;
}

interface AddIncomeFormState {
    reportingYear: string | undefined;
    categoryId: number | undefined;
    amountUah: string;
    amountUsd: string;
    errors: {
        reportingYear?: string;
        categoryId?: string;
        amountUah?: string;
        amountUsd?: string;
    };
}

const INITIAL_STATE: AddIncomeFormState = {
    reportingYear: undefined,
    categoryId: undefined,
    amountUah: '',
    amountUsd: '',
    errors: {},
};

export const AddIncomeModal = ({
    isOpen,
    onClose,
    categories,
    records,
    exchangeRate,
    onSubmit,
}: AddIncomeModalProps) => {
    const [formState, setFormState] = useState<AddIncomeFormState>(INITIAL_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
    const [usdMismatchMessage, setUsdMismatchMessage] = useState<string | undefined>();

    const incomeCategories = useMemo(() => {
        return categories
            .filter((category) => category.type === 'income')
            .sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    }, [categories]);

    const yearOptions = useMemo(() => getReportingYearOptions(), []);

    const isCategorySelectDisabled = incomeCategories.length === 0;

    useEffect(() => {
        if (isCategorySelectDisabled) {
            setFormState((prev) => ({
                ...prev,
                categoryId: undefined,
                errors: {
                    ...prev.errors,
                    categoryId: undefined,
                },
            }));
        }
    }, [isCategorySelectDisabled]);

    const resetForm = useCallback(() => {
        setFormState(INITIAL_STATE);
        setIsSubmitting(false);
        setUsdMismatchMessage(undefined);
    }, []);

    const handleClose = useCallback(() => {
        setIsAddConfirmationOpen(false);
        resetForm();
        onClose();
    }, [onClose, resetForm]);

    const getCategoryError = useCallback(
        (categoryId: number | undefined, trigger: 'change' | 'blur'): string | undefined => {
            return validateFundsExpendituresCategory({
                recordId: 0,
                recordType: 'income',
                categoryId,
                records,
                trigger,
            });
        },
        [records],
    );

    const handleAmountChange = useCallback(
        (value: string) => {
            setFormState((prev) => ({
                ...prev,
                ...updateFundsAmounts('amountUah', value, exchangeRate, 'change')(prev),
            }));
            setUsdMismatchMessage(undefined);
        },
        [exchangeRate],
    );

    const handleAmountBlur = useCallback(
        (field: 'amountUah' | 'amountUsd') => {
            if (field === 'amountUsd') {
                setFormState((prev) => {
                    const normalizedAmountUsd = normalizeFundsExpendituresAmountInput(prev.amountUsd, true);
                    const amountUsdError = validateFundsExpendituresAmount(normalizedAmountUsd, 'blur');

                    const hasMismatch = isUsdAmountMismatch(prev.amountUah, normalizedAmountUsd, exchangeRate);
                    setUsdMismatchMessage(
                        hasMismatch ? FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH : undefined,
                    );

                    return {
                        ...prev,
                        amountUsd: normalizedAmountUsd,
                        errors: {
                            ...prev.errors,
                            amountUsd: amountUsdError,
                        },
                    };
                });

                return;
            }

            setFormState((prev) => {
                const updated = {
                    ...prev,
                    ...updateFundsAmounts(field, prev[field], exchangeRate, 'blur')(prev),
                };

                setUsdMismatchMessage(undefined);

                return updated;
            });
        },
        [exchangeRate],
    );

    const handleUsdChange = useCallback((value: string) => {
        setFormState((prev) => ({
            ...prev,
            amountUsd: value,
            errors: {
                ...prev.errors,
                amountUsd: undefined,
            },
        }));
        setUsdMismatchMessage(undefined);
    }, []);

    const handleSubmit = useCallback(async () => {
        const normalizedAmountUah = normalizeFundsExpendituresAmountInput(formState.amountUah, true);
        const normalizedAmountUsd = normalizeFundsExpendituresAmountInput(formState.amountUsd, true);

        const nextErrors = {
            reportingYear: formState.reportingYear ? undefined : COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            categoryId: getCategoryError(formState.categoryId, 'blur'),
            amountUah: validateFundsExpendituresAmount(normalizedAmountUah, 'save'),
            amountUsd: validateFundsExpendituresAmount(normalizedAmountUsd, 'save'),
        };

        setFormState((prev) => ({
            ...prev,
            amountUah: normalizedAmountUah,
            amountUsd: normalizedAmountUsd,
            errors: nextErrors,
        }));

        if (nextErrors.reportingYear || nextErrors.categoryId || nextErrors.amountUah || nextErrors.amountUsd) {
            return;
        }

        if (!formState.reportingYear || !formState.categoryId) {
            return;
        }

        setIsSubmitting(true);
        try {
            const isCreated = await onSubmit({
                categoryId: formState.categoryId,
                reportingYear: formState.reportingYear,
                amountUah: normalizedAmountUah,
                amountUsd: normalizedAmountUsd,
                type: 'income',
            });

            if (isCreated) {
                resetForm();
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formState, getCategoryError, onSubmit, resetForm]);

    const isDirty =
        Boolean(formState.reportingYear) ||
        Boolean(formState.categoryId) ||
        formState.amountUah.trim() !== '' ||
        formState.amountUsd.trim() !== '';

    const isSubmitDisabled =
        isSubmitting ||
        !formState.reportingYear ||
        !formState.categoryId ||
        !formState.amountUah.trim() ||
        !formState.amountUsd.trim() ||
        Boolean(formState.errors.reportingYear) ||
        Boolean(formState.errors.categoryId) ||
        Boolean(formState.errors.amountUah) ||
        Boolean(formState.errors.amountUsd);

    const handleOpenAddConfirmation = useCallback(() => {
        setIsAddConfirmationOpen(true);
    }, []);

    const handleConfirmAdd = useCallback(async () => {
        setIsAddConfirmationOpen(false);
        await handleSubmit();
    }, [handleSubmit]);

    return (
        <>
            <FundsRecordModal
                isOpen={isOpen}
                title={FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.TITLE}
                subtitle={FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.SUBTITLE}
                submitButtonLabel={FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.SUBMIT_BUTTON}
                isSubmitDisabled={isSubmitDisabled}
                isDirty={isDirty}
                onSubmit={handleOpenAddConfirmation}
                onClose={handleClose}
                closeConfirmationTitle={FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CONFIRM_CLOSE_TITLE}
            >
                <div className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <span className={styles.required}>*</span>
                            {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.REPORTING_YEAR_LABEL}
                        </label>
                        <Select<string>
                            value={formState.reportingYear}
                            onValueChange={(value) => {
                                setFormState((prev) => ({
                                    ...prev,
                                    reportingYear: value,
                                    errors: {
                                        ...prev.errors,
                                        reportingYear: undefined,
                                    },
                                }));
                            }}
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

                    <div className={styles.field}>
                        <label className={styles.label}>
                            <span className={styles.required}>*</span>
                            {FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.CATEGORY_LABEL}
                        </label>
                        {isCategorySelectDisabled ? (
                            <div
                                className={styles['disabled-select-placeholder']}
                                data-testid="income-category-disabled-placeholder"
                            >
                                {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.CATEGORY_NO_AVAILABLE}
                            </div>
                        ) : (
                            <Select<number>
                                value={formState.categoryId}
                                onValueChange={(value) => {
                                    setFormState((prev) => ({
                                        ...prev,
                                        categoryId: value,
                                        errors: {
                                            ...prev.errors,
                                            categoryId: getCategoryError(value, 'change'),
                                        },
                                    }));
                                }}
                                placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.CATEGORY_PLACEHOLDER}
                                className={styles.select}
                                optionClassName={styles['select-option']}
                            >
                                {incomeCategories.map((category) => (
                                    <Select.Option key={category.id} value={category.id} name={category.name} />
                                ))}
                            </Select>
                        )}
                        {formState.errors.categoryId && <p className={styles.error}>{formState.errors.categoryId}</p>}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            <span className={styles.required}>*</span>
                            {FUNDS_EXPENDITURES_TEXT.MODAL.SHARED.AMOUNT_UAH_LABEL}
                        </label>
                        <InputWithCharacterLimit
                            id="add-income-amount-uah"
                            name="amountUah"
                            type="text"
                            value={formState.amountUah}
                            onChange={(event) => handleAmountChange(event.target.value)}
                            onBlur={() => handleAmountBlur('amountUah')}
                            maxLength={20}
                            showCounter={false}
                            className={styles.input}
                            hasError={Boolean(formState.errors.amountUah)}
                        />
                        {formState.errors.amountUah && <p className={styles.error}>{formState.errors.amountUah}</p>}
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
                                />
                            </div>
                        </div>
                        <InputWithCharacterLimit
                            id="add-income-amount-usd"
                            name="amountUsd"
                            type="text"
                            value={formState.amountUsd}
                            onChange={(event) => handleUsdChange(event.target.value)}
                            onBlur={() => handleAmountBlur('amountUsd')}
                            maxLength={20}
                            showCounter={false}
                            className={styles.input}
                            hasError={Boolean(formState.errors.amountUsd)}
                        />
                        {formState.errors.amountUsd && <p className={styles.error}>{formState.errors.amountUsd}</p>}
                        {usdMismatchMessage && (
                            <div className={styles.info}>
                                <InfoIcon className={styles['info-icon']} aria-hidden="true" />
                                <p className={styles['info-text']}>{usdMismatchMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            </FundsRecordModal>

            <ConfirmationModal
                isOpen={isAddConfirmationOpen}
                title={FUNDS_EXPENDITURES_TEXT.MODAL.INCOME.CONFIRM_ADD_TITLE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={() => handleConfirmAdd()}
                onCancel={() => setIsAddConfirmationOpen(false)}
                onClose={() => setIsAddConfirmationOpen(false)}
                isButtonsDisabled={isSubmitting}
            />
        </>
    );
};
