import { getCounterLength } from '@/utils/functions/get-counter-length/get-counter-length';
import styles from './InputErrorWithCharacterCounter.module.scss';
import cn from 'classnames';

export interface InputErrorWithCharacterCounterProps {
    error?: string;
    maxLength: number;
    counterId: string;
    htmlFor: string;
    value?: string;
    currentLength?: number;
    isWhiteLabel?: boolean;
    containerClassName?: string;
}

export const InputErrorWithCharacterCounter = ({
    error,
    maxLength,
    counterId,
    htmlFor,
    value = '',
    currentLength,
    isWhiteLabel,
    containerClassName,
}: InputErrorWithCharacterCounterProps) => {
    const displayedLength = currentLength ?? getCounterLength(value);
    return (
        <div className={cn(styles.container, containerClassName)}>
            <div className={styles['error-section']}>{error || ''}</div>
            <div className={cn(styles['counter-section'], { [styles['white-label']]: isWhiteLabel })}>
                <output id={counterId} htmlFor={htmlFor}>
                    {displayedLength}/{maxLength}
                </output>
            </div>
        </div>
    );
};
