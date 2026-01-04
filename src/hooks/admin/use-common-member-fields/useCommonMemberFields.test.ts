import { renderHook, act } from '@testing-library/react';
import { useCommonMemberFields } from './useCommonMemberFields';

describe('useCommonMemberFields', () => {
    const initialFormState = {
        fullName: '',
        description: '',
    };

    let setFormState: jest.Mock;
    let setErrors: jest.Mock;

    beforeEach(() => {
        setFormState = jest.fn();
        setErrors = jest.fn();
        jest.clearAllMocks();
    });

    it('should return handler functions', () => {
        const { result } = renderHook(() =>
            useCommonMemberFields({
                formState: initialFormState,
                setFormState,
                setErrors,
            }),
        );

        expect(result.current.handleFullNameChange).toBeInstanceOf(Function);
        expect(result.current.handleFullNameBlur).toBeInstanceOf(Function);
        expect(result.current.handleDescriptionChange).toBeInstanceOf(Function);
        expect(result.current.handleDescriptionBlur).toBeInstanceOf(Function);
    });

    it('should update fullName on change', () => {
        const { result } = renderHook(() =>
            useCommonMemberFields({
                formState: initialFormState,
                setFormState,
                setErrors,
            }),
        );

        act(() => {
            result.current.handleFullNameChange({
                target: { value: 'John Doe' },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(setFormState).toHaveBeenCalledWith(expect.any(Function));

        const updaterFn = setFormState.mock.calls[0][0];
        const newState = updaterFn({ fullName: '', description: '' });
        expect(newState.fullName).toBe('John Doe');
        expect(newState.description).toBe('');
    });

    it('should update description on change', () => {
        const { result } = renderHook(() =>
            useCommonMemberFields({
                formState: initialFormState,
                setFormState,
                setErrors,
            }),
        );

        act(() => {
            result.current.handleDescriptionChange({
                target: { value: 'Test description' },
            } as React.ChangeEvent<HTMLTextAreaElement>);
        });

        expect(setFormState).toHaveBeenCalledWith(expect.any(Function));

        const updaterFn = setFormState.mock.calls[0][0];
        const newState = updaterFn({ fullName: '', description: '' });
        expect(newState.fullName).toBe('');
        expect(newState.description).toBe('Test description');
    });

    it('should call handleFullNameBlur without errors', () => {
        const { result } = renderHook(() =>
            useCommonMemberFields({
                formState: { fullName: 'John Doe', description: '' },
                setFormState,
                setErrors,
            }),
        );

        expect(() => {
            act(() => {
                result.current.handleFullNameBlur();
            });
        }).not.toThrow();
    });

    it('should call handleDescriptionBlur without errors', () => {
        const { result } = renderHook(() =>
            useCommonMemberFields({
                formState: { fullName: '', description: 'Test' },
                setFormState,
                setErrors,
            }),
        );

        expect(() => {
            act(() => {
                result.current.handleDescriptionBlur();
            });
        }).not.toThrow();
    });

    it('should handle multiple field changes', () => {
        const { result } = renderHook(() =>
            useCommonMemberFields({
                formState: initialFormState,
                setFormState,
                setErrors,
            }),
        );

        act(() => {
            result.current.handleFullNameChange({
                target: { value: 'John' },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        act(() => {
            result.current.handleDescriptionChange({
                target: { value: 'Description' },
            } as React.ChangeEvent<HTMLTextAreaElement>);
        });

        expect(setFormState).toHaveBeenCalledTimes(2);
    });
});
