import { useCallback, useEffect, useMemo, useState } from 'react';
import { PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import { getUsdMismatchMessage, useAmountBlur } from '@/hooks/admin/use-amount-blur/useAmountBlur';
import {
    validateProgramExpenseAmount,
    validateProgramExpenseProgram,
    validateProgramExpenseReportingYear,
} from '@/validation/admin/reports-schema/program-expenses-record-schema/program-expenses-record-schema';
import { normalizeFundsExpendituresAmountInput } from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';

interface ProgramExpenseFormState {
    reportingYear: string | undefined;
    programId: number | undefined;
    programInputValue: string;
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
    onSubmit: (data: {
        programId: number | undefined;
        programName: string;
        reportingYear: string;
        amountUah: string;
        amountUsd: string;
    }) => Promise<boolean>;
}

const INITIAL_STATE: ProgramExpenseFormState = {
    reportingYear: undefined,
    programId: undefined,
    programInputValue: '',
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
    onSubmit,
}: UseProgramExpenseRecordFormParams) => {
    const [formState, setFormState] = useState<ProgramExpenseFormState>(INITIAL_STATE);
    const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        usdMismatchMessage,
        setUsdMismatchMessage,
        handleAmountBlur: handleAmountBlurBase,
    } = useAmountBlur(exchangeRate, PROGRAM_EXPENSES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH);

    const programOptions = useMemo(
        () =>
            [...programs].sort((firstProgram, secondProgram) =>
                firstProgram.name.localeCompare(secondProgram.name, 'uk'),
            ),
        [programs],
    );

    const getProgramError = useCallback(
        (programId: number | undefined, programName: string, trigger: 'change' | 'blur'): string | undefined =>
            validateProgramExpenseProgram({
                recordId: recordToEdit ? recordToEdit.id : 0,
                programId,
                programName,
                records,
                trigger,
            }),
        [records, recordToEdit],
    );

    useEffect(() => {
        if (!isOpen) {
            setFormState(INITIAL_STATE);
            setUsdMismatchMessage(undefined);
            setIsAddConfirmationOpen(false);
            return;
        }

        if (recordToEdit) {
            setFormState({
                reportingYear: recordToEdit.reportingYear,
                programId: recordToEdit.programId,
                programInputValue: recordToEdit.programName,
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

        const isEditBaseline = recordToEdit !== null && formState.programId === recordToEdit.programId;
        const selectedProgramExists =
            formState.programId === undefined ||
            programOptions.some((program) => program.id === formState.programId) ||
            isEditBaseline;

        if (!isEditBaseline && !selectedProgramExists) {
            setFormState((previousState) => ({
                ...previousState,
                programId: undefined,
                programInputValue: '',
                errors: {
                    ...previousState.errors,
                    programId: undefined,
                },
            }));
        }
    }, [formState.programId, isOpen, programOptions, recordToEdit]);

    const handleAmountFieldChange = useCallback(
        (field: 'amountUah' | 'amountUsd') => (value: string) => {
            const normalizedValue = normalizeFundsExpendituresAmountInput(value, false, false, {
                whitespaceOnly: true,
            });

            setFormState((previousState) => ({
                ...previousState,
                ...updateFundsAmounts(field, normalizedValue, exchangeRate, 'change')(previousState),
            }));
            setUsdMismatchMessage(undefined);
        },
        [exchangeRate, setUsdMismatchMessage],
    );

    const handleAmountBlur = useCallback(
        (field: 'amountUah' | 'amountUsd') => {
            const isAmountsUnchangedFromRecord =
                recordToEdit !== null &&
                formState.amountUah === recordToEdit.amountUah &&
                formState.amountUsd === recordToEdit.amountUsd;

            handleAmountBlurBase(field, setFormState, isAmountsUnchangedFromRecord);
        },
        [handleAmountBlurBase, recordToEdit, formState.amountUah, formState.amountUsd],
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
            const matchedOption = programOptions.find((program) => program.id === programId);

            setFormState((previousState) => ({
                ...previousState,
                programId,
                programInputValue: matchedOption ? matchedOption.name : previousState.programInputValue,
                errors: {
                    ...previousState.errors,
                    programId: getProgramError(
                        programId,
                        matchedOption ? matchedOption.name : previousState.programInputValue,
                        'change',
                    ),
                },
            }));
        },
        [getProgramError, programOptions],
    );

    const handleProgramInputChange = useCallback(
        (text: string) => {
            const normalizedText = text.trim().replace(/\s+/g, ' ').toLowerCase();
            const matchedOption = programOptions.find(
                (program) => program.name.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedText,
            );

            setFormState((previousState) => ({
                ...previousState,
                programInputValue: text,
                programId: matchedOption?.id,
                errors: {
                    ...previousState.errors,
                    programId: getProgramError(matchedOption?.id, text, 'change'),
                },
            }));
        },
        [getProgramError, programOptions],
    );

    const handleProgramBlur = useCallback(() => {
        setFormState((previousState) => {
            const normalizedInputValue = previousState.programInputValue.trim().replace(/\s+/g, ' ');

            return {
                ...previousState,
                programInputValue: normalizedInputValue,
                errors: {
                    ...previousState.errors,
                    programId: getProgramError(previousState.programId, normalizedInputValue, 'blur'),
                },
            };
        });
    }, [getProgramError]);

    const isEditModeDirty = () => {
        if (!recordToEdit) return false;
        return (
            formState.reportingYear !== recordToEdit.reportingYear ||
            formState.programId !== recordToEdit.programId ||
            formState.programInputValue.trim().replace(/\s+/g, ' ') !==
                recordToEdit.programName.trim().replace(/\s+/g, ' ') ||
            formState.amountUah !== recordToEdit.amountUah ||
            formState.amountUsd !== recordToEdit.amountUsd
        );
    };

    const isCreateModeDirty = () => {
        return (
            Boolean(formState.reportingYear) ||
            Boolean(formState.programId) ||
            formState.programInputValue.trim() !== '' ||
            formState.amountUah.trim() !== '' ||
            formState.amountUsd.trim() !== ''
        );
    };

    const isDirty = recordToEdit ? isEditModeDirty() : isCreateModeDirty();

    const areAmountsUnchangedFromRecord = Boolean(
        recordToEdit &&
            formState.amountUah === recordToEdit.amountUah &&
            formState.amountUsd === recordToEdit.amountUsd,
    );
    const currentUsdMismatchMessage = areAmountsUnchangedFromRecord
        ? undefined
        : getUsdMismatchMessage(
              formState.amountUah,
              formState.amountUsd,
              exchangeRate,
              PROGRAM_EXPENSES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH,
          );

    const isSubmitEnabled =
        !validateProgramExpenseReportingYear(formState.reportingYear, 'save') &&
        !getProgramError(formState.programId, formState.programInputValue, 'blur') &&
        !validateProgramExpenseAmount(formState.amountUah, 'save') &&
        !validateProgramExpenseAmount(formState.amountUsd, 'save') &&
        !currentUsdMismatchMessage &&
        !isSubmitting &&
        isDirty;

    const isSubmitDisabled = !isSubmitEnabled;

    const handleOpenAddConfirmation = useCallback(() => {
        setIsAddConfirmationOpen(true);
    }, []);

    const handleCloseConfirmation = useCallback(() => {
        setIsAddConfirmationOpen(false);
    }, []);

    const submitRecord = useCallback(async (): Promise<boolean> => {
        const trimmedProgramName = formState.programInputValue.trim().replace(/\s+/g, ' ');
        const hasProgram = formState.programId !== undefined || trimmedProgramName !== '';

        if (!hasProgram || !formState.reportingYear || isSubmitting) return false;

        if (currentUsdMismatchMessage) {
            setUsdMismatchMessage(currentUsdMismatchMessage);
            return false;
        }

        setIsSubmitting(true);
        try {
            const success = await onSubmit({
                programId: formState.programId,
                programName: trimmedProgramName,
                reportingYear: formState.reportingYear,
                amountUah: formState.amountUah,
                amountUsd: formState.amountUsd,
            });
            return success;
        } finally {
            setIsSubmitting(false);
        }
    }, [formState, isSubmitting, onSubmit, currentUsdMismatchMessage, setUsdMismatchMessage]);

    const handleConfirmAdd = useCallback(async () => {
        const success = await submitRecord();
        if (success) {
            setIsAddConfirmationOpen(false);
            setFormState(INITIAL_STATE);
        }
    }, [submitRecord]);

    const handleSave = useCallback(async () => {
        return submitRecord();
    }, [submitRecord]);

    return {
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
    };
};
