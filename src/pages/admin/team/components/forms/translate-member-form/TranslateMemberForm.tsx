import { forwardRef, useCallback, useMemo } from 'react';
import { VisibilityStatus } from '../../../../../../types/admin/common';
import { TEAM_MEMBER_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/team-member-schema/team-member-schema';
import { Select } from '../../../../../../components/common/select/Select';
import { Button } from '../../../../../../components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { ReactComponent as TranslateIcon } from '../../../../../../assets/icons/translate-grey.svg';
import { CommonMemberFields } from '../common-member-fields/CommonMemberFields';
import './TranslateMemberForm.scss';
import { useFormManager } from '../../../../../../hooks/admin/use-form-manager/useFormManager';

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

        const { formState, setFormState, errors, setErrors, isSubmitting } = useFormManager<
            TranslateTeamMemberFormValues,
            TranslateTeamMemberFormErrorState
        >({
            defaultFormState,
            initialData,
            validateForm,
            onSubmit,
            onValidationChange,
            ref,
        });

        const handleFullNameChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setFormState((prev) => ({ ...prev, fullName: e.target.value }));
            },
            [setFormState],
        );

        const handleFullNameBlur = useCallback(() => {
            setErrors((prev) => ({
                ...prev,
                fullName: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(formState.fullName, false),
            }));
        }, [formState.fullName, setErrors]);

        const handleDescriptionChange = useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setFormState((prev) => ({ ...prev, description: e.target.value }));
            },
            [setFormState],
        );

        const handleDescriptionBlur = useCallback(() => {
            setErrors((prev) => ({
                ...prev,
                description: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(formState.description, false),
            }));
        }, [formState.description, setErrors]);

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

                <CommonMemberFields
                    formState={formState}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    formDisabled={formDisabled}
                    handleFullNameChange={handleFullNameChange}
                    handleFullNameBlur={handleFullNameBlur}
                    handleDescriptionChange={handleDescriptionChange}
                    handleDescriptionBlur={handleDescriptionBlur}
                />
            </form>
        );
    },
);
