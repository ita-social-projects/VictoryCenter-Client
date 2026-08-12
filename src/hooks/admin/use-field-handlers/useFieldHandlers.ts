import React from 'react';
import { UseFormManagerReturn } from '@/hooks/admin/use-form-manager/useFormManager';

export interface FieldBinding {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur: () => void;
}

export interface FieldHandlerConfig<TFormValues> {
    name: keyof TFormValues & string;
    validateFn?: (value: string, isPublishing: boolean) => unknown;
}

export type FieldHandlerBindings<TFields extends string> = { [K in TFields]: FieldBinding };

export function useFieldHandlers<TFormValues, TFormErrors, TConfig extends FieldHandlerConfig<TFormValues>>(
    formManager: Pick<UseFormManagerReturn<TFormValues, TFormErrors>, 'formState' | 'setFormState' | 'setErrors'>,
    fieldConfigs: TConfig[],
): FieldHandlerBindings<TConfig['name']> {
    const { formState, setFormState, setErrors } = formManager;

    return Object.fromEntries(
        fieldConfigs.map(({ name, validateFn }) => {
            const value = (formState as Record<string, string>)[name] ?? '';

            const binding: FieldBinding = {
                value,
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                    const targetValue = e.target.value;
                    setFormState((prev) => ({ ...prev, [name]: targetValue }) as TFormValues);
                    if (validateFn) {
                        const error = validateFn(targetValue, false);
                        setErrors((prev) => {
                            const currentError = (prev as Record<string, string | undefined>)[name];
                            if (!currentError) return prev;

                            return { ...prev, [name]: error } as TFormErrors;
                        });
                    }
                },
                onBlur: () => {
                    if (validateFn) {
                        const error = validateFn(value, false);
                        setErrors((prev) => ({ ...prev, [name]: error }) as TFormErrors);
                    }
                },
            };

            return [name, binding];
        }),
    ) as FieldHandlerBindings<TConfig['name']>;
}
