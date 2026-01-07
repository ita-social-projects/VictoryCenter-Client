import styles from './InputErrorWithCharacterCounter.module.scss';

export interface InputErrorWithCharacterCounterProps {
    error?: string;
    currentLength: number;
    maxLength: number;
    counterId: string;
    htmlFor: string;
}

export const InputErrorWithCharacterCounter = ({
    error,
    currentLength,
    maxLength,
    counterId,
    htmlFor,
}: InputErrorWithCharacterCounterProps) => {
    return (
        <div className={styles['container']}>
            <div className={styles['error-section']}>{error || ''}</div>
            <div className={styles['counter-section']}>
                <output id={counterId} htmlFor={htmlFor}>
                    {currentLength}/{maxLength}
                </output>
            </div>
        </div>
    );
};
