import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';

export const createTranslationFieldHandlers = (
    setValue: (value: string) => void,
    setError: (error: string | undefined) => void,
    validateRealTime: (value: string) => string | undefined,
    validateOnBlur: (value: string) => string | undefined,
    normalize: (value: string) => string = getNormalizedInputText,
) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setValue(value);
        setError(validateRealTime(value));
    };

    const handleBlur = (currentValue: string) => () => {
        const normalised = normalize(currentValue);
        setValue(normalised);
        setError(validateOnBlur(normalised));
    };

    return { handleChange, handleBlur };
};
