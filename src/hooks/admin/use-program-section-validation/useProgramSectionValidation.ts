import { useState, useCallback } from 'react';
import { PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';

export interface UseProgramSectionValidationReturn {
    titleError: string | undefined;
    descriptionError: string | undefined;
    handleTitleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTitleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleDescriptionBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export interface UseProgramSectionValidationProps {
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
}

export const useProgramSectionValidation = ({
    onTitleChange,
    onDescriptionChange,
}: UseProgramSectionValidationProps): UseProgramSectionValidationReturn => {
    const [titleError, setTitleError] = useState<string | undefined>(undefined);
    const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);

    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            onTitleChange?.(newValue);

            if (titleError && newValue.trim().length >= PROGRAM_SECTION_VALIDATION.title.min) {
                setTitleError(undefined);
            }
        },
        [onTitleChange, titleError],
    );

    const handleTitleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const trimmedValue = e.target.value.trim();
            onTitleChange?.(trimmedValue);

            setTitleError(PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(trimmedValue));
        },
        [onTitleChange],
    );

    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            onDescriptionChange?.(newValue);

            if (descriptionError && newValue.trim().length >= PROGRAM_SECTION_VALIDATION.description.min) {
                setDescriptionError(undefined);
            }
        },
        [onDescriptionChange, descriptionError],
    );

    const handleDescriptionBlur = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            const trimmedValue = e.target.value.trim();
            onDescriptionChange?.(trimmedValue);

            setDescriptionError(PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(trimmedValue));
        },
        [onDescriptionChange],
    );

    return {
        titleError,
        descriptionError,
        handleTitleChange,
        handleTitleBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    };
};
