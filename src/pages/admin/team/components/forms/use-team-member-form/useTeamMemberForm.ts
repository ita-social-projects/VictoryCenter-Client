import React, { useCallback } from 'react';
import { TEAM_MEMBER_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/team-member-schema/team-member-schema';
import { useFormManager } from '../../../../../../hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '../../../../../../types/admin/common';

type CommonFields = {
    fullName: string;
    description: string;
};

type CommonErrors = {
    fullName?: string;
    description?: string;
    [key: string]: string | undefined;
};

type BaseSubmit<TFormData> = ((data: TFormData) => void) | ((data: TFormData, status: VisibilityStatus) => void);

export interface UseTeamMemberFormProps<TFormData, TErrorState extends CommonErrors> {
    defaultFormState: TFormData;
    initialData: TFormData | null;
    validateForm: (formState: TFormData, isPublishing: boolean) => TErrorState;
    onSubmit: BaseSubmit<TFormData>;
    onValidationChange?: (isValid: boolean) => void;
    ref?: React.Ref<any>;
}

export const useTeamMemberForm = <TFormData extends CommonFields, TErrorState extends CommonErrors>({
    defaultFormState,
    initialData,
    validateForm,
    onSubmit,
    onValidationChange,
    ref,
}: UseTeamMemberFormProps<TFormData, TErrorState>) => {
    const formManager = useFormManager<TFormData, TErrorState>({
        defaultFormState,
        initialData,
        validateForm,
        onSubmit,
        onValidationChange,
        ref,
    });

    const { formState, setFormState, setErrors } = formManager;

    const handleFullNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, fullName: value }));
            setErrors((prev) => ({
                ...prev,
                fullName: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(value, false),
            }));
        },
        [setErrors, setFormState],
    );

    const handleFullNameBlur = useCallback(() => {
        setErrors((prev) => ({
            ...prev,
            fullName: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateFullName(formState.fullName, false),
        }));
    }, [formState.fullName, setErrors]);

    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setFormState((prev) => ({ ...prev, description: value }));
        },
        [setFormState],
    );

    const handleDescriptionBlur = useCallback(() => {
        setErrors((prev) => ({
            ...prev,
            description: TEAM_MEMBER_VALIDATION_FUNCTIONS.validateDescription(formState.description, false),
        }));
    }, [formState.description, setErrors]);

    return {
        ...formManager,
        handleFullNameChange,
        handleFullNameBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    };
};
