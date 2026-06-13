import { useEffect, useRef, useState, useCallback } from 'react';
import { ProgramExpensesEmptyState } from '@/pages/admin/reports/components/program-expenses-section/components/program-expenses-empty-state/ProgramExpensesEmptyState';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ReactComponent as CheckmarkIcon } from '@/assets/icons/checkmark.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import { ReactComponent as ArrowUpIcon } from '@/assets/icons/arrow-up.svg';
import { ReactComponent as InfoIcon } from '@/assets/icons/info.svg';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';
import { ProgramExpensesRecord } from '@/types/admin/reports';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { Button } from '@/components/admin/button/Button';
import { updateFundsAmounts } from '@/utils/functions/update-funds-amounts/update-funds-amounts';
import { isUsdAmountMismatch } from '@/utils/functions/validate-usd-amount-mismatch/validate-usd-amount-mismatch';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import cn from 'classnames';
import styles from './ProgramExpensesTable.module.scss';

export interface ProgramExpensesTableProps {
    records: ProgramExpensesRecord[];
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
    onRecordSave?: (recordId: number, data: { amountUah: string; amountUsd: string }) => boolean | Promise<boolean>;
}

interface RowEditState {
    recordId: number;
    originalAmountUah: string;
    originalAmountUsd: string;
    amountUah: string;
    amountUsd: string;
    errors: {
        amountUah?: string;
        amountUsd?: string;
    };
    usdMismatchMessage?: string;
}

const READ_ONLY_TABLE_COLUMNS_COUNT = 5;
const EDITING_TABLE_COLUMNS_COUNT = 7;

const isAcceptButtonDisabled = (rowEditState: RowEditState | null): boolean => {
    if (!rowEditState) return true;

    const normalizedUah = normalizeFundsExpendituresAmountInput(rowEditState.amountUah, true);
    const normalizedUsd = normalizeFundsExpendituresAmountInput(rowEditState.amountUsd, true);
    const normalizedOriginalUah = normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUah, true);
    const normalizedOriginalUsd = normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUsd, true);

    const hasErrors = Boolean(rowEditState.errors.amountUah) || Boolean(rowEditState.errors.amountUsd);
    const amountsEmpty = normalizedUah === '' || normalizedUsd === '';
    const noChanges = normalizedUah === normalizedOriginalUah && normalizedUsd === normalizedOriginalUsd;

    return hasErrors || amountsEmpty || noChanges;
};

export const ProgramExpensesTable = ({
    records,
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
    const tableWrapperRef = useRef<HTMLDivElement>(null);
    const hasNoRecords = records.length === 0;
    const visibleRecordIds = records.map((record) => record.id);
    const selectedVisibleRecordIds = visibleRecordIds.filter((id) => selectedRecordIds.includes(id));
    const areAllVisibleRecordsSelected = records.length > 0 && selectedVisibleRecordIds.length === records.length;
    const hasSelectedVisibleRecords = selectedVisibleRecordIds.length > 0;
    const tableColumnsCount = isEditing ? EDITING_TABLE_COLUMNS_COUNT : READ_ONLY_TABLE_COLUMNS_COUNT;
    const [rowEditState, setRowEditState] = useState<RowEditState | null>(null);
    const [savingRecordId, setSavingRecordId] = useState<number | null>(null);
    const [isMoveToTopVisible, setIsMoveToTopVisible] = useState(false);
    const isAnyRowEditing = rowEditState !== null;
    const isSavingInProgress = savingRecordId !== null;

    const updateMoveToTopVisibility = useCallback(() => {
        const wrapper = tableWrapperRef.current;
        if (!wrapper) return;
        const isScrollable = wrapper.scrollHeight > wrapper.clientHeight;
        setIsMoveToTopVisible(isScrollable && wrapper.scrollTop > 0);
    }, []);

    const handleTableScroll = useCallback(() => {
        updateMoveToTopVisibility();
    }, [updateMoveToTopVisibility]);

    const moveToTop = useCallback(() => {
        const wrapper = tableWrapperRef.current;
        if (!wrapper) return;
        wrapper.scrollTop = 0;
        setIsMoveToTopVisible(false);
    }, []);

    const setRowEditMode = useCallback(
        (nextState: RowEditState | null) => {
            setRowEditState(nextState);
            onRowEditModeChange?.(nextState !== null);
        },
        [onRowEditModeChange],
    );

    const handleStartRowEdit = useCallback(
        (record: ProgramExpensesRecord) => {
            if (rowEditState || isRowActionsDisabled) return;

            setRowEditMode({
                recordId: record.id,
                originalAmountUah: record.amountUah,
                originalAmountUsd: record.amountUsd,
                amountUah: record.amountUah,
                amountUsd: record.amountUsd,
                errors: {},
                usdMismatchMessage: undefined,
            });
        },
        [isRowActionsDisabled, rowEditState, setRowEditMode],
    );

    const handleCloseRowEdit = useCallback(() => {
        setRowEditMode(null);
    }, [setRowEditMode]);

    const applyAmountUpdate = useCallback(
        (prev: RowEditState, field: 'amountUah' | 'amountUsd', value: string, trigger: 'change' | 'blur') => {
            const updatedAmounts = updateFundsAmounts(
                field,
                value,
                exchangeRate ?? null,
                trigger,
            )({
                amountUah: prev.amountUah,
                amountUsd: prev.amountUsd,
                errors: { amountUah: prev.errors.amountUah, amountUsd: prev.errors.amountUsd },
            });

            return {
                ...prev,
                amountUah: updatedAmounts.amountUah,
                amountUsd: updatedAmounts.amountUsd,
                errors: {
                    ...prev.errors,
                    amountUah: updatedAmounts.errors.amountUah,
                    amountUsd: updatedAmounts.errors.amountUsd,
                },
            };
        },
        [exchangeRate],
    );

    const handleAmountChange = useCallback(
        (recordId: number, field: 'amountUah' | 'amountUsd', nextValue: string) => {
            setRowEditState((prev) => {
                if (prev?.recordId !== recordId) {
                    return prev;
                }

                const nextState = applyAmountUpdate(prev, field, nextValue, 'change');

                return {
                    ...nextState,
                    usdMismatchMessage: undefined,
                };
            });
        },
        [applyAmountUpdate],
    );

    const handleAmountBlur = useCallback(
        (recordId: number, field: 'amountUah' | 'amountUsd') => {
            setRowEditState((prev) => {
                if (prev?.recordId !== recordId) {
                    return prev;
                }

                const nextState = applyAmountUpdate(prev, field, prev[field], 'blur');

                if (field === 'amountUsd') {
                    const hasMismatch = isUsdAmountMismatch(nextState.amountUah, nextState.amountUsd, exchangeRate);

                    return {
                        ...nextState,
                        usdMismatchMessage: hasMismatch
                            ? FUNDS_EXPENDITURES_TEXT.MESSAGE.AMOUNT_USD_NOT_MATCH
                            : undefined,
                    };
                }

                return {
                    ...nextState,
                    usdMismatchMessage: undefined,
                };
            });
        },
        [applyAmountUpdate, exchangeRate],
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
            const isAmountsUnchanged =
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUah, true) ===
                    normalizeFundsExpendituresAmountInput(preparedAmountUah, true) &&
                normalizeFundsExpendituresAmountInput(rowEditState.originalAmountUsd, true) ===
                    normalizeFundsExpendituresAmountInput(preparedAmountUsd, true);

            if (amountUahError || amountUsdError || isAmountsUnchanged) {
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
                        },
                    };
                });

                return;
            }

            setSavingRecordId(record.id);

            try {
                const isSaved = await onRecordSave?.(record.id, {
                    amountUah: preparedAmountUah,
                    amountUsd: preparedAmountUsd,
                });

                if (isSaved === false) {
                    return;
                }

                setRowEditMode(null);
            } finally {
                setSavingRecordId(null);
            }
        },
        [onRecordSave, rowEditState, savingRecordId, setRowEditMode],
    );

    useEffect(() => {
        if (!headerCheckboxRef.current) return;
        headerCheckboxRef.current.indeterminate = hasSelectedVisibleRecords && !areAllVisibleRecordsSelected;
    }, [areAllVisibleRecordsSelected, hasSelectedVisibleRecords]);

    useEffect(() => {
        updateMoveToTopVisibility();
    }, [records.length, updateMoveToTopVisibility]);

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
                        {isEditing && <col className={styles['column-checkbox']} />}
                        <col className={styles['column-year']} />
                        <col className={styles['column-type']} />
                        <col className={styles['column-program']} />
                        <col className={styles['column-amount']} />
                        <col className={styles['column-amount']} />
                        {isEditing && <col className={styles['column-actions']} />}
                    </colgroup>
                    <thead>
                        <tr>
                            {isEditing && (
                                <th className={cn(styles.th, styles['checkbox-th'])}>
                                    <input
                                        ref={headerCheckboxRef}
                                        type="checkbox"
                                        className={styles['row-checkbox']}
                                        aria-label="Select all program expense records"
                                        checked={areAllVisibleRecordsSelected}
                                        onChange={(e) => onSelectAllToggle?.(e.target.checked)}
                                    />
                                </th>
                            )}
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.REPORTING_YEAR}</th>
                            <th className={styles.th}>{FUNDS_EXPENDITURES_TEXT.TABLE.COLUMNS.TYPE}</th>
                            <th className={styles.th}>{PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.PROGRAM}</th>
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
                                isAddProgramExpenseDisabled={isAddProgramExpenseDisabled}
                                onAddProgramExpense={onAddProgramExpense}
                            />
                        ) : (
                            records.map((record) => {
                                const isEditedRow = rowEditState?.recordId === record.id;
                                const isAnotherRowEditing =
                                    (isAnyRowEditing && !isEditedRow) || isSavingInProgress || isRowActionsDisabled;
                                const isSavingCurrentRow = savingRecordId === record.id;
                                const isAcceptDisabled = !isEditedRow || isAcceptButtonDisabled(rowEditState);

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
                                        <td className={styles.td}>{record.programName}</td>
                                        <td className={cn(styles.td, { [styles['amount-edit-td']]: isEditedRow })}>
                                            {isEditedRow ? (
                                                <div className={styles['amount-edit-wrapper']}>
                                                    <input
                                                        type="text"
                                                        className={cn(styles['amount-edit-input'], {
                                                            [styles['amount-edit-input-error']]:
                                                                rowEditState.errors.amountUah,
                                                        })}
                                                        value={rowEditState.amountUah}
                                                        aria-label={`Amount UAH record ${record.id}`}
                                                        onChange={(e) =>
                                                            handleAmountChange(record.id, 'amountUah', e.target.value)
                                                        }
                                                        onBlur={() => handleAmountBlur(record.id, 'amountUah')}
                                                        disabled={isSavingCurrentRow}
                                                    />
                                                    {rowEditState.errors.amountUah && (
                                                        <p className={styles['amount-edit-error']}>
                                                            {rowEditState.errors.amountUah}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                record.amountUah
                                            )}
                                        </td>
                                        <td className={cn(styles.td, { [styles['amount-edit-td']]: isEditedRow })}>
                                            {isEditedRow ? (
                                                <div className={styles['amount-edit-wrapper']}>
                                                    <input
                                                        type="text"
                                                        className={cn(styles['amount-edit-input'], {
                                                            [styles['amount-edit-input-error']]:
                                                                rowEditState.errors.amountUsd,
                                                        })}
                                                        value={rowEditState.amountUsd}
                                                        aria-label={`Amount USD record ${record.id}`}
                                                        onChange={(e) =>
                                                            handleAmountChange(record.id, 'amountUsd', e.target.value)
                                                        }
                                                        onBlur={() => handleAmountBlur(record.id, 'amountUsd')}
                                                        disabled={isSavingCurrentRow}
                                                    />
                                                    {rowEditState.errors.amountUsd && (
                                                        <p className={styles['amount-edit-error']}>
                                                            {rowEditState.errors.amountUsd}
                                                        </p>
                                                    )}
                                                    {rowEditState.usdMismatchMessage && (
                                                        <div className={styles['amount-edit-info']}>
                                                            <InfoIcon
                                                                className={styles['amount-edit-info-icon']}
                                                                aria-hidden="true"
                                                            />
                                                            <p className={styles['amount-edit-info-text']}>
                                                                {rowEditState.usdMismatchMessage}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                record.amountUsd
                                            )}
                                        </td>
                                        {isEditing && (
                                            <td className={cn(styles.td, styles['actions-td'])}>
                                                <div className={styles['row-actions']}>
                                                    {isEditedRow ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    styles['icon-button'],
                                                                    styles['accept-icon-button'],
                                                                )}
                                                                aria-label={`Accept record ${record.id}`}
                                                                onClick={() => handleAcceptRowEdit(record)}
                                                                disabled={isAcceptDisabled || isSavingCurrentRow}
                                                            >
                                                                {isSavingCurrentRow ? (
                                                                    <InlineLoader size={1.2} />
                                                                ) : (
                                                                    <CheckmarkIcon className={styles['action-icon']} />
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={cn(
                                                                    styles['icon-button'],
                                                                    styles['close-icon-button'],
                                                                )}
                                                                aria-label={`Close edit for record ${record.id}`}
                                                                onClick={handleCloseRowEdit}
                                                                disabled={isSavingCurrentRow}
                                                            >
                                                                <CrossIcon className={styles['action-icon']} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconButton
                                                                type="button"
                                                                className={cn(
                                                                    styles['icon-button'],
                                                                    styles['edit-icon-button'],
                                                                )}
                                                                aria-label={`Edit record ${record.id}`}
                                                                onClick={() => handleStartRowEdit(record)}
                                                                disabled={isAnotherRowEditing}
                                                                DefaultIcon={ACTION_ICONS.edit.default}
                                                                FilledIcon={ACTION_ICONS.edit.hover}
                                                            />
                                                            <IconButton
                                                                type="button"
                                                                className={cn(
                                                                    styles['icon-button'],
                                                                    styles['delete-icon-button'],
                                                                )}
                                                                aria-label={`Delete record ${record.id}`}
                                                                onClick={() => onDeleteRecord?.(record)}
                                                                disabled={isAnotherRowEditing}
                                                                DefaultIcon={ACTION_ICONS.delete.default}
                                                                FilledIcon={ACTION_ICONS.delete.hover}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </td>
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
                data-testid="funds-table-to-top"
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
