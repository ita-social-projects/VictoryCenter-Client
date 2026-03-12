import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { forwardRef, useEffect, useRef } from 'react';
import styles from './TranslationWhoWeAreDescriptionForm.module.scss';
import cn from 'classnames';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { GeneralFormProps, GeneralFormRef } from '../../strategies/who-we-are-modal-strategy';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

export interface TranslateWhoWeAreDescriptionFormValues {
    description: string;
}

export interface TranslateWhoWeAreDescriptionFormErrorState {
    description: string | undefined;
    [key: string]: string | undefined;
}

export interface TranslateWhoWeAreDescriptionFormRef extends GeneralFormRef { }

export interface TranslateWhoWeAreDescriptionFormProps
    extends GeneralFormProps<TranslateWhoWeAreDescriptionFormValues> { }

const DEFAULT_FORM_STATE: TranslateWhoWeAreDescriptionFormValues = {
    description: '<p><br></p>',
};

type FormFieldName = keyof TranslateWhoWeAreDescriptionFormValues;

const validateForm = (
    formState: TranslateWhoWeAreDescriptionFormValues,
    _isPublishing: boolean,
): TranslateWhoWeAreDescriptionFormErrorState => {
    const plainDescription = getPlainTextFromHtml(formState.description ?? '').trim();
    return {
        description: WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainDescription),
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

        const isReadyRef = useRef(false);

        useEffect(() => {
            const id = setTimeout(() => {
                isReadyRef.current = true;
            }, 0);
            return () => clearTimeout(id);
        }, []);

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData);
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        const validateAndSetFieldError = (field: FormFieldName, value: string) => {
            const plainText = getPlainTextFromHtml(value).trim();
            const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);

            setErrors((prev) => ({ ...prev, [field]: error }));
        };

        const handleDescriptionFocus = () => {
            if (!isReadyRef.current) return;
            validateAndSetFieldError('description', formState.description ?? '');
        };

        const handleDescriptionChange = (value: string) => {
            setFormState((prev) => ({ ...prev, description: value }));
            if (isReadyRef.current) {
                validateAndSetFieldError('description', value);
            }
        };

        const handleDescriptionBlur = () => {
            if (!isReadyRef.current) return;
            validateAndSetFieldError('description', formState.description ?? '');
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
                            onFocus={handleDescriptionFocus}
                            onChange={handleDescriptionChange}
                            onBlur={handleDescriptionBlur}
                            disabled={isSubmitting || formDisabled}
                            maxLength={limits.descriptionLimit}
                            error={errors.description}
                        />
                    </div>
                </div>
            </form>
        );
    },
);
