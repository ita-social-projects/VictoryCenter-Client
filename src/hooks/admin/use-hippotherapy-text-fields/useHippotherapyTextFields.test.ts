import { renderHook, act } from '@testing-library/react';
import { useHippotherapyTextFields, HippotherapyTitleDescriptionContent } from './useHippotherapyTextFields';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

describe('useHippotherapyTextFields', () => {
    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const initialValue: HippotherapyTitleDescriptionContent = {
        title: 'Initial title',
        description: 'Initial description',
    };

    let onChange: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('calls onChange with the updated title without validating', () => {
        const { result } = renderHook(() => useHippotherapyTextFields({ value: initialValue, onChange }));

        act(() => {
            result.current.handleTitleChange('New title');
        });

        expect(onChange).toHaveBeenCalledWith({ ...initialValue, title: 'New title' });
        expect(result.current.titleError).toBeUndefined();
        expect(validateTextMock()).not.toHaveBeenCalled();
    });

    it('sets the title error on blur', () => {
        validateTextMock().mockReturnValueOnce('Title error');
        const { result } = renderHook(() => useHippotherapyTextFields({ value: initialValue, onChange }));

        act(() => {
            result.current.handleTitleBlur();
        });

        expect(result.current.titleError).toBe('Title error');
    });

    it('re-validates the title on change once an error is shown', () => {
        validateTextMock().mockReturnValueOnce('Title error');
        const { result } = renderHook(() => useHippotherapyTextFields({ value: initialValue, onChange }));

        act(() => {
            result.current.handleTitleBlur();
        });

        expect(result.current.titleError).toBe('Title error');

        validateTextMock().mockReturnValue(undefined);

        act(() => {
            result.current.handleTitleChange('A valid title');
        });

        expect(result.current.titleError).toBeUndefined();
    });

    it('calls onChange with the updated description without validating', () => {
        const { result } = renderHook(() => useHippotherapyTextFields({ value: initialValue, onChange }));

        act(() => {
            result.current.handleDescriptionChange('New description');
        });

        expect(onChange).toHaveBeenCalledWith({ ...initialValue, description: 'New description' });
        expect(result.current.descriptionError).toBeUndefined();
    });

    it('sets the description error on blur', () => {
        validateTextMock().mockReturnValueOnce('Description error');
        const { result } = renderHook(() => useHippotherapyTextFields({ value: initialValue, onChange }));

        act(() => {
            result.current.handleDescriptionBlur();
        });

        expect(result.current.descriptionError).toBe('Description error');
    });

    it('does not set an error for an empty optional description', () => {
        validateTextMock().mockReturnValue('Description error');
        const emptyDescription = { ...initialValue, description: '' };
        const { result } = renderHook(() =>
            useHippotherapyTextFields({ value: emptyDescription, onChange, isDescriptionOptional: true }),
        );

        act(() => {
            result.current.handleDescriptionBlur();
        });

        expect(result.current.descriptionError).toBeUndefined();
    });

    it('validates a filled optional description', () => {
        validateTextMock().mockReturnValueOnce('Description error');
        const { result } = renderHook(() =>
            useHippotherapyTextFields({ value: initialValue, onChange, isDescriptionOptional: true }),
        );

        act(() => {
            result.current.handleDescriptionBlur();
        });

        expect(result.current.descriptionError).toBe('Description error');
    });
});
