import { forwardRef, useEffect, useState } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { SingleSelectInputGroup } from '@/components/admin/input-groups/single-select-input-group/SingleSelectInputGroup';
import { FUNDS_EXPENDITURES_TEXT, FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';
import { ReportFundsExpendituresCategory } from '@/types/admin/reports';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import styles from './TranslateReportsCategoryModal.module.scss';

export interface TranslateReportsCategoryFormValues {
    name: string;
}

export interface TranslateReportsCategoryFormErrorState {
    name: string | undefined;
    [key: string]: string | undefined;
}

export interface TranslateReportsCategoryFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface TranslateReportsCategoryFormProps {
    onSubmit: (data: TranslateReportsCategoryFormValues) => void | Promise<void>;
    categories: ReportFundsExpendituresCategory[];
    initialData?: TranslateReportsCategoryFormValues | null;
    formDisabled?: boolean;
    onCategoryChange?: (category: ReportFundsExpendituresCategory | null) => void;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateReportsCategoryFormValues = {
    name: '',
};

const validateForm = (formState: TranslateReportsCategoryFormValues): TranslateReportsCategoryFormErrorState => ({
    name: validateTranslationName(formState.name),
});

const validateTranslationName = (value: string): string | undefined => {
    const normalized = getNormalizedInputText(value);
    if (!normalized) return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED;
    if (normalized.length < FUNDS_EXPENDITURES_VALIDATION.categoryNameMin)
        return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.categoryNameMin);
    if (normalized.length > FUNDS_EXPENDITURES_VALIDATION.categoryNameMax)
        return COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(FUNDS_EXPENDITURES_VALIDATION.categoryNameMax);
    return undefined;
};

export const TranslateReportsCategoryForm = forwardRef<
    TranslateReportsCategoryFormRef,
    TranslateReportsCategoryFormProps
>(
    (
        { initialData = null, onSubmit, categories, formDisabled, onCategoryChange, onValidationChange, onDirtyChange },
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateReportsCategoryFormValues,
            TranslateReportsCategoryFormErrorState
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm,
            onValidationChange,
            ref,
            onSubmit: (data) => onSubmit(data),
        });

        const [selectedCategory, setSelectedCategory] = useState<ReportFundsExpendituresCategory | null>(null);

        useEffect(() => {
            const isDirty = JSON.stringify(formState) !== JSON.stringify(initialData ?? DEFAULT_FORM_STATE);
            onDirtyChange?.(isDirty);
        }, [formState, initialData, onDirtyChange]);

        const handleCategoryChange = (category: ReportFundsExpendituresCategory | null) => {
            setSelectedCategory(category);
            onCategoryChange?.(category);
        };

        const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({ ...prev, name: e.target.value }));
        };

        const handleNameBlur = () => {
            const error = validateTranslationName(formState.name);
            setErrors((prev) => ({ ...prev, name: error }));
        };

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                id="translate-reports-category-form"
                noValidate
                className={styles.form}
            >
                <SingleSelectInputGroup
                    label={FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_CATEGORY.CATEGORY_LABEL}
                    isRequired
                    options={categories}
                    getOptionId={(c) => c.id}
                    getOptionName={(c) => c.name}
                    disabled={isSubmitting || formDisabled}
                    onChange={handleCategoryChange}
                    value={selectedCategory || undefined}
                    placeholder={FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_CATEGORY.CATEGORY_PLACEHOLDER}
                    id="translate-category-select"
                />

                <InputWithCharacterLimitGroup
                    label={FUNDS_EXPENDITURES_TEXT.MODAL.TRANSLATE_CATEGORY.NAME_LABEL}
                    error={errors.name}
                    isRequired
                    value={formState.name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    disabled={isSubmitting || formDisabled || !selectedCategory}
                    maxLength={FUNDS_EXPENDITURES_VALIDATION.categoryNameMax}
                    showCounterBelow
                    name="name"
                    id="translate-category-name"
                />
            </form>
        );
    },
);
