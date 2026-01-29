import { renderHook, act } from '@testing-library/react';
import { useCardValidation } from './useCardValidation';
import * as textFormatters from '@/utils/functions/formatters/text-formatters';

jest.mock('@/utils/functions/formatters/text-formatters');

describe('useCardValidation', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (textFormatters.getTrimmedInputText as jest.Mock).mockImplementation((text) => text.trim());
    });

    describe('handleChange', () => {
        it('should call onChange with new value', () => {
            const { result } = renderHook(() => useCardValidation({ value: '', onChange: mockOnChange }));

            const event = {
                target: { value: 'New text' },
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleChange(event);
            });

            expect(mockOnChange).toHaveBeenCalledWith('New text');
        });

        it('should limit input to max length', () => {
            const { result } = renderHook(() => useCardValidation({ value: '', onChange: mockOnChange, max: 5 }));

            const event = {
                target: { value: 'This is too long' },
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleChange(event);
            });

            expect(mockOnChange).toHaveBeenCalledWith('This ');
        });

        it('should clear error when input reaches minimum length', () => {
            const { result } = renderHook(() => useCardValidation({ value: '', onChange: mockOnChange, min: 5 }));

            // Set initial error
            act(() => {
                const event = { target: { value: 'ab' } } as React.ChangeEvent<HTMLInputElement>;
                result.current.handleChange(event);
            });

            expect(result.current.error).toBeUndefined();

            // Type more to reach min length
            act(() => {
                const event = { target: { value: 'abcde' } } as React.ChangeEvent<HTMLInputElement>;
                result.current.handleChange(event);
            });

            expect(result.current.error).toBeUndefined();
        });

        it('should not call onChange if onChange is not provided', () => {
            const { result } = renderHook(() => useCardValidation({ value: '' }));

            const event = {
                target: { value: 'New text' },
            } as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleChange(event);
            });

            expect(mockOnChange).not.toHaveBeenCalled();
        });
    });

    describe('handleBlur', () => {
        it('should set error when required field is empty', () => {
            const { result } = renderHook(() =>
                useCardValidation({ value: '', onChange: mockOnChange, required: true }),
            );

            const event = {
                target: { value: '   ' },
            } as React.FocusEvent<HTMLInputElement>;

            act(() => {
                result.current.handleBlur(event);
            });

            expect(result.current.error).toBe("Поле обов'язкове");
        });

        it('should set error when value is below minimum length', () => {
            const { result } = renderHook(() => useCardValidation({ value: '', onChange: mockOnChange, min: 10 }));

            const event = {
                target: { value: 'short' },
            } as React.FocusEvent<HTMLInputElement>;

            act(() => {
                result.current.handleBlur(event);
            });

            expect(result.current.error).toBe('Не менше 10 символів');
        });

        it('should set error when value exceeds maximum length', () => {
            const { result } = renderHook(() => useCardValidation({ value: '', onChange: mockOnChange, max: 10 }));

            const event = {
                target: { value: 'This text is too long' },
            } as React.FocusEvent<HTMLInputElement>;

            act(() => {
                result.current.handleBlur(event);
            });

            expect(result.current.error).toBe('Не більше 10 символів');
        });

        it('should not set error when value is valid', () => {
            const { result } = renderHook(() =>
                useCardValidation({ value: '', onChange: mockOnChange, min: 2, max: 10 }),
            );

            const event = {
                target: { value: 'valid' },
            } as React.FocusEvent<HTMLInputElement>;

            act(() => {
                result.current.handleBlur(event);
            });

            expect(result.current.error).toBeUndefined();
        });

        it('should call onChange with trimmed value', () => {
            const { result } = renderHook(() => useCardValidation({ value: '', onChange: mockOnChange }));

            const event = {
                target: { value: '  text  ' },
            } as React.FocusEvent<HTMLInputElement>;

            act(() => {
                result.current.handleBlur(event);
            });

            expect(mockOnChange).toHaveBeenCalledWith('text');
        });

        it('should not require field when required is false', () => {
            const { result } = renderHook(() =>
                useCardValidation({ value: '', onChange: mockOnChange, required: false }),
            );

            const event = {
                target: { value: '' },
            } as React.FocusEvent<HTMLInputElement>;

            act(() => {
                result.current.handleBlur(event);
            });

            expect(result.current.error).toBeUndefined();
        });

        it('should use default max value', () => {
            const { result } = renderHook(() => useCardValidation({ value: '', onChange: mockOnChange }));

            const event = {
                target: { value: 'a'.repeat(301) },
            } as React.FocusEvent<HTMLInputElement>;

            act(() => {
                result.current.handleBlur(event);
            });

            expect(result.current.error).toBe('Не більше 300 символів');
        });
    });

    describe('initial state', () => {
        it('should have no error initially', () => {
            const { result } = renderHook(() => useCardValidation({ value: '' }));

            expect(result.current.error).toBeUndefined();
        });
    });
});
