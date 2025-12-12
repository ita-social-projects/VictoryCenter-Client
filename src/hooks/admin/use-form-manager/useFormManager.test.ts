import { renderHook, act } from '@testing-library/react';
import { useFormManager } from './useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import React from 'react';

type FormValues = { name: string; age: number };
type FormErrors = { name?: string; age?: string };

describe('useFormManager', () => {
    const defaultFormState: FormValues = { name: '', age: 0 };
    const initialData: FormValues = { name: 'Alice', age: 30 };

    let validateForm: jest.Mock<FormErrors, [FormValues, boolean]>;
    let onSubmit: jest.Mock<Promise<void>, [FormValues, VisibilityStatus]>;
    let onValidationChange: jest.Mock<void, [boolean]>;

    beforeEach(() => {
        validateForm = jest.fn((values: FormValues, _: boolean) => {
            const errors: FormErrors = {};
            if (!values.name) errors.name = 'Required';
            if (values.age < 0) errors.age = 'Invalid';
            return errors;
        });
        onSubmit = jest.fn().mockResolvedValue(undefined);
        onValidationChange = jest.fn();
    });

    it('should initialize with default form state', () => {
        const { result } = renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                validateForm,
                onSubmit,
            }),
        );

        expect(result.current.formState).toEqual(defaultFormState);
        expect(result.current.errors).toEqual({});
    });

    it('should reset form state', () => {
        const { result } = renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                validateForm,
                onSubmit,
            }),
        );

        act(() => {
            result.current.setFormState({ name: 'Bob', age: 25 });
        });
        expect(result.current.formState).toEqual({ name: 'Bob', age: 25 });

        act(() => {
            result.current.reset();
        });
        expect(result.current.formState).toEqual(defaultFormState);
        expect(result.current.errors).toEqual({});
    });

    it('should initialize with initialData and reset correctly', () => {
        const { result } = renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                initialData,
                validateForm,
                onSubmit,
            }),
        );

        expect(result.current.formState).toEqual(initialData);

        act(() => {
            result.current.setFormState({ name: 'Bob', age: 25 });
        });
        expect(result.current.formState).toEqual({ name: 'Bob', age: 25 });

        act(() => {
            result.current.reset(initialData);
        });
        expect(result.current.formState).toEqual(initialData);

        act(() => {
            result.current.reset();
        });
        expect(result.current.formState).toEqual(defaultFormState);
    });

    it('should track dirty state correctly', () => {
        const { result } = renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                validateForm,
                onSubmit,
            }),
        );

        expect(result.current.isDirty()).toBe(false);

        act(() => {
            result.current.setFormState({ name: 'Changed', age: 0 });
        });

        expect(result.current.isDirty()).toBe(true);
    });

    it('should validate form correctly', () => {
        const { result } = renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                validateForm,
                onSubmit,
            }),
        );

        expect(result.current.isValid()).toBe(false); // name is empty
        act(() => {
            result.current.setFormState({ name: 'Alice', age: 0 });
        });
        expect(result.current.isValid()).toBe(true);
    });

    it('should call onValidationChange on state change', () => {
        renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                validateForm,
                onSubmit,
                onValidationChange,
            }),
        );

        expect(onValidationChange).toHaveBeenCalledWith(false);
    });

    it('should submit successfully when valid', async () => {
        const { result } = renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                validateForm,
                onSubmit,
            }),
        );

        act(() => {
            result.current.setFormState({ name: 'Alice', age: 10 });
        });

        await act(async () => {
            await result.current.submit(VisibilityStatus.Published);
        });

        expect(onSubmit).toHaveBeenCalledWith({ name: 'Alice', age: 10 }, VisibilityStatus.Published);
    });

    it('should not submit when invalid', async () => {
        const { result } = renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                validateForm,
                onSubmit,
            }),
        );

        act(() => {
            result.current.setFormState({ name: '', age: -1 });
        });

        await act(async () => {
            await result.current.submit(VisibilityStatus.Published);
        });

        expect(onSubmit).not.toHaveBeenCalled();
        expect(result.current.errors).toEqual({ name: 'Required', age: 'Invalid' });
    });

    it('should handle concurrent submit calls', async () => {
        const delayedSubmit = jest
            .fn()
            .mockImplementation(() => new Promise<void>((resolve) => setTimeout(resolve, 50)));

        const { result } = renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                validateForm,
                onSubmit: delayedSubmit,
            }),
        );

        act(() => {
            result.current.setFormState({ name: 'Alice', age: 10 });
        });

        await act(async () => {
            const p1 = result.current.submit(VisibilityStatus.Published);
            const p2 = result.current.submit(VisibilityStatus.Published);
            await Promise.all([p1, p2]);
        });

        expect(delayedSubmit).toHaveBeenCalledTimes(1);
    });

    it('should expose submit, isValid, isDirty via ref', () => {
        const ref = React.createRef<FormManagerRef>();
        renderHook(() =>
            useFormManager<FormValues, FormErrors>({
                defaultFormState,
                validateForm,
                onSubmit,
                ref,
            }),
        );

        expect(ref.current).not.toBeNull();
        expect(ref.current?.submit).toBeDefined();
        expect(ref.current?.isValid).toBeDefined();
        expect(ref.current?.isDirty).toBeDefined();
        expect(ref.current?.isDirty()).toBe(false);
    });
});
