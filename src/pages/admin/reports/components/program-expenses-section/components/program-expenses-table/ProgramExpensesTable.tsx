import { useEffect, useRef, useCallback } from 'react';
import { useTableScrollToTop } from '@/hooks/admin/use-table-scroll-to-top/useTableScrollToTop';
import { useTableRowAmountEdit } from '@/hooks/admin/use-table-row-amount-edit/useTableRowAmountEdit';
import { ProgramExpensesEmptyState } from '@/pages/admin/reports/components/program-expenses-section/components/program-expenses-empty-state/ProgramExpensesEmptyState';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ReactComponent as ArrowUpIcon } from '@/assets/icons/arrow-up.svg';
import { Button } from '@/components/admin/button/Button';
import { Select } from '@/components/common/select/Select';
import { validateProgramExpenseProgram } from '@/validation/admin/reports-schema/program-expenses-record-schema/program-expenses-record-schema';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';
import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';
import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';
import cn from 'classnames';
import styles from './ProgramExpensesTable.module.scss';

export interface ProgramExpensesTableProps {
    records: ProgramExpensesRecord[];
    allRecords?: ProgramExpensesRecord[];
    programs?: ProgramExpensesProgram[];
    hasAnyProgramExpenseRecords: boolean;
    isEditing?: boolean;
    isAddProgramExpenseDisabled?: boolean;
    onAddProgramExpense?: () => void;
    onDeleteRecord?: (record: ProgramExpensesRecord) => void;
    selectedRecordIds?: number[];
    onToggleRecordSelection?: (id: number) => void;
    onSelectAllToggle?: (checked: boolean) => void;
    onOpenBulkDelete?: () => void;
    exchangeRate?: string | null;
    isRowActionsDisabled?: boolean;
    onRowEditModeChange?: (isEditMode: boolean) => void;
    onRecordSave?: (
        recordId: number,
        programId: number,
        reportingYear: string,
        amountUah: string,
        amountUsd: string,
    ) => Promise<boolean>;
}

interface ProgramExpenseRowEditState {
    recordId: number;
    originalAmountUah: string;
    originalAmountUsd: string;
    amountUah: string;
    amountUsd: string;
    programId: number | undefined;
    originalProgramId: number | undefined;
    errors: {
        amountUah?: string;
        amountUsd?: string;
        programId?: string;
    };
    usdMismatchMessage?: string;
}

const isAcceptButtonDisabled = (
    rowEditState: ProgramExpenseRowEditState | null,
    exchangeRate?: string | null,
): boolean => {
    if (!rowEditState) return true;

    const normalizedUah = normalizeFundsExpendituresAmountInput(rowEditState.amountUah, true);
    const normalizedUsd = normalizeFundsExpendituresAmountInput(rowEditState.amountUsd, true);
    const normalizedOriginalUah = normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUah, true);
    const normalizedOriginalUsd = normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUsd, true);

    const hasErrors =
        Boolean(rowEditState.errors.amountUah) ||
        Boolean(rowEditState.errors.amountUsd) ||
        Boolean(rowEditState.errors.programId) ||
        Boolean(rowEditState.usdMismatchMessage) ||
        isUsdAmountMismatch(normalizedUah, normalizedUsd, exchangeRate);

    const programIdUndefined = rowEditState.programId === undefined;
    const amountsEmpty = normalizedUah === '' || normalizedUsd === '';

    const noChanges =
        normalizedUah === normalizedOriginalUah &&
        normalizedUsd === normalizedOriginalUsd &&
        rowEditState.programId === rowEditState.originalProgramId;

    return hasErrors || programIdUndefined || amountsEmpty || noChanges;
};

export const ProgramExpensesTable = ({
    records,
    allRecords,
    programs = [],
    hasAnyProgramExpenseRecords,
    isEditing = false,
    isAddProgramExpenseDisabled = false,
    onAddProgramExpense,
    onDeleteRecord,
    selectedRecordIds = [],
    onToggleRecordSelection,
    onSelectAllToggle,
    onOpenBulkDelete,
    exchangeRate,
    isRowActionsDisabled = false,
    onRowEditModeChange,
    onRecordSave,
}: ProgramExpensesTableProps) => {
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const hasNoRecords = records.length === 0;
    const visibleRecordIds = records.map((record) => record.id);
    const selectedVisibleRecordIds = visibleRecordIds.filter((id) => selectedRecordIds.includes(id));
    const areAllVisibleRecordsSelected = records.length > 0 && selectedVisibleRecordIds.length === records.length;
    const hasSelectedVisibleRecords = selectedVisibleRecordIds.length > 0;

    const showCheckboxColumn = isEditing && !hasNoRecords;
    const showProgramColumn = !hasNoRecords;

    const tableColumnsCount = 4 + (showCheckboxColumn ? 1 : 0) + (showProgramColumn ? 1 : 0) + (isEditing ? 1 : 0);

    const { tableWrapperRef, isMoveToTopVisible, handleTableScroll, moveToTop } = useTableScrollToTop(records.length);

    const {
        rowEditState,
        setRowEditState,
        savingRecordId,
        setSavingRecordId,
        isAnyRowEditing,
        setRowEditMode,
        renderAmountEditRow,
    } = useTableRowAmountEdit<ProgramExpenseRowEditState>({
        isEditing,
        isRowActionsDisabled,
        exchangeRate,
        mismatchMessage: PROGRAM_EXPENSES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH,
        isAcceptButtonDisabled: (state) => isAcceptButtonDisabled(state, exchangeRate),
        onRowEditModeChange,
    });

    const handleStartRowEdit = useCallback(
        (record: ProgramExpensesRecord) => {
            if (rowEditState || isRowActionsDisabled) return;

            setRowEditMode({
                recordId: record.id,
                originalAmountUah: record.amountUah,
                originalAmountUsd: record.amountUsd,
                amountUah: record.amountUah,
                amountUsd: record.amountUsd,
                programId: record.programId,
                originalProgramId: record.programId,
                errors: {},
                usdMismatchMessage: undefined,
            });
        },
        [isRowActionsDisabled, rowEditState, setRowEditMode],
    );

    const handleProgramChange = useCallback(
        (recordId: number, value: number | undefined) => {
            setRowEditState((prev) => {
                if (prev?.recordId !== recordId) return prev;

                const error = validateProgramExpenseProgram({
                    recordId,
                    programId: value,
                    records: allRecords ?? records,
                    trigger: 'change',
                });

                return {
                    ...prev,
                    programId: value,
                    errors: {
                        ...prev.errors,
                        programId: error,
                    },
                };
            });
        },
        [allRecords, records, setRowEditState],
    );

    const handleProgramBlur = useCallback(
        (recordId: number) => {
            setRowEditState((prev) => {
                if (prev?.recordId !== recordId) return prev;

                const error = validateProgramExpenseProgram({
                    recordId,
                    programId: prev.programId,
                    records: allRecords ?? records,
                    trigger: 'blur',
                });

                return {
                    ...prev,
                    errors: {
                        ...prev.errors,
                        programId: error,
                    },
                };
            });
        },
        [allRecords, records, setRowEditState],
    );

    const handleAcceptRowEdit = useCallback(
        async (record: ProgramExpensesRecord) => {
            if (rowEditState?.recordId !== record.id) {
                return;
            }

            if (savingRecordId !== null) {
                return;
            }

            const preparedAmountUah = rowEditState.amountUah.trim();
            const preparedAmountUsd = rowEditState.amountUsd.trim();
            const amountUahError = validateFundsExpendituresAmount(preparedAmountUah, 'save');
            const amountUsdError = validateFundsExpendituresAmount(preparedAmountUsd, 'save');
            const programError = validateProgramExpenseProgram({
                recordId: record.id,
                programId: rowEditState.programId,
                records: allRecords ?? records,
                trigger: 'blur',
            });

            const isUnchanged =
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUah, true) ===
                    normalizeFundsExpendituresAmountInput(preparedAmountUah, true) &&
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUsd, true) ===
                    normalizeFundsExpendituresAmountInput(preparedAmountUsd, true) &&
                rowEditState.programId === rowEditState.originalProgramId;

            if (
                amountUahError ||
                amountUsdError ||
                programError ||
                isUnchanged ||
                rowEditState.programId === undefined
            ) {
                setRowEditState((prev) => {
                    if (prev?.recordId !== record.id) {
                        return prev;
                    }

                    return {
                        ...prev,
                        amountUah: preparedAmountUah,
                        amountUsd: preparedAmountUsd,
                        errors: {
                            ...prev.errors,
                            amountUah: amountUahError,
                            amountUsd: amountUsdError,
                            programId: programError,
                        },
                    };
                });

                return;
            }

            setSavingRecordId(record.id);

            try {
                const isSaved = await onRecordSave?.(
                    record.id,
                    rowEditState.programId,
                    record.reportingYear,
                    preparedAmountUah,
                    preparedAmountUsd,
                );

                if (isSaved === false) {
                    return;
                }

                window.dispatchEvent(new CustomEvent('program-expenses-updated'));

                setRowEditMode(null);
            } finally {
                setSavingRecordId(null);
            }
        },
        [
            onRecordSave,
            rowEditState,
            savingRecordId,
            setRowEditMode,
            setRowEditState,
            setSavingRecordId,
            allRecords,
            records,
        ],
    );

    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        headerCheckboxRef.current.indeterminate = hasSelectedVisibleRecords && !areAllVisibleRecordsSelected;
    }, [areAllVisibleRecordsSelected, hasSelectedVisibleRecords]);

    return (
        <div className={styles['table-container']}>
            <div
                className={cn(styles['selection-row'], {
                    [styles['selection-row-hidden']]: selectedRecordIds.length === 0,
                })}
                aria-hidden={selectedRecordIds.length === 0}
            >
                <div className={styles['selection-pill']}>
                    {PROGRAM_EXPENSES_TEXT.BULK.getSelectedLabel(selectedRecordIds.length, records.length)}
                </div>
                <div className={styles['selection-actions']}>
                    <Button
                        buttonStyle="secondary"
                        className={styles['delete-selected-button']}
                        disabled={isAnyRowEditing || isRowActionsDisabled}
                        onClick={() => onOpenBulkDelete?.()}
                    >
                        {PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON}
                    </Button>
                </div>
            </div>

            <div
                ref={tableWrapperRef}
                className={styles['table-wrapper']}
                data-testid="program-expenses-table"
                data-record-count={records.length}
                onScroll={handleTableScroll}
            >
                <table className={styles.table}>
                    <colgroup>
                        {showCheckboxColumn && <col className={styles['column-checkbox']} />}
                        <col className={styles['column-year']} />
                        <col className={styles['column-type']} />
                        {showProgramColumn && <col className={styles['column-program']} />}
                        <col className={styles['column-amount']} />
                        <col className={styles['column-amount']} />
                        {isEditing && <col className={styles['column-actions']} />}
                    </colgroup>

                    <thead>
                        <tr>
                            {showCheckboxColumn && (
                                <th className={cn(styles.th, styles['checkbox-th'])}>
                                    <input
                                        ref={headerCheckboxRef}
                                        type="checkbox"
                                        className={styles['row-checkbox']}
                                        aria-label="Select all program expense records"
                                        checked={areAllVisibleRecordsSelected}
                                        disabled={isAnyRowEditing}
                                        onChange={(e) => onSelectAllToggle?.(e.target.checked)}
                                    />
                                </th>
                            )}

                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR}</th>

                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE}</th>

                            {showProgramColumn && (
                                <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM}</th>
                            )}

                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_UAH}</th>

                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.AMOUNT_USD}</th>

                            {isEditing && (
                                <th className={cn(styles.th, styles['actions-th'])}>
                                    {PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.ACTIONS}
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {hasNoRecords ? (
                            <ProgramExpensesEmptyState
                                colSpan={tableColumnsCount}
                                variant={hasAnyProgramExpenseRecords ? 'filtered' : 'program-expenses'}
                                isAddProgramExpenseDisabled={isAddProgramExpenseDisabled || isAnyRowEditing}
                                onAddProgramExpense={onAddProgramExpense}
                            />
                        ) : (
                            records.map((record) => {
                                const isEditedRow = rowEditState?.recordId === record.id;

                                return (
                                    <tr key={record.id} className={styles.tr}>
                                        {isEditing && (
                                            <td className={cn(styles.td, styles['checkbox-td'])}>
                                                <input
                                                    type="checkbox"
                                                    disabled={isAnyRowEditing}
                                                    className={styles['row-checkbox']}
                                                    aria-label={`Select record ${record.id}`}
                                                    checked={selectedRecordIds.includes(record.id)}
                                                    onChange={() => onToggleRecordSelection?.(record.id)}
                                                />
                                            </td>
                                        )}

                                        <td className={styles.td}>{record.reportingYear}</td>

                                        <td className={styles.td}>
                                            <span className={styles['type-chip']}>
                                                {PROGRAM_EXPENSES_TEXT.TABLE.TYPE_LABEL}
                                            </span>
                                        </td>

                                        <td className={cn(styles.td, { [styles['category-edit-td']]: isEditedRow })}>
                                            {isEditedRow ? (
                                                <div
                                                    className={styles['category-edit-wrapper']}
                                                    onBlurCapture={() => handleProgramBlur(record.id)}
                                                >
                                                    <Select<number | undefined>
                                                        value={rowEditState.programId}
                                                        onValueChange={(value) => handleProgramChange(record.id, value)}
                                                        disabled={savingRecordId !== null}
                                                        placeholder={
                                                            PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER
                                                        }
                                                        className={styles['category-edit-select']}
                                                        optionClassName={styles['category-edit-option']}
                                                    >
                                                        <Select.Option
                                                            value={undefined}
                                                            name={PROGRAM_EXPENSES_TEXT.MODAL.ADD.PROGRAM_PLACEHOLDER}
                                                        />

                                                        {programs.map((program) => (
                                                            <Select.Option
                                                                key={program.id}
                                                                value={program.id}
                                                                name={program.name}
                                                            />
                                                        ))}
                                                    </Select>

                                                    {rowEditState.errors.programId && (
                                                        <p className={styles['category-edit-error']}>
                                                            {rowEditState.errors.programId}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                record.programName
                                            )}
                                        </td>

                                        {renderAmountEditRow(
                                            record,
                                            () => handleAcceptRowEdit(record),
                                            () => handleStartRowEdit(record),
                                            () => onDeleteRecord?.(record),
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <button
                type="button"
                className={cn(styles['to-top-button'], {
                    [styles['to-top-button-visible']]: isMoveToTopVisible,
                })}
                data-testid="program-expenses-table-to-top"
                onClick={moveToTop}
                aria-label="Scroll table to top"
                aria-hidden={!isMoveToTopVisible}
                tabIndex={isMoveToTopVisible ? 0 : -1}
            >
                <ArrowUpIcon className={styles['to-top-icon']} />
            </button>
        </div>
    );
};
