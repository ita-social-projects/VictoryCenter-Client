import type * as React from 'react';
import { VisibilityStatus } from '@/types/admin/common';
import { TranslateLimits, WhoWeAreSection } from '@/types/admin/who-we-are';
import { LocalizationLanguage } from '@/types/common/language';

export interface GeneralFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}

export interface GeneralFormProps<TValues> {
    initialData?: TValues | null;
    formDisabled?: boolean;
    onSubmit: (data: TValues, status?: VisibilityStatus) => void | Promise<void>;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
    limits: TranslateLimits;
}

export interface WhoWeAreModalStrategy<TValues> {
    FormComponent: React.ForwardRefExoticComponent<GeneralFormProps<TValues> & React.RefAttributes<GeneralFormRef>>;
    getInitialData: (
        section: WhoWeAreSection,
        language: LocalizationLanguage | null,
        isEditMode: boolean,
    ) => TValues | null;
}
