import { forwardRef, useEffect } from 'react';
import { TEAM_MEMBER_VALIDATION_FUNCTIONS } from '@/validation/admin/team-member-schema/team-member-schema';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { CommonMemberFields } from '../common-member-fields/CommonMemberFields';
import { VisibilityStatus } from '@/types/admin/common';
import styles from './TranslateMemberForm.module.scss';
import './TranslateMemberForm.scss';
import { useCommonMemberFields } from '@/hooks/admin/use-common-member-fields/useCommonMemberFields';
import cn from 'classnames';

export interface TranslateTeamMemberFormValues {
    fullName: string;
    description: string;
}
export interface TranslateTeamMemberFormErrorState {
    fullName?: string[];
    description?: string;
    [key: string]: string | string[] | undefined;
}
export interface TranslateTeamMemberFormRef {
    submit: (status?: VisibilityStatus) => Promise<void>;
    isValid: () => boolean;
    isDirty: () => boolean;
}
export interface TranslateMemberFormProps {
    onSubmit: (data: TranslateTeamMemberFormValues, status?: VisibilityStatus) => void | Promise<void>;
    initialData?: TranslateTeamMemberFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

const DEFAULT_FORM_STATE: TranslateTeamMemberFormValues = {
    fullName: '',
    description: '',
};

const validateForm = (
    formState: TranslateTeamMemberFormValues,
    isPublishing: boolean,
): TranslateTeamMemberFormErrorState => {
    return {
        fullName: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(formState.fullName, isPublishing),
        description: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(formState.description, isPublishing),
    };
};

export const TranslateMemberForm = forwardRef<TranslateTeamMemberFormRef, TranslateMemberFormProps>(
    (
        { initialData = null, onSubmit, formDisabled, onValidationChange, onDirtyChange }: TranslateMemberFormProps,
        ref,
    ) => {
        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateTeamMemberFormValues,
            TranslateTeamMemberFormErrorState
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

        const fieldHandlers = useCommonMemberFields({
            formState,
            setFormState,
            setErrors,
        });

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className={cn(styles.form, 'translate-member-form')}
                data-testid="test-form"
                noValidate
            >
                <CommonMemberFields
                    formState={formState}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    formDisabled={formDisabled}
                    {...fieldHandlers}
                />
            </form>
        );
    },
);
