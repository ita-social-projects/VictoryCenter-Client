import { renderHook, act } from '@testing-library/react';
import { useInputWithCharacterLimit } from './useInputWithCharacterLimit';
import { useTemporaryWarning } from '@/hooks/admin/use-temporary-warning/useTemporaryWarning';

jest.mock('@/hooks/admin/use-temporary-warning/useTemporaryWarning');

const mockUseTemporaryWarning = useTemporaryWarning as jest.MockedFunction<typeof useTemporaryWarning>;

describe('useInputWithCharacterLimit', () => {
    const mockOnChange = jest.fn();
    const mockOnFocus = jest.fn();
    const mockOnBlur = jest.fn();
    const mockOnWarningChange = jest.fn();
    const mockShowTemporaryWarning = jest.fn();
    const mockClearWarning = jest.fn();

    const defaultProps = {
        value: '',
        maxLength: 10,
        name: 'testInput',
        id: 'test-input',
        onChange: mockOnChange,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseTemporaryWarning.mockReturnValue({
            localWarning: null,
            showTemporaryWarning: mockShowTemporaryWarning,
            clearWarning: mockClearWarning,
        });
    });

    const createMockEvent = (value: string) =>
        ({
            target: { value, name: 'testInput', id: 'test-input' },
            currentTarget: { value, name: 'testInput', id: 'test-input' },
        }) as unknown as React.ChangeEvent<HTMLInputElement>;

    const triggerChange = (result: any, value: string) => {
        const mockEvent = createMockEvent(value);
        act(() => {
            result.current.handleChange(mockEvent);
        });
        return mockEvent;
    };

    describe('Initialization', () => {
        it('should initialize with correct default values', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));

            expect(result.current.isFocused).toBe(false);
            expect(result.current.currentLength).toBe(0);
            expect(result.current.localWarning).toBe(null);
            expect(result.current.showClearButton).toBe(false);
        });

        it('should calculate current length using raw input length', () => {
            const testValue = '  test  ';
            const rawLength = testValue.length;

            const { result } = renderHook(() => useInputWithCharacterLimit({ ...defaultProps, value: testValue }));

            expect(result.current.currentLength).toBe(rawLength);
        });

        it('should pass onWarningChange to useTemporaryWarning', () => {
            renderHook(() => useInputWithCharacterLimit({ ...defaultProps, onWarningChange: mockOnWarningChange }));

            expect(mockUseTemporaryWarning).toHaveBeenCalledWith({ onWarningChange: mockOnWarningChange });
        });
    });

    describe('handleChange', () => {
        describe('Valid input (within limit)', () => {
            it('should call onChange when input length is within limit', () => {
                const inputValue = 'hello';
                const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));

                const mockEvent = triggerChange(result, inputValue);

                expect(mockOnChange).toHaveBeenCalledWith({
                    ...mockEvent,
                    target: {
                        ...mockEvent.target,
                        value: inputValue,
                    },
                    currentTarget: {
                        ...mockEvent.target,
                        value: inputValue,
                    },
                });
                expect(mockClearWarning).toHaveBeenCalled();
                expect(mockShowTemporaryWarning).not.toHaveBeenCalled();
            });

            it('should allow input with spaces when raw length is within limit', () => {
                const inputValue = '  test  ';
                const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));

                const mockEvent = triggerChange(result, inputValue);

                expect(mockOnChange).toHaveBeenCalledWith({
                    ...mockEvent,
                    target: {
                        ...mockEvent.target,
                        value: inputValue,
                    },
                    currentTarget: {
                        ...mockEvent.target,
                        value: inputValue,
                    },
                });
            });

            it('should clear warning when input becomes valid', () => {
                const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));
                triggerChange(result, 'valid');
                expect(mockClearWarning).toHaveBeenCalled();
            });

            it('should handle edge case at exact maxLength', () => {
                const inputValue = 'a'.repeat(defaultProps.maxLength);
                const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));
                triggerChange(result, inputValue);
                expect(mockOnChange).toHaveBeenCalled();
                expect(mockShowTemporaryWarning).not.toHaveBeenCalled();
            });
        });

        describe('Invalid input (exceeds limit)', () => {
            it('should prevent input when length exceeds maxLength', () => {
                const inputValue = 'this is a very long text that exceeds the limit';
                const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));
                triggerChange(result, inputValue);
                expect(mockOnChange).toHaveBeenCalled();
                expect(mockClearWarning).not.toHaveBeenCalled();
            });

            it('should show warning when maxLength exceeded and maxLimitWarning is provided', () => {
                const warningMessage = 'Character limit exceeded';
                const { result } = renderHook(() =>
                    useInputWithCharacterLimit({ ...defaultProps, maxLimitWarning: warningMessage }),
                );
                triggerChange(result, 'this text is too long for the limit');
                expect(mockShowTemporaryWarning).toHaveBeenCalledWith(warningMessage);
                expect(mockOnChange).toHaveBeenCalled();
            });

            it('should not show warning when maxLength exceeded but maxLimitWarning is not provided', () => {
                const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));
                triggerChange(result, 'this text exceeds limit');
                expect(mockShowTemporaryWarning).not.toHaveBeenCalled();
                expect(mockOnChange).toHaveBeenCalled();
            });

            it('should block a trailing space when length exceeds maxLength', () => {
                const warningMessage = 'Character limit exceeded';
                const atLimitValue = 'a'.repeat(defaultProps.maxLength);
                const { result } = renderHook(() =>
                    useInputWithCharacterLimit({
                        ...defaultProps,
                        value: atLimitValue,
                        maxLimitWarning: warningMessage,
                    }),
                );
                triggerChange(result, atLimitValue + ' ');
                expect(mockShowTemporaryWarning).toHaveBeenCalledWith(warningMessage);
                expect(mockOnChange).toHaveBeenCalled();
            });

            it('should block a leading space when length exceeds maxLength', () => {
                const warningMessage = 'Character limit exceeded';
                const atLimitValue = 'a'.repeat(defaultProps.maxLength);
                const { result } = renderHook(() =>
                    useInputWithCharacterLimit({
                        ...defaultProps,
                        value: atLimitValue,
                        maxLimitWarning: warningMessage,
                    }),
                );
                triggerChange(result, ' ' + atLimitValue);
                expect(mockShowTemporaryWarning).toHaveBeenCalledWith(warningMessage);
                expect(mockOnChange).toHaveBeenCalled();
            });

            it('should block extra spaces when raw length exceeds maxLength even if normalized is below', () => {
                const warningMessage = 'Character limit exceeded';
                const inputValue = '  aaaa  aaaa  ';
                const { result } = renderHook(() =>
                    useInputWithCharacterLimit({
                        ...defaultProps,
                        maxLimitWarning: warningMessage,
                    }),
                );
                triggerChange(result, inputValue);
                expect(mockShowTemporaryWarning).toHaveBeenCalledWith(warningMessage);
                expect(mockOnChange).toHaveBeenCalled();
            });
        });
    });

    describe('handleFocus', () => {
        it('should set isFocused to true and call onFocus callback if provided', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit({ ...defaultProps, onFocus: mockOnFocus }));
            const mockEvent = {} as React.FocusEvent<HTMLInputElement>;
            act(() => {
                result.current.handleFocus(mockEvent);
            });
            expect(result.current.isFocused).toBe(true);
            expect(mockOnFocus).toHaveBeenCalledWith(mockEvent);
        });

        it('should not throw error if onFocus is not provided', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));
            expect(() => {
                act(() => {
                    result.current.handleFocus({} as React.FocusEvent<HTMLInputElement>);
                });
            }).not.toThrow();
        });
    });

    describe('handleBlur', () => {
        it('should set isFocused to false and call onBlur callback if provided', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit({ ...defaultProps, onBlur: mockOnBlur }));
            act(() => {
                result.current.handleFocus({} as React.FocusEvent<HTMLInputElement>);
            });
            const mockEvent = {} as React.FocusEvent<HTMLInputElement>;
            act(() => {
                result.current.handleBlur(mockEvent);
            });
            expect(result.current.isFocused).toBe(false);
            expect(mockOnBlur).toHaveBeenCalledWith(mockEvent);
        });

        it('should trim value and call onChange on blur when value has leading/trailing spaces', () => {
            const valueWithSpaces = '  hello  ';
            const { result } = renderHook(() =>
                useInputWithCharacterLimit({ ...defaultProps, value: valueWithSpaces }),
            );
            act(() => {
                result.current.handleBlur({} as React.FocusEvent<HTMLInputElement>);
            });
            expect(mockOnChange).toHaveBeenCalledWith({
                target: { value: 'hello', name: 'testInput', id: 'test-input' },
            });
        });

        it('should not call onChange on blur when value has no leading/trailing spaces', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit({ ...defaultProps, value: 'hello' }));
            act(() => {
                result.current.handleBlur({} as React.FocusEvent<HTMLInputElement>);
            });
            expect(mockOnChange).not.toHaveBeenCalled();
        });

        it('should trim whitespace-only value to empty string on blur', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit({ ...defaultProps, value: '   \n   ' }));
            act(() => {
                result.current.handleBlur({} as React.FocusEvent<HTMLInputElement>);
            });
            expect(mockOnChange).toHaveBeenCalledWith({
                target: { value: '', name: 'testInput', id: 'test-input' },
            });
        });
    });

    describe('handleClear', () => {
        it('should clear warning', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));
            act(() => {
                result.current.handleClear();
            });
            expect(mockClearWarning).toHaveBeenCalled();
        });

        it('should call onChange with empty value', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));
            act(() => {
                result.current.handleClear();
            });
            expect(mockOnChange).toHaveBeenCalledWith({
                target: { value: '', name: 'testInput', id: 'test-input' },
            });
        });
    });

    describe('showClearButton', () => {
        it('should be false when not focused', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit({ ...defaultProps, value: 'test' }));
            expect(result.current.showClearButton).toBe(false);
        });

        it('should be true when focused and has value', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit({ ...defaultProps, value: 'test' }));
            act(() => {
                result.current.handleFocus({} as React.FocusEvent<HTMLInputElement>);
            });
            expect(result.current.showClearButton).toBe(true);
        });

        it('should be false when focused but value is empty', () => {
            const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));
            act(() => {
                result.current.handleFocus({} as React.FocusEvent<HTMLInputElement>);
            });
            expect(result.current.showClearButton).toBe(false);
        });

        it('should be false when disabled even if focused and has value', () => {
            const { result } = renderHook(() =>
                useInputWithCharacterLimit({ ...defaultProps, value: 'test', disabled: true }),
            );
            act(() => {
                result.current.handleFocus({} as React.FocusEvent<HTMLInputElement>);
            });
            expect(result.current.showClearButton).toBe(false);
        });
    });

    describe('localWarning', () => {
        it('should return warning from useTemporaryWarning', () => {
            const warningMessage = 'Test warning';
            mockUseTemporaryWarning.mockReturnValue({
                localWarning: warningMessage,
                showTemporaryWarning: mockShowTemporaryWarning,
                clearWarning: mockClearWarning,
            });
            const { result } = renderHook(() => useInputWithCharacterLimit(defaultProps));
            expect(result.current.localWarning).toBe(warningMessage);
        });
    });

    describe('works with HTMLTextAreaElement', () => {
        it('should work with textarea element', () => {
            const inputValue = 'textarea';
            const rawLength = inputValue.length;
            expect(rawLength).toBeLessThanOrEqual(defaultProps.maxLength);

            const { result } = renderHook(() => useInputWithCharacterLimit<HTMLTextAreaElement>(defaultProps as any));
            const mockEvent = {
                target: { value: inputValue, name: 'testInput', id: 'test-input' },
                currentTarget: { value: inputValue, name: 'testInput', id: 'test-input' },
            } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

            act(() => {
                result.current.handleChange(mockEvent);
            });

            expect(mockOnChange).toHaveBeenCalled();
        });
    });

    describe('handleChange truncation', () => {
        it('should truncate "Заголовок" to 60 characters', () => {
            const { result } = renderHook(() =>
                useInputWithCharacterLimit({
                    ...defaultProps,
                    maxLength: 60,
                    name: 'title',
                }),
            );

            const longText = 'a'.repeat(61);
            const truncatedText = 'a'.repeat(60);
            const mockEvent = {
                target: { value: longText, name: 'title', id: 'title-input' },
                currentTarget: { value: longText, name: 'title', id: 'title-input' },
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            act(() => {
                result.current.handleChange(mockEvent);
            });

            expect(mockOnChange).toHaveBeenCalledWith({
                ...mockEvent,
                target: {
                    ...mockEvent.target,
                    value: truncatedText,
                },
                currentTarget: {
                    ...mockEvent.target,
                    value: truncatedText,
                },
            });
        });

        it('should truncate "Опис" to 600 characters', () => {
            const { result } = renderHook(() =>
                useInputWithCharacterLimit({
                    ...defaultProps,
                    maxLength: 600,
                    name: 'description',
                }),
            );

            const longText = 'b'.repeat(601);
            const truncatedText = 'b'.repeat(600);
            const mockEvent = {
                target: { value: longText, name: 'description', id: 'description-input' },
                currentTarget: { value: longText, name: 'description', id: 'description-input' },
            } as unknown as React.ChangeEvent<HTMLTextAreaElement>;

            act(() => {
                result.current.handleChange(mockEvent);
            });

            expect(mockOnChange).toHaveBeenCalledWith({
                ...mockEvent,
                target: {
                    ...mockEvent.target,
                    value: truncatedText,
                },
                currentTarget: {
                    ...mockEvent.target,
                    value: truncatedText,
                },
            });
        });
    });
});
