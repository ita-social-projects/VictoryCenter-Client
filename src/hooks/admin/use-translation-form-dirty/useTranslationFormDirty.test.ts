import { renderHook } from '@testing-library/react';
import { useTranslationFormDirty } from './useTranslationFormDirty';

describe('useTranslationFormDirty', () => {
    const defaultFormState = { title: '' };

    it('reports not dirty when formState matches initialData', () => {
        const onDirtyChange = jest.fn();

        renderHook(() => useTranslationFormDirty({ title: 'abc' }, { title: 'abc' }, defaultFormState, onDirtyChange));

        expect(onDirtyChange).toHaveBeenCalledWith(false);
    });

    it('reports dirty when formState differs from initialData', () => {
        const onDirtyChange = jest.fn();

        renderHook(() => useTranslationFormDirty({ title: 'abc' }, { title: 'xyz' }, defaultFormState, onDirtyChange));

        expect(onDirtyChange).toHaveBeenCalledWith(true);
    });

    it('falls back to defaultFormState when initialData is null', () => {
        const onDirtyChange = jest.fn();

        renderHook(() => useTranslationFormDirty(defaultFormState, null, defaultFormState, onDirtyChange));

        expect(onDirtyChange).toHaveBeenCalledWith(false);
    });

    it('does nothing when onDirtyChange is not provided', () => {
        expect(() =>
            renderHook(() => useTranslationFormDirty({ title: 'abc' }, { title: 'abc' }, defaultFormState)),
        ).not.toThrow();
    });
});
