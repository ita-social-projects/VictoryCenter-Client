import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';

export const createTranslationFieldHandlers = (
    setValue: (value: string) => void,
    setError: (error: string | undefined) => void,
    validateRealTime: (value: string) => string | undefined,
    validateOnBlur: (value: string) => string | undefined,
) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setValue(value);
        setError(validateRealTime(value));
    };

    const handleBlur = (currentValue: string) => () => {
        const normalised = getNormalizedInputText(currentValue);
        setValue(normalised);
        setError(validateOnBlur(normalised));
    };

    return { handleChange, handleBlur };
};
