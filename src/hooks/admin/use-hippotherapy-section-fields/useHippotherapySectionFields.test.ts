import { renderHook, act } from '@testing-library/react';
import { useHippotherapySectionFields, HippotherapyImageTitleDescriptionContent } from './useHippotherapySectionFields';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

describe('useHippotherapySectionFields', () => {
    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const initialValue: HippotherapyImageTitleDescriptionContent = {
        title: 'Initial title',
        description: 'Initial description',
        image: null,
        imageId: null,
    };

    let onChange: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('calls onChange with the updated image', () => {
        const { result } = renderHook(() => useHippotherapySectionFields({ value: initialValue, onChange }));

        const image = { base64: 'data', mimeType: 'image/png' };
        act(() => {
            result.current.handleImageChange(image);
        });

        expect(onChange).toHaveBeenCalledWith({ ...initialValue, image });
    });

    it('calls onChange with the updated title and sets the validation error', () => {
        validateTextMock().mockReturnValueOnce('Title error');
        const { result } = renderHook(() => useHippotherapySectionFields({ value: initialValue, onChange }));

        act(() => {
            result.current.handleTitleChange('New title');
        });

        expect(onChange).toHaveBeenCalledWith({ ...initialValue, title: 'New title' });
        expect(result.current.titleError).toBe('Title error');
    });

    it('calls onChange with the updated description and sets the validation error', () => {
        validateTextMock().mockReturnValueOnce('Description error');
        const { result } = renderHook(() => useHippotherapySectionFields({ value: initialValue, onChange }));

        act(() => {
            result.current.handleDescriptionChange('New description');
        });

        expect(onChange).toHaveBeenCalledWith({ ...initialValue, description: 'New description' });
        expect(result.current.descriptionError).toBe('Description error');
    });

    it('sets the image error and reports it to the optional callback', () => {
        const onImageError = jest.fn();
        const { result } = renderHook(() =>
            useHippotherapySectionFields({ value: initialValue, onChange, onImageError }),
        );

        act(() => {
            result.current.handleImageErrorChange('image too big');
        });

        expect(result.current.imageError).toBe('image too big');
        expect(onImageError).toHaveBeenCalledWith('image too big');
    });

    it('does not throw when onImageError is not provided', () => {
        const { result } = renderHook(() => useHippotherapySectionFields({ value: initialValue, onChange }));

        expect(() => {
            act(() => {
                result.current.handleImageErrorChange('image too big');
            });
        }).not.toThrow();
        expect(result.current.imageError).toBe('image too big');
    });
});
