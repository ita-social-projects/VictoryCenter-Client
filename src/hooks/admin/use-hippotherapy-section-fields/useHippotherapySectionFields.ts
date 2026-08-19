import { useState } from 'react';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { HippotherapyImageValue } from '@/types/admin/hippotherapy-page';
import { ImageValues } from '@/types/common/image';

export interface HippotherapyImageTitleDescriptionContent extends HippotherapyImageValue {
    title: string;
    description: string;
}

export interface UseHippotherapySectionFieldsParams<T extends HippotherapyImageTitleDescriptionContent> {
    value: T;
    onChange: (value: T) => void;
    onImageError?: (error: string | null) => void;
}

export const useHippotherapySectionFields = <T extends HippotherapyImageTitleDescriptionContent>({
    value,
    onChange,
    onImageError,
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
        setTitleError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(title)));
    };

    const handleDescriptionChange = (description: string) => {
        onChange({ ...value, description } as T);
        setDescriptionError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(description)));
    };

    return {
        imageError,
        titleError,
        descriptionError,
        handleImageErrorChange,
        handleImageChange,
        handleTitleChange,
        handleDescriptionChange,
    };
};
