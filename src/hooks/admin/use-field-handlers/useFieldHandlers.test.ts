import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useFieldHandlers } from './useFieldHandlers';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';

type FormValues = { name: string; description: string };
type FormErrors = { name?: string; description?: string };

function makeManager(initial?: Partial<FormValues>) {
    const defaultFormState: FormValues = { name: '', description: '', ...initial };
    const validateForm = jest.fn((_v: FormValues, _p: boolean): FormErrors => ({}));
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    return renderHook(() => useFormManager<FormValues, FormErrors>({ defaultFormState, validateForm, onSubmit }));
}

describe('useFieldHandlers', () => {
    it('returns the current value for each configured field', () => {
        const { result: managerResult } = makeManager({ name: 'Alice', description: 'Bio' });

        const { result: fieldsResult } = renderHook(() =>
            useFieldHandlers<FormValues, FormErrors, { name: keyof FormValues & string }>(managerResult.current, [
                { name: 'name' },
                { name: 'description' },
            ]),
        );

        expect(fieldsResult.current.name.value).toBe('Alice');
        expect(fieldsResult.current.description.value).toBe('Bio');
    });

    it('returns empty string when field value is not set', () => {
        const { result: managerResult } = makeManager();

        const { result: fieldsResult } = renderHook(() => useFieldHandlers(managerResult.current, [{ name: 'name' }]));

        expect(fieldsResult.current.name.value).toBe('');
    });

    it('updates formState when onChange is called', () => {
        const { result: managerResult } = makeManager();

        const { result: fieldsResult } = renderHook(() => useFieldHandlers(managerResult.current, [{ name: 'name' }]));

        act(() => {
            fieldsResult.current.name.onChange({
                target: { value: 'Bob' },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(managerResult.current.formState.name).toBe('Bob');
    });

    it('does NOT set an error on change when no error is shown yet', () => {
        const validateName = jest.fn((value: string) => (value.length >= 5 ? undefined : 'Too short'));
        const { result: managerResult } = makeManager();

        const { result: fieldsResult } = renderHook(() =>
            useFieldHandlers(managerResult.current, [{ name: 'name', validateFn: validateName }]),
        );

        act(() => {
            fieldsResult.current.name.onChange({
                target: { value: 'ab' },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(managerResult.current.errors.name).toBeUndefined();
    });

    it('clears the error on change when error is already shown', () => {
        const validateName = jest.fn((value: string) => (value.length >= 5 ? undefined : 'Too short'));
        const { result: managerResult } = makeManager();

        const { result: fieldsResult } = renderHook(() =>
            useFieldHandlers(managerResult.current, [{ name: 'name', validateFn: validateName }]),
        );

        act(() => {
            fieldsResult.current.name.onBlur();
        });

        expect(managerResult.current.errors.name).toBe('Too short');

        act(() => {
            fieldsResult.current.name.onChange({
                target: { value: 'abcde' },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(managerResult.current.errors.name).toBeUndefined();
    });

    it('calls validateFn and sets error on onBlur', () => {
        const validateName = jest.fn((value: string) => (value ? undefined : 'Required'));
        const { result: managerResult } = makeManager();

        const { result: fieldsResult } = renderHook(() =>
            useFieldHandlers(managerResult.current, [{ name: 'name', validateFn: validateName }]),
        );

        act(() => {
            fieldsResult.current.name.onBlur();
        });

        expect(validateName).toHaveBeenCalledWith('', false);
        expect(managerResult.current.errors.name).toBe('Required');
    });

    it('does NOT set errors on onBlur when no validateFn is provided', () => {
        const { result: managerResult } = makeManager();

        const { result: fieldsResult } = renderHook(() => useFieldHandlers(managerResult.current, [{ name: 'name' }]));

        act(() => {
            fieldsResult.current.name.onBlur();
        });

        expect(managerResult.current.errors.name).toBeUndefined();
    });

    it('clears the error after field value becomes valid on blur', () => {
        const validateName = jest.fn((value: string) => (value ? undefined : 'Required'));
        const defaultFormState: FormValues = { name: '', description: '' };
        const validateForm = jest.fn((_v: FormValues, _p: boolean): FormErrors => ({}));
        const onSubmit = jest.fn().mockResolvedValue(undefined);

        // Both hooks in the same renderHook so they share the same render cycle.
        // After onChange triggers a re-render, useFieldHandlers gets the updated
        // formManager and the new onBlur closure captures the fresh value.
        const { result } = renderHook(() => {
            const manager = useFormManager<FormValues, FormErrors>({ defaultFormState, validateForm, onSubmit });
            const fields = useFieldHandlers(manager, [{ name: 'name', validateFn: validateName }]);
            return { manager, fields };
        });

        // first: trigger validation error
        act(() => {
            result.current.fields.name.onBlur();
        });
        expect(result.current.manager.errors.name).toBe('Required');

        // then: type a valid value
        act(() => {
            result.current.fields.name.onChange({
                target: { value: 'Alice' },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        // finally: blur again → error should clear
        act(() => {
            result.current.fields.name.onBlur();
        });
        expect(result.current.manager.errors.name).toBeUndefined();
    });

    it('handles multiple fields independently', () => {
        const validateName = jest.fn((v: string) => (v ? undefined : 'Name required'));
        const validateDesc = jest.fn((v: string) => (v ? undefined : 'Desc required'));
        const { result: managerResult } = makeManager();

        const { result: fieldsResult } = renderHook(() =>
            useFieldHandlers(managerResult.current, [
                { name: 'name', validateFn: validateName },
                { name: 'description', validateFn: validateDesc },
            ]),
        );

        act(() => {
            fieldsResult.current.name.onBlur();
            fieldsResult.current.description.onBlur();
        });

        expect(managerResult.current.errors.name).toBe('Name required');
        expect(managerResult.current.errors.description).toBe('Desc required');
    });

    it('passes isPublishing=false to validateFn on blur', () => {
        const validateName = jest.fn((_value: string, _isPublishing: boolean) => undefined);
        const { result: managerResult } = makeManager();

        const { result: fieldsResult } = renderHook(() =>
            useFieldHandlers(managerResult.current, [{ name: 'name', validateFn: validateName }]),
        );

        act(() => {
            fieldsResult.current.name.onBlur();
        });

        expect(validateName).toHaveBeenCalledWith('', false);
    });

    it('does not affect other fields when one field changes', () => {
        const { result: managerResult } = makeManager({ description: 'Original description' });

        const { result: fieldsResult } = renderHook(() =>
            useFieldHandlers(managerResult.current, [{ name: 'name' }, { name: 'description' }]),
        );

        act(() => {
            fieldsResult.current.name.onChange({
                target: { value: 'New name' },
            } as React.ChangeEvent<HTMLInputElement>);
        });

        expect(managerResult.current.formState.name).toBe('New name');
        expect(managerResult.current.formState.description).toBe('Original description');
    });

    it('works with VisibilityStatus on submit unaffected by hook', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        const defaultFormState: FormValues = { name: 'Test', description: 'Desc' };
        const validateForm = jest.fn((_v: FormValues, _p: boolean): FormErrors => ({}));

        const { result: managerResult } = renderHook(() =>
            useFormManager<FormValues, FormErrors>({ defaultFormState, validateForm, onSubmit }),
        );

        await act(async () => {
            await managerResult.current.submit(VisibilityStatus.Published);
        });

        expect(onSubmit).toHaveBeenCalledWith({ name: 'Test', description: 'Desc' }, VisibilityStatus.Published);
    });

    it('returns empty string via fallback when field key is absent from formState', () => {
        const { result: fieldsResult } = renderHook(() =>
            useFieldHandlers(
                {
                    formState: { name: 'Alice' } as unknown as FormValues,
                    setFormState: jest.fn(),
                    setErrors: jest.fn(),
                },
                [{ name: 'description' }],
            ),
        );

        expect(fieldsResult.current.description.value).toBe('');
    });
});
