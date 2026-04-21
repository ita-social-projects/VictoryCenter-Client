import { useCallback, useEffect, useMemo, useState } from 'react';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import {
    FundsExpendituresTransactionType,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresRecord,
} from '@/types/admin/reports';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
    validateFundsExpendituresCategory,
    validateFundsExpendituresReportingYear,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';
import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';

interface FundsExpendituresRecordFormState {
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

interface UseFundsExpendituresRecordFormParams {
    isOpen: boolean;
    transactionType: FundsExpendituresTransactionType;
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

const INITIAL_STATE: FundsExpendituresRecordFormState = {
    reportingYear: undefined,
    categoryId: undefined,
    amountUah: '',
    amountUsd: '',
    errors: {},
};

export const useFundsExpendituresRecordForm = ({
    isOpen,
    transactionType,
    categories,
    records,
    exchangeRate,
    onSubmit,
}: UseFundsExpendituresRecordFormParams) => {
    const [formState, setFormState] = useState<FundsExpendituresRecordFormState>(INITIAL_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
    const [usdMismatchMessage, setUsdMismatchMessage] = useState<string | undefined>();

    const filteredCategories = useMemo(() => {
        return categories
            .filter((category) => category.type === transactionType)
            .sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    }, [categories, transactionType]);

    const isCategorySelectDisabled = filteredCategories.length === 0;

    useEffect(() => {
        if (!isOpen) {
            setFormState(INITIAL_STATE);
            setIsSubmitting(false);
            setIsAddConfirmationOpen(false);
            setUsdMismatchMessage(undefined);
            return;
        }

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
    }, [isCategorySelectDisabled, isOpen]);

    const getCategoryError = useCallback(
        (categoryId: number | undefined, trigger: 'change' | 'blur'): string | undefined => {
            return validateFundsExpendituresCategory({
                recordId: 0,
                recordType: transactionType,
                categoryId,
                records,
                trigger,
            });
        },
        [records, transactionType],
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

    const handleUsdChange = useCallback(
        (value: string) => {
            setFormState((prev) => ({
                ...prev,
                ...updateFundsAmounts('amountUsd', value, exchangeRate, 'change')(prev),
            }));
            setUsdMismatchMessage(undefined);
        },
        [exchangeRate],
    );

    const handleSubmit = useCallback(async () => {
        const normalizedAmountUah = normalizeFundsExpendituresAmountInput(formState.amountUah, true);
        const normalizedAmountUsd = normalizeFundsExpendituresAmountInput(formState.amountUsd, true);

        const nextErrors = {
            reportingYear: validateFundsExpendituresReportingYear(formState.reportingYear, 'save'),
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

        if (!formState.categoryId) {
            return;
        }

        setIsSubmitting(true);
        try {
            const isCreated = await onSubmit({
                categoryId: formState.categoryId,
                reportingYear: formState.reportingYear ?? '',
                amountUah: normalizedAmountUah,
                amountUsd: normalizedAmountUsd,
                type: transactionType,
            }).catch(() => false);

            if (isCreated) {
                setFormState(INITIAL_STATE);
                setUsdMismatchMessage(undefined);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formState, getCategoryError, onSubmit, transactionType]);

    const isDirty =
        Boolean(formState.reportingYear) ||
        Boolean(formState.categoryId) ||
        formState.amountUah.trim() !== '' ||
        formState.amountUsd.trim() !== '';

    const amountUahValidationError = validateFundsExpendituresAmount(formState.amountUah, 'save');
    const amountUsdValidationError = validateFundsExpendituresAmount(formState.amountUsd, 'save');
    const categoryValidationError = getCategoryError(formState.categoryId, 'blur');
    const reportingYearValidationError = validateFundsExpendituresReportingYear(formState.reportingYear, 'save');

    const isSubmitDisabled =
        isSubmitting ||
        Boolean(reportingYearValidationError) ||
        !formState.categoryId ||
        Boolean(amountUahValidationError) ||
        Boolean(amountUsdValidationError) ||
        Boolean(categoryValidationError);

    const handleOpenAddConfirmation = useCallback(() => {
        setIsAddConfirmationOpen(true);
    }, []);

    const handleConfirmAdd = useCallback(async () => {
        setIsAddConfirmationOpen(false);
        await handleSubmit();
    }, [handleSubmit]);

    const handleCloseConfirmation = useCallback(() => {
        setIsAddConfirmationOpen(false);
    }, []);

    const handleReportingYearChange = useCallback((value: string | undefined) => {
        setFormState((prev) => ({
            ...prev,
            reportingYear: value,
            errors: {
                ...prev.errors,
                reportingYear: validateFundsExpendituresReportingYear(value, 'change'),
            },
        }));
    }, []);

    const handleReportingYearBlur = useCallback(() => {
        setFormState((prev) => ({
            ...prev,
            errors: {
                ...prev.errors,
                reportingYear: validateFundsExpendituresReportingYear(prev.reportingYear, 'blur'),
            },
        }));
    }, []);

    const handleCategoryChange = useCallback(
        (value: number | undefined) => {
            setFormState((prev) => ({
                ...prev,
                categoryId: value,
                errors: {
                    ...prev.errors,
                    categoryId: getCategoryError(value, 'change'),
                },
            }));
        },
        [getCategoryError],
    );

    return {
        formState,
        filteredCategories,
        isCategorySelectDisabled,
        isSubmitting,
        isDirty,
        isSubmitDisabled,
        isAddConfirmationOpen,
        usdMismatchMessage,
        handleReportingYearChange,
        handleReportingYearBlur,
        handleCategoryChange,
        handleAmountChange,
        handleAmountBlur,
        handleUsdChange,
        handleOpenAddConfirmation,
        handleConfirmAdd,
        handleCloseConfirmation,
    };
};
