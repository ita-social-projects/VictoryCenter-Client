import { renderHook, act } from '@testing-library/react';
import { useHippotherapySectionFields, HippotherapyImageTitleDescriptionContent } from './useHippotherapySectionFields';

describe('useHippotherapySectionFields', () => {
    const initialValue: HippotherapyImageTitleDescriptionContent = {
        title: 'Initial title',
        description: 'Initial description',
        image: null,
        imageId: null,
    };

    let onChange: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
    });

    it('calls onChange with the updated image', () => {
        const { result } = renderHook(() => useHippotherapySectionFields({ value: initialValue, onChange }));

        const image = { base64: 'data', mimeType: 'image/png' };
        act(() => {
            result.current.handleImageChange(image);
        });

        expect(onChange).toHaveBeenCalledWith({ ...initialValue, image });
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

    it('exposes the text field handlers from useHippotherapyTextFields', () => {
        const { result } = renderHook(() => useHippotherapySectionFields({ value: initialValue, onChange }));

        expect(result.current.handleTitleChange).toBeDefined();
        expect(result.current.handleTitleBlur).toBeDefined();
        expect(result.current.handleDescriptionChange).toBeDefined();
        expect(result.current.handleDescriptionBlur).toBeDefined();
    });
});