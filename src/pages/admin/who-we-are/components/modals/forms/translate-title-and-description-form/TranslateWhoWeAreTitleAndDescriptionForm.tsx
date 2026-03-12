import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { forwardRef, useEffect, useRef } from 'react';
import styles from './TranslateWhoWeAreTitleAndDescriptionForm.module.scss';
import cn from 'classnames';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { GeneralFormProps, GeneralFormRef } from '../../strategies/who-we-are-modal-strategy';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

export interface TranslateWhoWeAreTitleAndDescriptionFormValues {
    title: string;
    description: string;
}

export interface TranslateWhoWeAreTitleAndDescriptionFormErrorState {
    title: string | undefined;
    description: string | undefined;
    [key: string]: string | string[] | undefined;
}

export interface TranslateWhoWeAreTitleAndDescriptionFormRef extends GeneralFormRef {}

export interface TranslateWhoWeAreTitleAndDescriptionFormProps 
    extends GeneralFormProps<TranslateWhoWeAreTitleAndDescriptionFormValues> {}

const DEFAULT_FORM_STATE: TranslateWhoWeAreTitleAndDescriptionFormValues = {
    title: '<p><br></p>',
    description: '<p><br></p>',
};

type FormFieldName = keyof TranslateWhoWeAreTitleAndDescriptionFormValues;

const validateForm = (
    formState: TranslateWhoWeAreTitleAndDescriptionFormValues,
    _isPublishing: boolean,
): TranslateWhoWeAreTitleAndDescriptionFormErrorState => {
    const plainTitle = getPlainTextFromHtml(formState.title ?? '').trim();
    const plainDescription = getPlainTextFromHtml(formState.description ?? '').trim();

    return {
        title: WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainTitle),
        description: WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainDescription),
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
            limits,
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

        const isReadyRef = useRef(false);
        const touchedFieldsRef = useRef<Record<FormFieldName, boolean>>({
            title: false,
            description: false,
        });

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

        const handleTitleFocus = () => {
            if (!isReadyRef.current) return;
            if (touchedFieldsRef.current.title) {
                validateAndSetFieldError('title', formState.title ?? '');
            }
        };

        const handleTitleChange = (value: string) => {
            setFormState((prev) => ({ ...prev, title: value }));
            if (isReadyRef.current && touchedFieldsRef.current.title) {
                validateAndSetFieldError('title', value);
            }
        };

        const handleTitleBlur = () => {
            if (!isReadyRef.current) return;
            touchedFieldsRef.current.title = true;
            validateAndSetFieldError('title', formState.title ?? '');
        };

        const handleDescriptionFocus = () => {
            if (!isReadyRef.current) return;
            if (touchedFieldsRef.current.description) {
                validateAndSetFieldError('description', formState.description ?? '');
            }
        };

        const handleDescriptionChange = (value: string) => {
            setFormState((prev) => ({ ...prev, description: value }));
            if (isReadyRef.current && touchedFieldsRef.current.description) {
                validateAndSetFieldError('description', value);
            }
        };

        const handleDescriptionBlur = () => {
            if (!isReadyRef.current) return;
            touchedFieldsRef.current.description = true;
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
                            label={WHO_WE_ARE_TEXT.FORM?.LABEL?.TITLE || 'Title'}
                            id="title"
                            name="title"
                            value={formState.title}
                            onFocus={handleTitleFocus}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            disabled={isSubmitting || formDisabled}
                            maxLength={limits.titleLimit!}
                            error={errors.title}
                        />
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
