import { forwardRef } from 'react';
import { TEAM_MEMBER_VALIDATION_FUNCTIONS } from '@/validation/admin/team-member-schema/team-member-schema';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { Select } from '@/components/common/select/Select';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN, LANGUAGES } from '@/const/admin/common';
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
    ({ initialData = null, onSubmit, formDisabled, onValidationChange }: TranslateMemberFormProps, ref) => {
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
                <div className={styles['functional-group']}>
                    <div className={styles['language-select']}>
                        <Select<string>
                            className="language-select"
                            headClassName={styles['language-select-head']}
                            value="EN"
                            onValueChange={() => {}}
                        >
                            <Select.Option value="EN" name={LANGUAGES.EN} />
                        </Select>
                    </div>
                    <Button className={styles['generate-button']} buttonStyle="primary" disabled={isSubmitting}>
                        {COMMON_TEXT_ADMIN.BUTTON.GENERATE_TRANSLATION}
                    </Button>
                </div>

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
