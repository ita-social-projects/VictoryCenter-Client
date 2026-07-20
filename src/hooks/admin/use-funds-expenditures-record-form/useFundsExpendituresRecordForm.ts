import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getUsdMismatchMessage, useAmountBlur } from '@/hooks/admin/use-amount-blur/useAmountBlur';

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
    const {
        usdMismatchMessage,
        setUsdMismatchMessage,
        handleAmountBlur: handleAmountBlurBase,
    } = useAmountBlur(exchangeRate);

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
    }, [isCategorySelectDisabled, isOpen, setUsdMismatchMessage]);

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
        [exchangeRate, setUsdMismatchMessage],
    );

    const handleAmountBlur = useCallback(
        (field: 'amountUah' | 'amountUsd') => handleAmountBlurBase(field, setFormState),
        [handleAmountBlurBase],
    );

    const handleUsdChange = useCallback(
        (value: string) => {
            setFormState((prev) => ({
                ...prev,
                ...updateFundsAmounts('amountUsd', value, exchangeRate, 'change')(prev),
            }));
            setUsdMismatchMessage(undefined);
        },
        [exchangeRate, setUsdMismatchMessage],
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

        const mismatchMessage = getUsdMismatchMessage(normalizedAmountUah, normalizedAmountUsd, exchangeRate);
        if (mismatchMessage) {
            setUsdMismatchMessage(mismatchMessage);
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
    }, [formState, getCategoryError, onSubmit, transactionType, exchangeRate, setUsdMismatchMessage]);

    const isDirty =
        Boolean(formState.reportingYear) ||
        Boolean(formState.categoryId) ||
        formState.amountUah.trim() !== '' ||
        formState.amountUsd.trim() !== '';

    const amountUahValidationError = validateFundsExpendituresAmount(formState.amountUah, 'save');
    const amountUsdValidationError = validateFundsExpendituresAmount(formState.amountUsd, 'save');
    const categoryValidationError = getCategoryError(formState.categoryId, 'blur');
    const reportingYearValidationError = validateFundsExpendituresReportingYear(formState.reportingYear, 'save');
    const currentUsdMismatchMessage = getUsdMismatchMessage(formState.amountUah, formState.amountUsd, exchangeRate);

    const isSubmitDisabled =
        isSubmitting ||
        Boolean(reportingYearValidationError) ||
        !formState.categoryId ||
        Boolean(amountUahValidationError) ||
        Boolean(amountUsdValidationError) ||
        Boolean(categoryValidationError) ||
        Boolean(formState.errors.amountUah) ||
        Boolean(formState.errors.amountUsd) ||
        Boolean(currentUsdMismatchMessage);

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

    const handleCategoryBlur = useCallback(() => {
        setFormState((prev) => ({
            ...prev,
            errors: {
                ...prev.errors,
                categoryId: getCategoryError(prev.categoryId, 'blur'),
            },
        }));
    }, [getCategoryError]);

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
        handleCategoryBlur,
        handleAmountChange,
        handleAmountBlur,
        handleUsdChange,
        handleOpenAddConfirmation,
        handleConfirmAdd,
        handleCloseConfirmation,
    };
};
