import { AmountEditCell } from '../amount-edit-cell/AmountEditCell';
import { RowEditActions } from '../row-edit-actions/RowEditActions';
import styles from './AmountEditRow.module.scss';
import cn from 'classnames';

interface AmountEditRowProps {
    record: { id: number; amountUah: string; amountUsd: string };
    isEditing: boolean;
    isEditedRow: boolean;
    amountUah: string;
    amountUsd: string;
    amountUahError?: string;
    amountUsdError?: string;
    usdMismatchMessage?: string;
    isSavingCurrentRow: boolean;
    isAcceptDisabled: boolean;
    isAnotherRowEditing: boolean;
    onAmountChange: (recordId: number, field: 'amountUah' | 'amountUsd', value: string) => void;
    onAmountBlur: (recordId: number, field: 'amountUah' | 'amountUsd') => void;
    onAccept: () => void;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const AmountEditRow = ({
    record,
    isEditing,
    isEditedRow,
    amountUah,
    amountUsd,
    amountUahError,
    amountUsdError,
    usdMismatchMessage,
    isSavingCurrentRow,
    isAcceptDisabled,
    isAnotherRowEditing,
    onAmountChange,
    onAmountBlur,
    onAccept,
    onClose,
    onEdit,
    onDelete,
}: AmountEditRowProps) => (
    <>
        <td className={cn(styles.td, { [styles['amount-edit-td']]: isEditedRow })}>
            {isEditedRow ? (
                <AmountEditCell
                    recordId={record.id}
                    field="amountUah"
                    value={amountUah}
                    error={amountUahError}
                    isDisabled={isSavingCurrentRow}
                    onChange={onAmountChange}
                    onBlur={onAmountBlur}
                />
            ) : (
                record.amountUah
            )}
        </td>
        <td className={cn(styles.td, { [styles['amount-edit-td']]: isEditedRow })}>
            {isEditedRow ? (
                <AmountEditCell
                    recordId={record.id}
                    field="amountUsd"
                    value={amountUsd}
                    error={amountUsdError}
                    mismatchMessage={usdMismatchMessage}
                    isDisabled={isSavingCurrentRow}
                    onChange={onAmountChange}
                    onBlur={onAmountBlur}
                />
            ) : (
                record.amountUsd
            )}
        </td>
        {isEditing && (
            <td className={cn(styles.td, styles['actions-td'])}>
                <RowEditActions
                    recordId={record.id}
                    isEditMode={isEditedRow}
                    isAcceptDisabled={isAcceptDisabled}
                    isSaving={isSavingCurrentRow}
                    isActionsDisabled={isAnotherRowEditing}
                    onAccept={onAccept}
                    onClose={onClose}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </td>
        )}
    </>
);
