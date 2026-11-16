import { useHippotherapyImageField } from '@/hooks/admin/use-hippotherapy-image-field/useHippotherapyImageField';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { useHippotherapyReadOnly } from '@/pages/admin/hippotherapy-page/context/HippotherapyReadOnlyContext';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { ImageValues, Image } from '@/types/common/image';

export interface BaseSectionWithImage {
    title: string;
    description: string;
    image: ImageValues | Image | null;
    imageId: number | null;
}

export interface UseSectionFieldsParams<T extends BaseSectionWithImage> {
    value: T;
    onChange: (value: T) => void;
    onImageError?: (error: string | null) => void;
    languageCode?: string;
}

export const useSectionFields = <T extends BaseSectionWithImage>({
    value,
    onChange,
    onImageError,
    languageCode,
}: UseSectionFieldsParams<T>) => {
    const { imageError, handleImageErrorChange, handleImageChange } = useHippotherapyImageField({
        value,
        onChange,
        onImageError,
    });

    const isReadOnly = useHippotherapyReadOnly();

    const title = useValidatedRichTextField({
        value: value.title,
        onChange: (title) => onChange({ ...value, title }),
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
        languageCode,
    });

    const description = useValidatedRichTextField({
        value: value.description,
        onChange: (description) => onChange({ ...value, description }),
        languageCode,
    });

    return {
        imageError,
        handleImageErrorChange,
        handleImageChange,
        isReadOnly,
        title,
        description,
    };
};
