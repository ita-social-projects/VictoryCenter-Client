import { useEffect, useRef, useState } from 'react';
import { ProgramExpensesEmptyState } from '@/pages/admin/reports/components/program-expenses-section/components/program-expenses-empty-state/ProgramExpensesEmptyState';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { ProgramExpensesProgram, ProgramExpensesRecord } from '@/types/admin/reports';
import { formatSummaryAmount } from '@/utils/functions/format-summary-amount/format-summary-amount';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { Button } from '@/components/admin/button/Button';
import { Select } from '@/components/common/select/Select';
import { validateProgramExpenseProgram } from '@/validation/admin/reports-schema/program-expenses-record-schema/program-expenses-record-schema';
import { ReactComponent as CheckmarkIcon } from '@/assets/icons/checkmark.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
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
    onRecordSave?: (
        recordId: number,
        programId: number,
        reportingYear: string,
        amountUah: string,
        amountUsd: string,
    ) => Promise<boolean>;
    onRowEditModeChange?: (isEditing: boolean) => void;
    onDeleteRecord?: (record: ProgramExpensesRecord) => void;
    selectedRecordIds?: number[];
    onToggleRecordSelection?: (id: number) => void;
    onSelectAllToggle?: (checked: boolean) => void;
    onOpenBulkDelete?: () => void;
}

const READ_ONLY_TABLE_COLUMNS_COUNT = 5;
const EDITING_TABLE_COLUMNS_COUNT = 7;

export const ProgramExpensesTable = ({
    records,
    allRecords,
    programs = [],
    hasAnyProgramExpenseRecords,
    isEditing = false,
    isAddProgramExpenseDisabled = false,
    onAddProgramExpense,
    onRecordSave,
    onRowEditModeChange,
    onDeleteRecord,
    selectedRecordIds = [],
    onToggleRecordSelection,
    onSelectAllToggle,
    onOpenBulkDelete,
}: ProgramExpensesTableProps) => {
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const hasNoRecords = records.length === 0;
    const visibleRecordIds = records.map((record) => record.id);
    const selectedVisibleRecordIds = visibleRecordIds.filter((id) => selectedRecordIds.includes(id));
    const areAllVisibleRecordsSelected = records.length > 0 && selectedVisibleRecordIds.length === records.length;
    const hasSelectedVisibleRecords = selectedVisibleRecordIds.length > 0;
    const tableColumnsCount = isEditing ? EDITING_TABLE_COLUMNS_COUNT : READ_ONLY_TABLE_COLUMNS_COUNT;

    const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
    const [editProgramId, setEditProgramId] = useState<number | undefined>(undefined);
    const [originalProgramId, setOriginalProgramId] = useState<number | undefined>(undefined);
    const [programError, setProgramError] = useState<string | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setEditingRecordId(null);
            setEditProgramId(undefined);
            setOriginalProgramId(undefined);
            setProgramError(undefined);
            onRowEditModeChange?.(false);
        }
    }, [isEditing, onRowEditModeChange]);

    const handleEditStart = (record: ProgramExpensesRecord) => {
        setEditingRecordId(record.id);
        setEditProgramId(record.programId);
        setOriginalProgramId(record.programId);
        setProgramError(undefined);
        onRowEditModeChange?.(true);
    };

    const handleEditCancel = () => {
        setEditingRecordId(null);
        setEditProgramId(undefined);
        setOriginalProgramId(undefined);
        setProgramError(undefined);
        onRowEditModeChange?.(false);
    };

    const handleProgramChange = (recordId: number, value: number | undefined) => {
        setEditProgramId(value);
        const error = validateProgramExpenseProgram({
            recordId,
            programId: value,
            records: allRecords ?? records,
            trigger: 'change',
        });
        setProgramError(error);
    };

    const handleProgramBlur = (recordId: number) => {
        const error = validateProgramExpenseProgram({
            recordId,
            programId: editProgramId,
            records: allRecords ?? records,
            trigger: 'blur',
        });
        setProgramError(error);
    };

    const handleSave = async (recordId: number) => {
        if (editProgramId === undefined || programError || editProgramId === originalProgramId) return;
        const record = records.find((r) => r.id === recordId);
        if (!record) return;

        setIsSaving(true);
        try {
            const success = await onRecordSave?.(
                recordId,
                editProgramId,
                record.reportingYear,
                record.amountUah,
                record.amountUsd,
            );
            if (success) {
                setEditingRecordId(null);
                setEditProgramId(undefined);
                setOriginalProgramId(undefined);
                setProgramError(undefined);
                onRowEditModeChange?.(false);
            }
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = hasSelectedVisibleRecords && !areAllVisibleRecordsSelected;
        }
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
                        onClick={() => onOpenBulkDelete?.()}
                    >
                        {PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON}
                    </Button>
                </div>
            </div>

            <div className={styles['table-wrapper']}>
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
                                        disabled={editingRecordId !== null}
                                        onChange={(event) => onSelectAllToggle?.(event.target.checked)}
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
                                isAddProgramExpenseDisabled={isAddProgramExpenseDisabled || editingRecordId !== null}
                                onAddProgramExpense={onAddProgramExpense}
                            />
                        ) : (
                            records.map((record) => {
                                const isEditedRow = record.id === editingRecordId;
                                const isAcceptDisabled =
                                    editProgramId === undefined ||
                                    Boolean(programError) ||
                                    editProgramId === originalProgramId ||
                                    isSaving;

                                return (
                                    <tr key={record.id} className={styles.tr}>
                                        {isEditing && (
                                            <td className={cn(styles.td, styles['checkbox-td'])}>
                                                <input
                                                    type="checkbox"
                                                    className={styles['row-checkbox']}
                                                    aria-label={`Select record ${record.id}`}
                                                    checked={selectedRecordIds.includes(record.id)}
                                                    disabled={editingRecordId !== null}
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
                                                        value={editProgramId}
                                                        onValueChange={(value) => handleProgramChange(record.id, value)}
                                                        disabled={isSaving}
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
                                                    {programError && (
                                                        <p className={styles['category-edit-error']}>{programError}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                record.programName
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            {formatSummaryAmount(parseAmount(record.amountUah))}
                                        </td>
                                        <td className={styles.td}>
                                            {formatSummaryAmount(parseAmount(record.amountUsd))}
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
                                                                aria-label="Accept record changes"
                                                                onClick={() => handleSave(record.id)}
                                                                disabled={isAcceptDisabled}
                                                            >
                                                                {isSaving ? (
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
                                                                aria-label="Cancel record editing"
                                                                onClick={handleEditCancel}
                                                                disabled={isSaving}
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
                                                                onClick={() => handleEditStart(record)}
                                                                disabled={editingRecordId !== null || isSaving}
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
                                                                disabled={editingRecordId !== null || isSaving}
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
        </div>
    );
};
