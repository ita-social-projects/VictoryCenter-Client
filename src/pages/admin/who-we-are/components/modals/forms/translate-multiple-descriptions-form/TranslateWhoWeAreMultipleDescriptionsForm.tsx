import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { forwardRef, useEffect, useRef } from 'react';
import styles from './TranslateWhoWeAreMultipleDescriptionsForm.module.scss';
import cn from 'classnames';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { GeneralFormProps, GeneralFormRef } from '../../strategies/who-we-are-modal-strategy';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

interface TranslateDescriptionRow {
    contentId: number;
    description: string;
    image: string;
}

export interface TranslateWhoWeAreMultipleDescriptionsFormValues {
    rows: TranslateDescriptionRow[];
}

export interface TranslateWhoWeAreMultipleDescriptionsFormErrorState {
    rows?: { description?: string | undefined }[];
    [key: string]: { description?: string | undefined }[] | undefined;
}

export interface TranslateWhoWeAreMultipleDescriptionsFormRef extends GeneralFormRef {}

export interface TranslateWhoWeAreMultipleDescriptionsFormProps
    extends GeneralFormProps<TranslateWhoWeAreMultipleDescriptionsFormValues> {}

const validateForm = (
    formState: TranslateWhoWeAreMultipleDescriptionsFormValues,
    _isPublishing: boolean,
): TranslateWhoWeAreMultipleDescriptionsFormErrorState => {
    const rowErrors = formState.rows.map((row) => {
        const plainDescription = getPlainTextFromHtml(row.description ?? '').trim();
        return {
            description: WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainDescription),
        };
    });
    const hasAnyError = rowErrors.some((row) => row.description !== undefined);
    return {
        rows: hasAnyError ? rowErrors : undefined,
    };
};

const buildDefaultRows = (
    initialData: TranslateWhoWeAreMultipleDescriptionsFormValues | null,
): TranslateDescriptionRow[] =>
    (initialData?.rows ?? []).map((row) => ({
        ...row,
        description: '<p><br></p>',
    }));

export const TranslateWhoWeAreMultipleDescriptionsForm = forwardRef<
    TranslateWhoWeAreMultipleDescriptionsFormRef,
    TranslateWhoWeAreMultipleDescriptionsFormProps
>(
    (
        {
            initialData = null,
            formDisabled,
            onSubmit,
            onValidationChange,
            onDirtyChange,
            limits,
        }: TranslateWhoWeAreMultipleDescriptionsFormProps,
        ref,
    ) => {
        const defaultFormStateRef = useRef<TranslateWhoWeAreMultipleDescriptionsFormValues>({
            rows: buildDefaultRows(initialData),
        });

        const isReadyRef = useRef(false);
        const touchedRowsRef = useRef(new Set<number>());

        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateWhoWeAreMultipleDescriptionsFormValues,
            TranslateWhoWeAreMultipleDescriptionsFormErrorState
        >({
            defaultFormState: defaultFormStateRef.current,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data, _status) => onSubmit(data),
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

        const validateAndSetRowDescriptionError = (rowIndex: number, value: string) => {
            const plainText = getPlainTextFromHtml(value).trim();
            const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);

            setErrors((prev) => {
                const nextRows = [...(prev.rows ?? [])];
                nextRows[rowIndex] = {
                    ...(nextRows[rowIndex] ?? {}),
                    description: error,
                };

                return { ...prev, rows: nextRows };
            });
        };

        const handleDescriptionFocus = (rowIndex: number) => {
            if (!isReadyRef.current) return;
            touchedRowsRef.current.add(rowIndex);
            validateAndSetRowDescriptionError(rowIndex, formState.rows[rowIndex]?.description ?? '');
        };

        const handleDescriptionChange = (rowIndex: number, value: string) => {
            setFormState((prev) => ({
                ...prev,
                rows: prev.rows.map((row, index) => (index === rowIndex ? { ...row, description: value } : row)),
            }));
            if (isReadyRef.current) {
                validateAndSetRowDescriptionError(rowIndex, value);
            }
        };

        const handleDescriptionBlur = (rowIndex: number) => {
            if (!isReadyRef.current) return;
            if (!touchedRowsRef.current.has(rowIndex)) return;
            validateAndSetRowDescriptionError(rowIndex, formState.rows[rowIndex]?.description ?? '');
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={cn(styles.form, 'translate-who-we-are-multiple-descriptions-form')}
                data-testid="translate-who-we-are-multiple-descriptions-form"
                noValidate
            >
                <div className={styles.rows}>
                    {formState.rows.map((row, rowIndex) => {
                        return (
                            <div key={row.contentId} className={styles.row}>
                                <div className={styles['image-wrapper']}>
                                    <img
                                        src={row.image}
                                        alt={`${WHO_WE_ARE_TEXT.FORM?.LABEL?.DESCRIPTION || 'Description'} ${
                                            rowIndex + 1
                                        }`}
                                        className={styles.image}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <RichTextInputGroup
                                        label={WHO_WE_ARE_TEXT.FORM?.LABEL?.DESCRIPTION || 'Description'}
                                        id={`description-${row.contentId}`}
                                        name={`description-${row.contentId}`}
                                        value={row.description}
                                        onFocus={() => handleDescriptionFocus(rowIndex)}
                                        onChange={(value) => handleDescriptionChange(rowIndex, value)}
                                        onBlur={() => handleDescriptionBlur(rowIndex)}
                                        disabled={isSubmitting || formDisabled}
                                        maxLength={limits.descriptionLimit}
                                        error={errors.rows?.[rowIndex]?.description}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </form>
        );
    },
);
