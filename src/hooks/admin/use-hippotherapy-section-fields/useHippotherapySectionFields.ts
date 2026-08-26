import { useState } from 'react';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { HippotherapyImageValue } from '@/types/admin/hippotherapy-page';
import { ImageValues } from '@/types/common/image';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';

export interface HippotherapyImageTitleDescriptionContent extends HippotherapyImageValue {
    title: string;
    description: string;
}

export interface UseHippotherapySectionFieldsParams<T extends HippotherapyImageTitleDescriptionContent> {
    value: T;
    onChange: (value: T) => void;
    onImageError?: (error: string | null) => void;
    isDescriptionOptional?: boolean;
}

export const useHippotherapySectionFields = <T extends HippotherapyImageTitleDescriptionContent>({
    value,
    onChange,
    onImageError,
    isDescriptionOptional = false,
}: UseHippotherapySectionFieldsParams<T>) => {
    const [imageError, setImageError] = useState<string | null>(null);
    const [titleError, setTitleError] = useState<string | undefined>();
    const [descriptionError, setDescriptionError] = useState<string | undefined>();

    const handleImageErrorChange = (error: string | null) => {
        setImageError(error);
        onImageError?.(error);
    };

    const handleImageChange = (image: ImageValues | null) => {
        onChange({ ...value, image } as T);
    };

    const handleTitleChange = (title: string) => {
        onChange({ ...value, title } as T);

        if (titleError !== undefined) {
            setTitleError(
                HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(
                    getPlainTextFromHtml(title),
                    HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
                ),
            );
        }
    };

    const handleTitleBlur = () => {
        setTitleError(
            HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(
                getPlainTextFromHtml(value.title),
                HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
            ),
        );
    };

    const handleDescriptionChange = (description: string) => {
        onChange({ ...value, description } as T);

        if (descriptionError !== undefined) {
            const plainText = getPlainTextFromHtml(description);

            if (isDescriptionOptional && !plainText.trim()) {
                setDescriptionError(undefined);
                return;
            }

            setDescriptionError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(plainText));
        }
    };

    const handleDescriptionBlur = () => {
        const plainText = getPlainTextFromHtml(value.description);

        if (isDescriptionOptional && !plainText.trim()) {
            setDescriptionError(undefined);
            return;
        }

        setDescriptionError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(plainText));
    };
    return {
        imageError,
        titleError,
        descriptionError,
        handleImageErrorChange,
        handleImageChange,
        handleTitleChange,
        handleTitleBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    };
};
