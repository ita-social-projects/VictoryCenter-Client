import { ReactComponent as InfoIcon } from '@/assets/icons/info.svg';
import styles from './AmountEditCell.module.scss';
import cn from 'classnames';

interface AmountEditCellProps {
    recordId: number;
    field: 'amountUah' | 'amountUsd';
    value: string;
    error?: string;
    mismatchMessage?: string;
    isDisabled: boolean;
    onChange: (recordId: number, field: 'amountUah' | 'amountUsd', value: string) => void;
    onBlur: (recordId: number, field: 'amountUah' | 'amountUsd') => void;
}

export const AmountEditCell = ({
    recordId,
    field,
    value,
    error,
    mismatchMessage,
    isDisabled,
    onChange,
    onBlur,
}: AmountEditCellProps) => (
    <div className={styles['amount-edit-wrapper']}>
        <input
            type="text"
            className={cn(styles['amount-edit-input'], {
                [styles['amount-edit-input-error']]: error,
            })}
            value={value}
            aria-label={`Amount ${field === 'amountUah' ? 'UAH' : 'USD'} record ${recordId}`}
            onChange={(e) => onChange(recordId, field, e.target.value)}
            onBlur={() => onBlur(recordId, field)}
            disabled={isDisabled}
        />
        {error && <p className={styles['amount-edit-error']}>{error}</p>}
        {mismatchMessage && (
            <div className={styles['amount-edit-info']}>
                <InfoIcon className={styles['amount-edit-info-icon']} aria-hidden="true" />
                <p className={styles['amount-edit-info-text']}>{mismatchMessage}</p>
            </div>
        )}
    </div>
);
