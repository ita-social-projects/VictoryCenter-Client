import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import { useAmountBlur } from '@/hooks/admin/use-amount-blur/useAmountBlur';
import {
    validateProgramExpenseAmount,
    validateProgramExpenseProgram,
    validateProgramExpenseReportingYear,
} from '@/validation/admin/reports-schema/program-expenses-record-schema/program-expenses-record-schema';

interface ProgramExpenseFormState {
    reportingYear: string | undefined;
    programId: number | undefined;
    amountUah: string;
    amountUsd: string;
    errors: {
        reportingYear?: string;
        programId?: string;
        amountUah?: string;
        amountUsd?: string;
    };
}

interface UseProgramExpenseRecordFormParams {
    isOpen: boolean;
    programs: ProgramExpensesProgram[];
    records: ProgramExpensesRecord[];
    exchangeRate: string | null;
    onSubmit: (data: {
        programId: number;
        reportingYear: string;
        amountUah: string;
        amountUsd: string;
    }) => Promise<boolean>;
}

const INITIAL_STATE: ProgramExpenseFormState = {
    reportingYear: undefined,
    programId: undefined,
    amountUah: '',
    amountUsd: '',
    errors: {},
};

export const useProgramExpenseRecordForm = ({
    isOpen,
    programs,
    records,
    exchangeRate,
    onSubmit,
}: UseProgramExpenseRecordFormParams) => {
    const [formState, setFormState] = useState<ProgramExpenseFormState>(INITIAL_STATE);
    const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        usdMismatchMessage,
        setUsdMismatchMessage,
        handleAmountBlur: handleAmountBlurBase,
    } = useAmountBlur(exchangeRate);

    const programOptions = useMemo(
        () =>
            [...programs].sort((firstProgram, secondProgram) =>
                firstProgram.name.localeCompare(secondProgram.name, 'uk'),
            ),
        [programs],
    );

    const isProgramSelectDisabled = programOptions.length === 0;

    const getProgramError = useCallback(
        (programId: number | undefined, trigger: 'change' | 'blur'): string | undefined =>
            validateProgramExpenseProgram({
                recordId: 0,
                programId,
                records,
                trigger,
            }),
        [records],
    );

    useEffect(() => {
        if (!isOpen) {
            setFormState(INITIAL_STATE);
            setUsdMismatchMessage(undefined);
            return;
        }

        const selectedProgramExists =
            formState.programId === undefined || programOptions.some((program) => program.id === formState.programId);

        if (isProgramSelectDisabled || !selectedProgramExists) {
            setFormState((previousState) => ({
                ...previousState,
                programId: undefined,
                errors: {
                    ...previousState.errors,
                    programId: undefined,
                },
            }));
        }
    }, [formState.programId, isOpen, isProgramSelectDisabled, programOptions, setUsdMismatchMessage]);

    const handleAmountChange = useCallback(
        (value: string) => {
            setFormState((previousState) => ({
                ...previousState,
                ...updateFundsAmounts('amountUah', value, exchangeRate, 'change')(previousState),
            }));
            setUsdMismatchMessage(undefined);
        },
        [exchangeRate, setUsdMismatchMessage],
    );

    const handleUsdChange = useCallback(
        (value: string) => {
            setFormState((previousState) => ({
                ...previousState,
                ...updateFundsAmounts('amountUsd', value, exchangeRate, 'change')(previousState),
            }));
            setUsdMismatchMessage(undefined);
        },
        [exchangeRate, setUsdMismatchMessage],
    );

    const handleAmountBlur = useCallback(
        (field: 'amountUah' | 'amountUsd') => handleAmountBlurBase(field, setFormState),
        [handleAmountBlurBase],
    );

    const handleReportingYearChange = useCallback((reportingYear: string | undefined) => {
        setFormState((previousState) => ({
            ...previousState,
            reportingYear,
            errors: {
                ...previousState.errors,
                reportingYear: validateProgramExpenseReportingYear(reportingYear, 'change'),
            },
        }));
    }, []);

    const handleReportingYearBlur = useCallback(() => {
        setFormState((previousState) => ({
            ...previousState,
            errors: {
                ...previousState.errors,
                reportingYear: validateProgramExpenseReportingYear(previousState.reportingYear, 'blur'),
            },
        }));
    }, []);

    const handleProgramChange = useCallback(
        (programId: number | undefined) => {
            setFormState((previousState) => ({
                ...previousState,
                programId,
                errors: {
                    ...previousState.errors,
                    programId: getProgramError(programId, 'change'),
                },
            }));
        },
        [getProgramError],
    );

    const handleProgramBlur = useCallback(() => {
        setFormState((previousState) => ({
            ...previousState,
            errors: {
                ...previousState.errors,
                programId: getProgramError(previousState.programId, 'blur'),
            },
        }));
    }, [getProgramError]);

    const isDirty =
        Boolean(formState.reportingYear) ||
        Boolean(formState.programId) ||
        formState.amountUah.trim() !== '' ||
        formState.amountUsd.trim() !== '';

    const isSubmitDisabled =
        Boolean(validateProgramExpenseReportingYear(formState.reportingYear, 'save')) ||
        Boolean(getProgramError(formState.programId, 'blur')) ||
        Boolean(validateProgramExpenseAmount(formState.amountUah, 'save')) ||
        Boolean(validateProgramExpenseAmount(formState.amountUsd, 'save')) ||
        isSubmitting;

    const handleOpenAddConfirmation = useCallback(() => {
        setIsAddConfirmationOpen(true);
    }, []);

    const handleCloseConfirmation = useCallback(() => {
        setIsAddConfirmationOpen(false);
    }, []);

    const handleConfirmAdd = useCallback(async () => {
        if (!formState.programId || !formState.reportingYear || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const success = await onSubmit({
                programId: formState.programId,
                reportingYear: formState.reportingYear,
                amountUah: formState.amountUah,
                amountUsd: formState.amountUsd,
            });

            if (success) {
                setIsAddConfirmationOpen(false);
                setFormState(INITIAL_STATE);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formState, isSubmitting, onSubmit]);

    return {
        formState,
        programOptions,
        isProgramSelectDisabled,
        isDirty,
        isSubmitDisabled,
        isSubmitting,
        isAddConfirmationOpen,
        usdMismatchMessage,
        handleReportingYearChange,
        handleReportingYearBlur,
        handleProgramChange,
        handleProgramBlur,
        handleAmountChange,
        handleUsdChange,
        handleAmountBlur,
        handleOpenAddConfirmation,
        handleCloseConfirmation,
        handleConfirmAdd,
    };
};
