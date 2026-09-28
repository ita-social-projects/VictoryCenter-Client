import { createTranslationFieldHandlers } from './createTranslationFieldHandlers';

describe('createTranslationFieldHandlers', () => {
    it('handleChange sets the raw value and reports the real-time validation result', () => {
        const setValue = jest.fn();
        const setError = jest.fn();
        const validateRealTime = jest.fn().mockReturnValue('too long');
        const validateOnBlur = jest.fn();

        const { handleChange } = createTranslationFieldHandlers(setValue, setError, validateRealTime, validateOnBlur);

        handleChange({ target: { value: 'hello' } } as React.ChangeEvent<HTMLInputElement>);

        expect(setValue).toHaveBeenCalledWith('hello');
        expect(validateRealTime).toHaveBeenCalledWith('hello');
        expect(setError).toHaveBeenCalledWith('too long');
    });

    it('handleBlur normalises the current value and reports the blur validation result', () => {
        const setValue = jest.fn();
        const setError = jest.fn();
        const validateRealTime = jest.fn();
        const validateOnBlur = jest.fn().mockReturnValue(undefined);

        const { handleBlur } = createTranslationFieldHandlers(setValue, setError, validateRealTime, validateOnBlur);

        handleBlur('  padded value  ')();

        expect(setValue).toHaveBeenCalledWith('padded value');
        expect(validateOnBlur).toHaveBeenCalledWith('padded value');
        expect(setError).toHaveBeenCalledWith(undefined);
    });
});
