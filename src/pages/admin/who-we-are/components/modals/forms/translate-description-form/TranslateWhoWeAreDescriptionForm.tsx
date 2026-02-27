import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { forwardRef, useEffect } from 'react';
import styles from './TranslationWhoWeAreDescriptionForm.module.scss';
import cn from 'classnames';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { GeneralFormProps, GeneralFormRef } from '../../strategies/who-we-are-modal-strategy';

export interface TranslateWhoWeAreDescriptionFormValues {
    description: string;
}

export interface TranslateWhoWeAreDescriptionFormErrorState {
    description: string | undefined | string[];
    [key: string]: string | string[] | undefined;
}

export interface TranslateWhoWeAreDescriptionFormRef extends GeneralFormRef {}

export interface TranslateWhoWeAreDescriptionFormProps 
    extends GeneralFormProps<TranslateWhoWeAreDescriptionFormValues> {}

const DEFAULT_FORM_STATE: TranslateWhoWeAreDescriptionFormValues = {
    description: '',
};

const validateForm = (
    formState: TranslateWhoWeAreDescriptionFormValues,
    _isPublishing: boolean,
): TranslateWhoWeAreDescriptionFormErrorState => {
    return {
        description: WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(formState.description),
    };
};

export const TranslateWhoWeAreDescriptionForm = forwardRef<
    TranslateWhoWeAreDescriptionFormRef,
    TranslateWhoWeAreDescriptionFormProps
>(
    (
        {
            initialData = null,
            formDisabled,
            onSubmit,
            onValidationChange,
            onDirtyChange,
            limits,
        }: TranslateWhoWeAreDescriptionFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateWhoWeAreDescriptionFormValues,
            TranslateWhoWeAreDescriptionFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data, _status) => onSubmit(data),
        });

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData);
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        const handleDescriptionChange = (value: string) => {
            setFormState((prev) => ({ ...prev, description: value }));
        };

        const handleDescriptionBlur = () => {
            const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(formState.description);
            setErrors((prev) => ({ ...prev, description: error }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={cn(styles.form, 'translate-who-we-are-form')}
                data-testid="translate-who-we-are-form"
                noValidate
            >
                <div className={cn(styles.root, 'common-who-we-are-fields')}>
                    <div className={styles['form-group']}>
                        <RichTextInputGroup
                            label={WHO_WE_ARE_TEXT.FORM?.LABEL?.DESCRIPTION || 'Description'}
                            id="description"
                            name="description"
                            value={formState.description}
                            onChange={handleDescriptionChange}
                            onBlur={handleDescriptionBlur}
                            disabled={isSubmitting || formDisabled}
                            maxLength={limits.descriptionLimit}
                            error={typeof errors.description === 'string' ? errors.description : undefined}
                        />
                    </div>
                </div>
            </form>
        );
    },
);
