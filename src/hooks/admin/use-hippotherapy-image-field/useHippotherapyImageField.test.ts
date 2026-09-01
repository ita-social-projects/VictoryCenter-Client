import { renderHook, act } from '@testing-library/react';
import { useHippotherapyImageField } from './useHippotherapyImageField';
import { HippotherapyImageValue } from '@/types/admin/hippotherapy-page';

describe('useHippotherapyImageField', () => {
    const initialValue: HippotherapyImageValue = {
        image: null,
        imageId: null,
    };

    let onChange: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
    });

    it('calls onChange with the updated image', () => {
        const { result } = renderHook(() => useHippotherapyImageField({ value: initialValue, onChange }));

        const image = { base64: 'data', mimeType: 'image/png' };
        act(() => {
            result.current.handleImageChange(image);
        });

        expect(onChange).toHaveBeenCalledWith({ ...initialValue, image });
    });

    it('keeps the other fields when the image changes', () => {
        const valueWithId = { ...initialValue, imageId: 42 };
        const { result } = renderHook(() => useHippotherapyImageField({ value: valueWithId, onChange }));

        act(() => {
            result.current.handleImageChange(null);
        });

        expect(onChange).toHaveBeenCalledWith({ image: null, imageId: 42 });
    });

    it('sets the image error and reports it to the optional callback', () => {
        const onImageError = jest.fn();
        const { result } = renderHook(() => useHippotherapyImageField({ value: initialValue, onChange, onImageError }));

        act(() => {
            result.current.handleImageErrorChange('image too big');
        });

        expect(result.current.imageError).toBe('image too big');
        expect(onImageError).toHaveBeenCalledWith('image too big');
    });

    it('does not throw when onImageError is not provided', () => {
        const { result } = renderHook(() => useHippotherapyImageField({ value: initialValue, onChange }));

        expect(() => {
            act(() => {
                result.current.handleImageErrorChange('image too big');
            });
        }).not.toThrow();
        expect(result.current.imageError).toBe('image too big');
    });

    it('clears the image error', () => {
        const onImageError = jest.fn();
        const { result } = renderHook(() => useHippotherapyImageField({ value: initialValue, onChange, onImageError }));

        act(() => {
            result.current.handleImageErrorChange('image too big');
        });

        act(() => {
            result.current.handleImageErrorChange(null);
        });

        expect(result.current.imageError).toBeNull();
        expect(onImageError).toHaveBeenLastCalledWith(null);
    });
});
