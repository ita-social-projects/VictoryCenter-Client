import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import './AddBankDetailsForm.scss';
import { VisibilityStatusLabel } from '../../../../../../components/admin/visibility-status-label/VisibilityStatusLabel';
import { VisibilityStatus } from '../../../../../../types/admin/common';
import { BANK_DETAILS_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/bank-details-schema/bank-details-schema';
import { Button } from '../../../../../../components/admin/button/Button';
import { Input } from '../../input/Input';

export interface AddBankDetailsFormValues {
    name: string;
    receiver: string;
    edrpou: string;
    iban: string;
    paymentPurpose: string;
}

export interface FormErrorState {
    name?: string;
    receiver?: string;
    edrpou?: string;
    iban?: string;
    paymentPurpose?: string;
}

export interface AddBankDetailsFormRef {
    submit: (status: VisibilityStatus) => void;
    isChanged: () => boolean;
    isValid: (isPublishing?: boolean) => boolean;
}

export interface AddBankDetailsFormProps {
    isOpen: boolean;
    initialData?: AddBankDetailsFormValues | null;
    onClose: () => void;
    onSubmit: (data: AddBankDetailsFormValues, status: VisibilityStatus) => void;
    onValidationChange?: (isValid: boolean) => void;
}

const validateForm = (formState: AddBankDetailsFormValues, isPublishing: boolean): FormErrorState => {
    return {
        name: BANK_DETAILS_VALIDATION_FUNCTIONS.validateName(formState.name, isPublishing),
        receiver: BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver(formState.receiver, isPublishing),
        edrpou: BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou(formState.edrpou, isPublishing),
        iban: BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(formState.iban, isPublishing),
        paymentPurpose: BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose(
            formState.paymentPurpose,
            isPublishing,
        ),
    };
};

const hasErrors = (errors: FormErrorState): boolean => {
    return Object.values(errors).some((error) => error !== undefined);
};

export const AddBankDetailsForm = forwardRef<AddBankDetailsFormRef, AddBankDetailsFormProps>(
    ({ isOpen, initialData = null, onClose, onSubmit, onValidationChange }, ref) => {
        const defaultFormState = useMemo<AddBankDetailsFormValues>(
            () => ({
                name: '',
                receiver: '',
                edrpou: '',
                iban: '',
                paymentPurpose: '',
            }),
            [],
        );
        const [formState, setFormState] = useState<AddBankDetailsFormValues>(defaultFormState);
        const [initialFormState, setInitialFormState] = useState<AddBankDetailsFormValues>(defaultFormState);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [errors, setErrors] = useState<FormErrorState>({});

        const reset = useCallback(
            (data: AddBankDetailsFormValues | null) => {
                const newState = data || defaultFormState;
                setFormState(newState);
                setInitialFormState(newState);
                setErrors({});
            },
            [defaultFormState],
        );

        const isChanged = useCallback(() => {
            return JSON.stringify(formState) !== JSON.stringify(initialFormState);
        }, [formState, initialFormState]);

        const isValid = useCallback(
            (isPublishing: boolean = false) => {
                const formErrors = validateForm(formState, isPublishing);
                return !hasErrors(formErrors);
            },
            [formState],
        );

        const submit = useCallback(
            async (status: VisibilityStatus) => {
                if (isSubmitting) return;
                setIsSubmitting(true);
                const isPublishing = status === VisibilityStatus.Published;

                try {
                    const formErrors = validateForm(formState, isPublishing);
                    setErrors(formErrors);

                    if (hasErrors(formErrors)) {
                        return;
                    }

                    await onSubmit(formState, status);
                } finally {
                    setIsSubmitting(false);
                }
            },
            [formState, onSubmit, isSubmitting],
        );

        useEffect(() => {
            const formErrors = validateForm(formState, false);
            const isFormValid = !hasErrors(formErrors);

            if (onValidationChange) {
                onValidationChange(isFormValid);
            }
        }, [formState, onValidationChange]);

        useEffect(() => {
            reset(initialData);
        }, [initialData, reset]);

        const handleChange = (field: keyof AddBankDetailsFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, [field]: value }));
        };

        const handleBlur = (field: keyof AddBankDetailsFormValues) => () => {
            const fieldValidator = {
                name: BANK_DETAILS_VALIDATION_FUNCTIONS.validateName,
                receiver: BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver,
                edrpou: BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou,
                iban: BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban,
                paymentPurpose: BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose,
            }[field];

            setErrors((prev) => ({
                ...prev,
                [field]: fieldValidator(formState[field], false),
            }));
        };

        useImperativeHandle(ref, () => ({
            submit,
            isChanged,
            isValid,
        }));

        if (!isOpen) return null;

        return (
            <form className="form-container" onClick={(e) => e.stopPropagation()}>
                <div className="form-header">
                    <div className="status-container">
                        <VisibilityStatusLabel status={VisibilityStatus.Draft} />
                        <div className="edit-icon"></div>
                    </div>
                    <div className="close-icon">
                        <button onClick={onClose} />
                    </div>
                </div>
                <div className="form-body">
                    <Input
                        name="name"
                        placeholder="Введіть назву банку"
                        isTitle={true}
                        handleChange={handleChange('name')}
                        handleBlur={handleBlur('name')}
                    />
                    {errors.name && <span className="error">{errors.name}</span>}
                    <Input
                        name="receiver"
                        label="Одержувач"
                        handleChange={handleChange('receiver')}
                        handleBlur={handleBlur('receiver')}
                    />
                    {errors.receiver && <span className="error">{errors.receiver}</span>}
                    <Input
                        name="edrpou"
                        label="ЄДРПОУ"
                        handleChange={handleChange('edrpou')}
                        handleBlur={handleBlur('edrpou')}
                    />
                    {errors.edrpou && <span className="error">{errors.edrpou}</span>}
                    <Input
                        name="iban"
                        label="IBAN(UAH)"
                        prefix="UA"
                        handleChange={handleChange('iban')}
                        handleBlur={handleBlur('iban')}
                    />
                    {errors.iban && <span className="error">{errors.iban}</span>}
                    <Input
                        name="paymentPurpose"
                        label="Призначення платежу"
                        handleChange={handleChange('paymentPurpose')}
                        handleBlur={handleBlur('paymentPurpose')}
                    />
                    {errors.paymentPurpose && <span className="error">{errors.paymentPurpose}</span>}
                </div>
                <div className="form-footer">
                    <Button buttonStyle="secondary">Додати нове поле</Button>
                    <div className="actions">
                        <Button onClick={onClose} buttonStyle="secondary">
                            Відмінити
                        </Button>
                        <Button onClick={() => submit(VisibilityStatus.Published)} buttonStyle="primary">
                            Опублікувати
                        </Button>
                    </div>
                </div>
            </form>
        );
    },
);
