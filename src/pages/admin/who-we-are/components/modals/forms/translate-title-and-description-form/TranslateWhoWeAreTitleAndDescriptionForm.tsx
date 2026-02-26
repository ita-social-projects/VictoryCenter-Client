import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { forwardRef, useEffect } from 'react';
import styles from './TranslateWhoWeAreTitleAndDescriptionForm.module.scss';
import cn from 'classnames';
import { WHO_WE_ARE_TEXT, WHO_WE_ARE_VALIDATION } from '@/const/admin/who-we-are';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';

export interface TranslateWhoWeAreTitleAndDescriptionFormValues {
    title: string;
    description: string;
}

export interface TranslateWhoWeAreTitleAndDescriptionFormErrorState {
    // TODO: Get well known how it works
    title: string | undefined | string[];
    description: string | undefined | string[];
    [key: string]: string | string[] | undefined;
}

export interface TranslateWhoWeAreTitleAndDescriptionFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateWhoWeAreTitleAndDescriptionFormProps {
    initialData?: TranslateWhoWeAreTitleAndDescriptionFormValues | null;
    formDisabled?: boolean;
    onSubmit: (data: TranslateWhoWeAreTitleAndDescriptionFormValues, status?: VisibilityStatus) => void | Promise<void>;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateWhoWeAreTitleAndDescriptionFormValues = {
    title: '',
    description: '',
};

const validateForm = (
    formState: TranslateWhoWeAreTitleAndDescriptionFormValues,
    _isPublishing: boolean,
): TranslateWhoWeAreTitleAndDescriptionFormErrorState => {
    return {
        title: WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(formState.title),
        description: WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(formState.description),
    };
};

export const TranslateWhoWeAreTitleAndDescriptionForm = forwardRef<
    TranslateWhoWeAreTitleAndDescriptionFormRef,
    TranslateWhoWeAreTitleAndDescriptionFormProps
>(
    (
        {
            initialData = null,
            formDisabled,
            onSubmit,
            onValidationChange,
            onDirtyChange,
        }: TranslateWhoWeAreTitleAndDescriptionFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateWhoWeAreTitleAndDescriptionFormValues,
            TranslateWhoWeAreTitleAndDescriptionFormErrorState
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

        const handleTitleChange = (value: string) => {
            setFormState((prev) => ({ ...prev, title: value }));
        };

        const handleTitleBlur = () => {
            const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(formState.title);
            setErrors((prev) => ({ ...prev, title: error }));
        };

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
                            label={WHO_WE_ARE_TEXT.FORM?.LABEL?.TITLE || 'Title'}
                            id="title"
                            name="title"
                            value={formState.title}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            disabled={isSubmitting || formDisabled}
                            maxLength={WHO_WE_ARE_VALIDATION.title.max}
                            error={typeof errors.title === 'string' ? errors.title : undefined}
                        />
                        <RichTextInputGroup
                            label={WHO_WE_ARE_TEXT.FORM?.LABEL?.DESCRIPTION || 'Description'}
                            id="description"
                            name="description"
                            value={formState.description}
                            onChange={handleDescriptionChange}
                            onBlur={handleDescriptionBlur}
                            disabled={isSubmitting || formDisabled}
                            maxLength={WHO_WE_ARE_VALIDATION.description.max}
                            error={typeof errors.description === 'string' ? errors.description : undefined}
                        />
                    </div>
                </div>
            </form>
        );
    },
);
