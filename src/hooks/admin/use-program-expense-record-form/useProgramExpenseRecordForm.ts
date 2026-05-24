import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';
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
}

const INITIAL_STATE: ProgramExpenseFormState = {
    reportingYear: undefined,
    programId: undefined,
    amountUah: '',
    amountUsd: '',
    errors: {},
};

export const useProgramExpenseRecordForm = ({ isOpen, programs, records }: UseProgramExpenseRecordFormParams) => {
    const [formState, setFormState] = useState<ProgramExpenseFormState>(INITIAL_STATE);

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

    const handleAmountChange = useCallback((field: 'amountUah' | 'amountUsd', value: string) => {
        const normalizedValue = normalizeProgramExpenseAmountInput(value);

        setFormState((previousState) => ({
            ...previousState,
            [field]: normalizedValue,
            errors: {
                ...previousState.errors,
                [field]: validateProgramExpenseAmount(normalizedValue, 'change'),
            },
        }));
    }, []);

    const handleAmountBlur = useCallback((field: 'amountUah' | 'amountUsd') => {
        setFormState((previousState) => {
            const normalizedValue = normalizeProgramExpenseAmountInput(previousState[field], true);

            return {
                ...previousState,
                [field]: normalizedValue,
                errors: {
                    ...previousState.errors,
                    [field]: validateProgramExpenseAmount(normalizedValue, 'blur'),
                },
            };
        });
    }, []);

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
        Boolean(validateProgramExpenseAmount(formState.amountUsd, 'save'));

    return {
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
    };
};
