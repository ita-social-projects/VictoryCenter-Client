import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import { useAmountBlur } from '@/hooks/admin/use-amount-blur/useAmountBlur';
import { validateProgramExpenseProgram } from '@/validation/admin/reports-schema/program-expenses-record-schema/program-expenses-record-schema';
import {
    validateFundsExpendituresAmount,
    validateFundsExpendituresReportingYear,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';

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
    recordToEdit?: ProgramExpensesRecord | null;
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
    recordToEdit = null,
}: UseProgramExpenseRecordFormParams) => {
    const [formState, setFormState] = useState<ProgramExpenseFormState>(INITIAL_STATE);
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
                recordId: recordToEdit ? recordToEdit.id : 0,
                programId,
                records,
                trigger,
            }),
        [records, recordToEdit],
    );

    useEffect(() => {
        if (!isOpen) {
            setFormState(INITIAL_STATE);
            setUsdMismatchMessage(undefined);
            return;
        }

        if (recordToEdit) {
            setFormState({
                reportingYear: recordToEdit.reportingYear,
                programId: recordToEdit.programId,
                amountUah: recordToEdit.amountUah,
                amountUsd: recordToEdit.amountUsd,
                errors: {},
            });
        } else {
            setFormState(INITIAL_STATE);
        }
        setUsdMismatchMessage(undefined);
    }, [isOpen, recordToEdit, setUsdMismatchMessage]);

    useEffect(() => {
        if (!isOpen) return;

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
        (value: string) => {
            setFormState((prev) => ({
                ...prev,
                ...updateFundsAmounts('amountUah', value, exchangeRate, 'change')(prev),
            }));
            setUsdMismatchMessage(undefined);
        },
        [exchangeRate, setUsdMismatchMessage],
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
                reportingYear: validateFundsExpendituresReportingYear(reportingYear, 'change'),
            },
        }));
    }, []);

    const handleReportingYearBlur = useCallback(() => {
        setFormState((previousState) => ({
            ...previousState,
            errors: {
                ...previousState.errors,
                reportingYear: validateFundsExpendituresReportingYear(previousState.reportingYear, 'blur'),
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

    const isDirty = recordToEdit
        ? formState.reportingYear !== recordToEdit.reportingYear ||
          formState.programId !== recordToEdit.programId ||
          formState.amountUah !== recordToEdit.amountUah ||
          formState.amountUsd !== recordToEdit.amountUsd
        : Boolean(formState.reportingYear) ||
          Boolean(formState.programId) ||
          formState.amountUah.trim() !== '' ||
          formState.amountUsd.trim() !== '';

    const isSubmitDisabled =
        Boolean(validateFundsExpendituresReportingYear(formState.reportingYear, 'save')) ||
        Boolean(getProgramError(formState.programId, 'blur')) ||
        Boolean(validateFundsExpendituresAmount(formState.amountUah, 'save')) ||
        Boolean(validateFundsExpendituresAmount(formState.amountUsd, 'save')) ||
        !isDirty;

    return {
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
    };
};
