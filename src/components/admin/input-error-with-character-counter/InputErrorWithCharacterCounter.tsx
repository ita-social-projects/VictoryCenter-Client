import './InputErrorWithCharacterCounter.scss';

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
    const hasError = Boolean(error);

    return (
        <div
            className={
                hasError
                    ? 'input-error-with-character-counter'
                    : 'input-error-with-character-counter input-error-with-character-counter--no-error'
            }
        >
            {hasError && <span className="input-error-with-character-counter__error">{error}</span>}
            <output
                className="input-error-with-character-counter__counter"
                id={counterId}
                htmlFor={htmlFor}
                aria-live="polite"
            >
                {currentLength}/{maxLength}
            </output>
        </div>
    );
};
