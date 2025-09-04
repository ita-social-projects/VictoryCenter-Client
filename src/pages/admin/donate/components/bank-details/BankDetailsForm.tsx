import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import './BankDetailsForm.scss';
import { Button } from '../../../../../components/admin/button/Button';
import { Input } from '../input/Input';
import { BANK_DETAILS_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/bank-details-schema/bank-details-schema';
import { ConfirmationModal } from '../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { BaseFormProps, BaseFormRef } from '../generic-details/GenericDetails';

export type BankDetailsFormMode = 'create' | 'edit' | 'view';

export interface BankDetailsFormValues {
    id?: number;
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

export type BankDetailsFormRef = BaseFormRef;

export type BankDetailsFormProps = BaseFormProps<BankDetailsFormValues>;

const validateForm = (formState: BankDetailsFormValues, isPublishing: boolean): FormErrorState => ({
    name: BANK_DETAILS_VALIDATION_FUNCTIONS.validateName(formState.name, isPublishing),
    receiver: BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver(formState.receiver, isPublishing),
    edrpou: BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou(formState.edrpou, isPublishing),
    iban: BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(formState.iban, isPublishing),
    paymentPurpose: BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose(formState.paymentPurpose, isPublishing),
});

const hasErrors = (errors: FormErrorState): boolean => Object.values(errors).some((error) => error !== undefined);

export const BankDetailsForm = forwardRef<BankDetailsFormRef, BankDetailsFormProps>(
    ({ isOpen = true, initialData = null, initialMode = 'view', onClose, onSubmit, onDelete }, ref) => {
        const defaultFormState = useMemo<BankDetailsFormValues>(
            () => ({
                name: '',
                receiver: '',
                edrpou: '',
                iban: '',
                paymentPurpose: '',
            }),
            [],
        );

        const [formState, setFormState] = useState<BankDetailsFormValues>(defaultFormState);
        const [initialFormState, setInitialFormState] = useState<BankDetailsFormValues>(defaultFormState);
        const [errors, setErrors] = useState<FormErrorState>({});
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);
        const [mode, setMode] = useState<BankDetailsFormMode>(initialMode ?? 'view');
        const [isExpanded, setIsExpanded] = useState(mode !== 'view');

        const editable = mode !== 'view';

        useEffect(() => {
            if (mode !== 'view') {
                setIsExpanded(true);
            }
        }, [mode]);

        useEffect(() => {
            const newState = initialData || defaultFormState;
            setFormState(newState);
            setInitialFormState(newState);
            setErrors({});
        }, [initialData, defaultFormState]);

        const isChanged = useCallback(() => {
            return JSON.stringify(formState) !== JSON.stringify(initialFormState);
        }, [formState, initialFormState]);

        const isValid = useCallback(
            (isPublishing: boolean = false) => {
                const formErrors = validateForm(formState, isPublishing);
                setErrors(formErrors);
                return !hasErrors(formErrors);
            },
            [formState],
        );

        const submit = useCallback(async () => {
            if (isSubmitting || !onSubmit) return;
            setIsSubmitting(true);

            const isPublishing = mode === 'create';
            const formErrors = validateForm(formState, isPublishing);
            setErrors(formErrors);

            if (hasErrors(formErrors)) {
                setIsSubmitting(false);
                return;
            }

            try {
                await onSubmit(formState);

                setInitialFormState(formState);
                if (mode === 'edit') {
                    setMode('view');
                }
            } finally {
                setIsSubmitting(false);
            }
        }, [formState, onSubmit, isSubmitting, mode]);

        useImperativeHandle(ref, () => ({
            submit,
            isChanged,
            isValid,
        }));

        const handleChange = (field: keyof BankDetailsFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, [field]: value }));
        };

        const handleBlur = (field: keyof BankDetailsFormValues) => () => {
            if (field === 'id') {
                return;
            }
            const validator = {
                name: BANK_DETAILS_VALIDATION_FUNCTIONS.validateName,
                receiver: BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver,
                edrpou: BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou,
                iban: BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban,
                paymentPurpose: BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose,
            }[field];
            setErrors((prev) => ({ ...prev, [field]: validator(formState[field], false) }));
        };

        const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setMode((prev) => (prev === 'view' ? 'edit' : 'view'));
            setIsExpanded(false);
        };

        const handleEditCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();

            if (mode === 'create') {
                onClose?.();
            } else if (mode === 'edit') {
                setFormState(initialFormState);
                setErrors({});
                setMode('view');
            }
        };

        const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (mode === 'create') {
                onClose?.();
                return;
            }

            e.preventDefault();
            setIsDeleting(true);
        };

        const handleDelete = async () => {
            if (!initialData?.id || !onDelete) {
                setIsDeleting(false);
                return;
            }
            try {
                await onDelete(initialData.id);
            } finally {
                setIsDeleting(false);
                onClose?.();
            }
        };

        const handleDeleteCancel = () => {
            setIsDeleting(false);
        };

        const hasEmptyFields = useMemo(() => {
            return Object.values(formState).some((value) => !String(value).trim());
        }, [formState]);

        if (!isOpen) return null;

        return (
            <form className={`bank-form bank-form-${mode}`} onClick={(e) => e.stopPropagation()}>
                <div className="form-header">
                    <button className={`edit-btn ${mode}`} onClick={handleEditClick} disabled={mode === 'create'} />
                    <button className="delete-btn" type="button" onClick={handleDeleteClick}>
                        <div>Видалити банк</div>
                        <div className="delete-btn-icon"></div>
                    </button>
                </div>

                <div className="form-body">
                    {mode === 'view' && (
                        <div className="form-body-name" onClick={() => setIsExpanded((prev) => !prev)}>
                            {formState.name}
                            <span className={`arrow ${isExpanded ? 'expanded' : ''}`}></span>
                        </div>
                    )}
                    {(mode === 'create' || mode === 'edit') && (
                        <div className="form-field">
                            <Input
                                name="name"
                                isTitle
                                value={formState.name}
                                editable={editable}
                                handleChange={handleChange('name')}
                                handleBlur={handleBlur('name')}
                                placeholder="Введіть назву банку"
                            />
                            {errors.name && <span className="error">{errors.name}</span>}
                        </div>
                    )}
                    {isExpanded && (
                        <div className="form-body-main">
                            <div className="form-field">
                                <Input
                                    name="receiver"
                                    label="Одержувач"
                                    value={formState.receiver}
                                    editable={editable}
                                    handleChange={handleChange('receiver')}
                                    handleBlur={handleBlur('receiver')}
                                />
                                {errors.receiver && <span className="error">{errors.receiver}</span>}
                            </div>

                            <div className="form-field">
                                <Input
                                    name="edrpou"
                                    label="ЄДРПОУ"
                                    value={formState.edrpou}
                                    editable={editable}
                                    handleChange={handleChange('edrpou')}
                                    handleBlur={handleBlur('edrpou')}
                                />
                                {errors.edrpou && <span className="error">{errors.edrpou}</span>}
                            </div>

                            <div className="form-field">
                                <Input
                                    name="iban"
                                    label="IBAN(UAH)"
                                    prefix="UA"
                                    value={formState.iban}
                                    editable={editable}
                                    handleChange={handleChange('iban')}
                                    handleBlur={handleBlur('iban')}
                                />
                                {errors.iban && <span className="error">{errors.iban}</span>}
                            </div>

                            <div className="form-field">
                                <Input
                                    name="paymentPurpose"
                                    label="Призначення платежу"
                                    value={formState.paymentPurpose}
                                    editable={editable}
                                    handleChange={handleChange('paymentPurpose')}
                                    handleBlur={handleBlur('paymentPurpose')}
                                />
                                {errors.paymentPurpose && <span className="error">{errors.paymentPurpose}</span>}
                            </div>
                        </div>
                    )}
                </div>

                {editable && (
                    <div className="form-footer">
                        <div className="actions">
                            <Button type="button" onClick={handleEditCancel} buttonStyle="secondary">
                                Відмінити
                            </Button>
                            <Button
                                type="button"
                                onClick={() => submit()}
                                buttonStyle="primary"
                                disabled={isSubmitting || hasEmptyFields}
                            >
                                {mode === 'create' ? 'Опублікувати' : 'Оновити'}
                            </Button>
                        </div>
                    </div>
                )}
                <ConfirmationModal
                    isOpen={isDeleting}
                    isButtonsDisabled={false}
                    title={'Зміни буде втрачено. Видалити реквізити?'}
                    onConfirm={handleDelete}
                    onCancel={handleDeleteCancel}
                    onClose={handleDeleteCancel}
                    confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                    cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                />
            </form>
        );
    },
);
