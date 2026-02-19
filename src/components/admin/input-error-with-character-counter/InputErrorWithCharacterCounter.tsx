import styles from './InputErrorWithCharacterCounter.module.scss';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import cn from 'classnames';

export interface InputErrorWithCharacterCounterProps {
    error?: string;
    maxLength: number;
    counterId: string;
    htmlFor: string;
    value: string;
    isWhiteLabel?: boolean;
}

export const InputErrorWithCharacterCounter = ({
    error,
    maxLength,
    counterId,
    htmlFor,
    value,
    isWhiteLabel,
}: InputErrorWithCharacterCounterProps) => {
    const normalizedLength = getNormalizedInputText(value).length;
    return (
        <div className={styles.container}>
            <div className={styles['error-section']}>{error || ''}</div>
            <div className={cn(styles['counter-section'], { [styles['white-label']]: isWhiteLabel })}>
                <output id={counterId} htmlFor={htmlFor}>
                    {normalizedLength}/{maxLength}
                </output>
            </div>
        </div>
    );
};
