import { useCallback } from 'react';
import { TEAM_MEMBER_VALIDATION_FUNCTIONS } from '@/validation/admin/team-member-schema/team-member-schema';

interface CommonFormState {
    fullName: string;
    description: string;
    [key: string]: any;
}

interface CommonErrorState {
    fullName?: string;
    description?: string;
    [key: string]: string | undefined;
}

interface UseCommonMemberFieldsParams<T extends CommonFormState, E extends CommonErrorState> {
    formState: T;
    setFormState: React.Dispatch<React.SetStateAction<T>>;
    setErrors: React.Dispatch<React.SetStateAction<E>>;
}

export const useCommonMemberFields = <T extends CommonFormState, E extends CommonErrorState>({
    formState,
    setFormState,
    setErrors,
}: UseCommonMemberFieldsParams<T, E>) => {
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

    return {
        handleFullNameChange,
        handleFullNameBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    };
};
