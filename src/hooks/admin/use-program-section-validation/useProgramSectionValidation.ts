import { useState, useCallback, useEffect } from 'react';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';
import { SectionTemplate } from '@/types/common/program-sections';

export interface UseProgramSectionValidationReturn {
    titleError: string | undefined;
    descriptionError: string | undefined;
    handleTitleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTitleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleDescriptionBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export interface UseProgramSectionValidationProps {
    template: SectionTemplate;
    isPublishing?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    resetKey?: number;
}

export const useProgramSectionValidation = ({
    template,
    isPublishing = false,
    onTitleChange,
    onDescriptionChange,
    resetKey,
}: UseProgramSectionValidationProps): UseProgramSectionValidationReturn => {
    const [titleError, setTitleError] = useState<string | undefined>(undefined);
    const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);

    const validateTitle = useCallback(
        (value: string) => PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(value, isPublishing, template),
        [isPublishing, template],
    );

    const validateDescription = useCallback(
        (value: string) =>
            PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(value, isPublishing, template),
        [isPublishing, template],
    );

    useEffect(() => {
        setTitleError(undefined);
        setDescriptionError(undefined);
    }, [resetKey]);

    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            onTitleChange?.(newValue);

            if (!titleError) return;

            const trimmedValue = getTrimmedInputText(newValue);
            const nextError = validateTitle(trimmedValue);
            if (!nextError) setTitleError(undefined);
        },
        [onTitleChange, titleError, validateTitle],
    );

    const handleTitleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const trimmedValue = getTrimmedInputText(e.target.value);
            onTitleChange?.(trimmedValue);

            setTitleError(validateTitle(trimmedValue));
        },
        [onTitleChange, validateTitle],
    );

    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value;
            onDescriptionChange?.(newValue);

            if (!descriptionError) return;

            const trimmedValue = getTrimmedInputText(newValue);
            const nextError = validateDescription(trimmedValue);
            if (!nextError) setDescriptionError(undefined);
        },
        [onDescriptionChange, descriptionError, validateDescription],
    );

    const handleDescriptionBlur = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            const trimmedValue = getTrimmedInputText(e.target.value);
            onDescriptionChange?.(trimmedValue);

            setDescriptionError(validateDescription(trimmedValue));
        },
        [onDescriptionChange, validateDescription],
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
