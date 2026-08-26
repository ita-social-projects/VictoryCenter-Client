import { useState } from 'react';
import { HippotherapyImageValue } from '@/types/admin/hippotherapy-page';
import { ImageValues } from '@/types/common/image';
import { useHippotherapyTextFields } from '@/hooks/admin/use-hippotherapy-text-fields/useHippotherapyTextFields';

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

    const textFields = useHippotherapyTextFields({ value, onChange, isDescriptionOptional });

    const handleImageErrorChange = (error: string | null) => {
        setImageError(error);
        onImageError?.(error);
    };

    const handleImageChange = (image: ImageValues | null) => {
        onChange({ ...value, image } as T);
    };

    return {
        imageError,
        handleImageErrorChange,
        handleImageChange,
        ...textFields,
    };
};
