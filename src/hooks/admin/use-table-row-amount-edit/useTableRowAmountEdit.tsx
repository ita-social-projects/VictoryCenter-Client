import { useState, useCallback } from 'react';
import { useFundsAmountEdit } from '@/hooks/admin/use-funds-amount-edit/useFundsAmountEdit';
import { AmountEditRow } from '@/pages/admin/reports/components/amount-edit-row/AmountEditRow';

export interface AmountRowEditState {
    recordId: number;
    originalAmountUah: string;
    originalAmountUsd: string;
    amountUah: string;
    amountUsd: string;
    errors: { amountUah?: string; amountUsd?: string };
    usdMismatchMessage?: string;
}

interface UseTableRowAmountEditOptions<TState extends AmountRowEditState> {
    isEditing: boolean;
    isRowActionsDisabled: boolean;
    exchangeRate?: string | null;
    mismatchMessage: string;
    isAcceptButtonDisabled: (state: TState | null) => boolean;
    onRowEditModeChange?: (isEditMode: boolean) => void;
}

type AmountRecord = { id: number; amountUah: string; amountUsd: string };

export const useTableRowAmountEdit = <TState extends AmountRowEditState>({
    isEditing,
    isRowActionsDisabled,
    exchangeRate,
    mismatchMessage,
    isAcceptButtonDisabled,
    onRowEditModeChange,
}: UseTableRowAmountEditOptions<TState>) => {
    const [rowEditState, setRowEditState] = useState<TState | null>(null);
    const [savingRecordId, setSavingRecordId] = useState<number | null>(null);
    const isAnyRowEditing = rowEditState !== null;

    const setRowEditMode = useCallback(
        (nextState: TState | null) => {
            setRowEditState(nextState);
            onRowEditModeChange?.(nextState !== null);
        },
        [onRowEditModeChange],
    );

    const handleCloseRowEdit = useCallback(() => {
        setRowEditMode(null);
    }, [setRowEditMode]);

    const { handleAmountChange, handleAmountBlur } = useFundsAmountEdit<TState>({
        exchangeRate,
        mismatchMessage,
        setEditState: setRowEditState,
    });

    const renderAmountEditRow = useCallback(
        (record: AmountRecord, onAccept: () => void, onEdit: () => void, onDelete: () => void) => {
            const isEditedRow = rowEditState?.recordId === record.id;
            const isSavingCurrentRow = savingRecordId === record.id;
            const isAnotherRowEditing =
                (isAnyRowEditing && !isEditedRow) || savingRecordId !== null || isRowActionsDisabled;
            const isAcceptDisabled = !isEditedRow || isAcceptButtonDisabled(rowEditState);

            return (
                <AmountEditRow
                    record={record}
                    isEditing={isEditing}
                    isEditedRow={isEditedRow}
                    amountUah={isEditedRow ? rowEditState!.amountUah : record.amountUah}
                    amountUsd={isEditedRow ? rowEditState!.amountUsd : record.amountUsd}
                    amountUahError={rowEditState?.errors.amountUah}
                    amountUsdError={rowEditState?.errors.amountUsd}
                    usdMismatchMessage={rowEditState?.usdMismatchMessage}
                    isSavingCurrentRow={isSavingCurrentRow}
                    isAcceptDisabled={isAcceptDisabled}
                    isAnotherRowEditing={isAnotherRowEditing}
                    onAmountChange={handleAmountChange}
                    onAmountBlur={handleAmountBlur}
                    onAccept={onAccept}
                    onClose={handleCloseRowEdit}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            );
        },
        [
            rowEditState,
            isAnyRowEditing,
            savingRecordId,
            isRowActionsDisabled,
            isAcceptButtonDisabled,
            isEditing,
            handleAmountChange,
            handleAmountBlur,
            handleCloseRowEdit,
        ],
    );

    return {
        rowEditState,
        setRowEditState,
        savingRecordId,
        setSavingRecordId,
        isAnyRowEditing,
        setRowEditMode,
        renderAmountEditRow,
    };
};
