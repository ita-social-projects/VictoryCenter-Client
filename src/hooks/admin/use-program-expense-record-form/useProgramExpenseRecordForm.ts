import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';
import { FUNDS_EXPENDITURES_TEXT } from '@/const/admin/reports';
import {
    normalizeProgramExpenseAmountInput,
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
    const [usdMismatchMessage, setUsdMismatchMessage] = useState<string | undefined>();
    const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    }, [formState.programId, isOpen, isProgramSelectDisabled, programOptions]);

    const handleAmountChange = useCallback(
        (field: 'amountUah' | 'amountUsd', value: string) => {
            setFormState((previousState) => ({
                ...previousState,
                ...updateFundsAmounts(field, value, exchangeRate, 'change')(previousState),
            }));
            setUsdMismatchMessage(undefined);
        },
        [exchangeRate],
    );

    const handleAmountBlur = useCallback(
        (field: 'amountUah' | 'amountUsd') => {
            if (field === 'amountUsd') {
                setFormState((prev) => {
                    const normalizedAmountUsd = normalizeProgramExpenseAmountInput(prev.amountUsd, true);
                    const amountUsdError = validateProgramExpenseAmount(normalizedAmountUsd, 'blur');

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

            setFormState((previousState) => {
                const updated = {
                    ...previousState,
                    ...updateFundsAmounts(field, previousState[field], exchangeRate, 'blur')(previousState),
                };
                setUsdMismatchMessage(undefined);
                return updated;
            });
        },
        [exchangeRate],
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
        const success = await onSubmit({
            programId: formState.programId,
            reportingYear: formState.reportingYear,
            amountUah: formState.amountUah,
            amountUsd: formState.amountUsd,
        });
        setIsSubmitting(false);

        if (success) {
            setIsAddConfirmationOpen(false);
            setFormState(INITIAL_STATE);
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
        handleAmountBlur,
        handleOpenAddConfirmation,
        handleCloseConfirmation,
        handleConfirmAdd,
    };
};
