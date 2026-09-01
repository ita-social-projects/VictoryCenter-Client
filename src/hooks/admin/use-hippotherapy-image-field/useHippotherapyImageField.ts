import { useState } from 'react';
import { HippotherapyImageValue } from '@/types/admin/hippotherapy-page';
import { ImageValues } from '@/types/common/image';

export interface UseHippotherapyImageFieldParams<T extends HippotherapyImageValue> {
    value: T;
    onChange: (value: T) => void;
    onImageError?: (error: string | null) => void;
}

export const useHippotherapyImageField = <T extends HippotherapyImageValue>({
    value,
    onChange,
    onImageError,
}: UseHippotherapyImageFieldParams<T>) => {
    const [imageError, setImageError] = useState<string | null>(null);

    const handleImageErrorChange = (error: string | null) => {
        setImageError(error);
        onImageError?.(error);
    };

    const handleImageChange = (image: ImageValues | null) => {
        onChange({ ...value, image } as T);
    };

    return { imageError, handleImageErrorChange, handleImageChange };
};
