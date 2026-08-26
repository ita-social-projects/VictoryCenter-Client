import { useState } from 'react';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';

export interface HippotherapyTitleDescriptionContent {
    title: string;
    description: string;
}

export interface UseHippotherapyTextFieldsParams<T extends HippotherapyTitleDescriptionContent> {
    value: T;
    onChange: (value: T) => void;
    isDescriptionOptional?: boolean;
}

export const useHippotherapyTextFields = <T extends HippotherapyTitleDescriptionContent>({
    value,
    onChange,
    isDescriptionOptional = false,
}: UseHippotherapyTextFieldsParams<T>) => {
    const [titleError, setTitleError] = useState<string | undefined>();
    const [descriptionError, setDescriptionError] = useState<string | undefined>();

    const validateTitle = (title: string) =>
        HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(
            getPlainTextFromHtml(title),
            HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
        );

    const validateDescription = (description: string) => {
        const plainText = getPlainTextFromHtml(description);

        if (isDescriptionOptional && !plainText.trim()) {
            return undefined;
        }

        return HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(plainText);
    };

    const handleTitleChange = (title: string) => {
        onChange({ ...value, title } as T);

        if (titleError !== undefined) {
            setTitleError(validateTitle(title));
        }
    };

    const handleTitleBlur = () => {
        setTitleError(validateTitle(value.title));
    };

    const handleDescriptionChange = (description: string) => {
        onChange({ ...value, description } as T);

        if (descriptionError !== undefined) {
            setDescriptionError(validateDescription(description));
        }
    };

    const handleDescriptionBlur = () => {
        setDescriptionError(validateDescription(value.description));
    };

    return {
        titleError,
        descriptionError,
        handleTitleChange,
        handleTitleBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    };
};
