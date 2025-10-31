import React, { forwardRef, useCallback, useMemo } from 'react';
import { VisibilityStatus } from '../../../../../../types/admin/common';
import { TEAM_MEMBER_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/team-member-schema/team-member-schema';
import { InputLabel } from '../../../../../../components/admin/input-label/InputLabel';
import { TEAM_MEMBER_VALIDATION, TEAM_MEMBERS_TEXT } from '../../../../../../const/admin/team';
import { InputWithCharacterLimit } from '../../../../../../components/admin/input-with-character-limit/InputWithCharacterLimit';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { Select } from '../../../../../../components/common/select/Select';
import { Button } from '../../../../../../components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { ReactComponent as TranslateIcon } from '../../../../../../assets/icons/translate-grey.svg';
import './TranslateMemberForm.scss';
import { useTeamMemberForm } from '../use-team-member-form/useTeamMemberForm';

export interface TranslateTeamMemberFormValues {
    fullName: string;
    description: string;
}

export interface TranslateTeamMemberFormErrorState {
    fullName?: string;
    description?: string;
    [key: string]: string | undefined;
}

export interface TranslateTeamMemberFormRef {
    submit: (status: VisibilityStatus) => void;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
}

export interface TranslateMemberFormProps {
    onSubmit: (data: TranslateTeamMemberFormValues) => void;
    initialData?: TranslateTeamMemberFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
}

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
        const defaultFormState = useMemo<TranslateTeamMemberFormValues>(
            () => ({
                fullName: '',
                description: '',
            }),
            [],
        );

        const {
            formState,
            errors,
            isSubmitting,
            handleFullNameChange,
            handleFullNameBlur,
            handleDescriptionChange,
            handleDescriptionBlur,
        } = useTeamMemberForm({
            defaultFormState,
            initialData,
            validateForm,
            onSubmit,
            onValidationChange,
            ref,
        });

        return (
            <form
                onSubmit={(e) => e.preventDefault()}
                className="team-member-form-main"
                data-testid="test-form"
                noValidate
            >
                <div className="functional-group">
                    <Select<string> className="language-select" value="EN" onValueChange={() => {}}>
                        <Select.Option value="EN" name="EN"></Select.Option>
                    </Select>
                    <Button className="generate-button" buttonStyle="primary" disabled={isSubmitting}>
                        {COMMON_TEXT_ADMIN.BUTTON.GENERATE_TRANSLATION}
                        <TranslateIcon className="translate-icon" />
                    </Button>
                </div>

                <div className="form-group">
                    <InputLabel htmlFor={'fullName'} text={TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME} isRequired />
                    <InputWithCharacterLimit
                        value={formState.fullName}
                        onChange={handleFullNameChange}
                        onBlur={handleFullNameBlur}
                        id="fullName"
                        name="fullName"
                        maxLength={TEAM_MEMBER_VALIDATION.fullName.max}
                        disabled={isSubmitting || formDisabled}
                    />
                    {errors.fullName && <p className="error">{errors.fullName}</p>}
                </div>
                <div className="form-group">
                    <InputLabel htmlFor={'description'} text={TEAM_MEMBERS_TEXT.FORM.LABEL.DESCRIPTION} />
                    <TextAreaWithCharacterLimit
                        value={formState.description}
                        onChange={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        id="description"
                        name="description"
                        rows={8}
                        disabled={isSubmitting || formDisabled}
                        maxLength={TEAM_MEMBER_VALIDATION.description.max}
                    />
                    {errors.description && <span className="error desc-error">{errors.description}</span>}
                </div>
            </form>
        );
    },
);
