import { renderHook, act } from '@testing-library/react';
import { useValidatedRichTextField } from './useValidatedRichTextField';

describe('useValidatedRichTextField', () => {
    let onChange: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
    });

    it('calls onChange without validating', () => {
        const { result } = renderHook(() => useValidatedRichTextField({ value: '', onChange }));

        act(() => {
            result.current.handleChange('New value');
        });

        expect(onChange).toHaveBeenCalledWith('New value');
        expect(result.current.error).toBeUndefined();
    });

    it('sets an error on blur when the value is too short', () => {
        const { result } = renderHook(() => useValidatedRichTextField({ value: 'short', onChange }));

        act(() => {
            result.current.handleBlur();
        });

        expect(result.current.error).toBeDefined();
    });

    it('does not set an error on blur when the value is valid', () => {
        const { result } = renderHook(() => useValidatedRichTextField({ value: 'A long enough value', onChange }));

        act(() => {
            result.current.handleBlur();
        });

        expect(result.current.error).toBeUndefined();
    });

    it('strips html before measuring the length', () => {
        const { result } = renderHook(() => useValidatedRichTextField({ value: '<p>short</p>', onChange }));

        act(() => {
            result.current.handleBlur();
        });

        expect(result.current.error).toBeDefined();
    });

    it('respects a custom minimum length', () => {
        const { result } = renderHook(() => useValidatedRichTextField({ value: 'Hippo', onChange, minLength: 5 }));

        act(() => {
            result.current.handleBlur();
        });

        expect(result.current.error).toBeUndefined();
    });

    it('does not set an error for an empty optional value', () => {
        const { result } = renderHook(() => useValidatedRichTextField({ value: '', onChange, isOptional: true }));

        act(() => {
            result.current.handleBlur();
        });

        expect(result.current.error).toBeUndefined();
    });

    it('validates a filled optional value', () => {
        const { result } = renderHook(() => useValidatedRichTextField({ value: 'short', onChange, isOptional: true }));

        act(() => {
            result.current.handleBlur();
        });

        expect(result.current.error).toBeDefined();
    });

    it('clears the error on change once it has been shown', () => {
        const { result, rerender } = renderHook(({ value }) => useValidatedRichTextField({ value, onChange }), {
            initialProps: { value: 'short' },
        });

        act(() => {
            result.current.handleBlur();
        });

        expect(result.current.error).toBeDefined();

        act(() => {
            result.current.handleChange('A long enough value');
        });

        expect(result.current.error).toBeUndefined();
    });
});
