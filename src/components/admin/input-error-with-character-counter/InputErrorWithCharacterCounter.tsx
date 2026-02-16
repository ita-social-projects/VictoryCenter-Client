import styles from './InputErrorWithCharacterCounter.module.scss';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';

export interface InputErrorWithCharacterCounterProps {
    error?: string;
    maxLength: number;
    counterId: string;
    htmlFor: string;
    value: string;
    isWhiteTheme?: boolean;
}

export const InputErrorWithCharacterCounter = ({
    error,
    maxLength,
    counterId,
    htmlFor,
    value,
    isWhiteTheme,
}: InputErrorWithCharacterCounterProps) => {
    const normalizedLength = getNormalizedInputText(value).length;
    return (
        <div className={styles.container}>
            <div className={styles['error-section']}>{error || ''}</div>
            <div className={`${styles['counter-section']} ${isWhiteTheme ? styles['white-theme'] : ''}`}>
                <output id={counterId} htmlFor={htmlFor}>
                    {normalizedLength}/{maxLength}
                </output>
            </div>
        </div>
    );
};
