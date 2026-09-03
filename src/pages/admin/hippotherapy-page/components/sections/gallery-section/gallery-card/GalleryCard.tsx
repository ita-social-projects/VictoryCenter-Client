import { CSSProperties, memo } from 'react';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_IMAGE_CONFIGS } from '@/const/admin/hippotherapy-page';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { HippotherapyGalleryCardContent } from '@/types/admin/hippotherapy-page';
import { ImageValues } from '@/types/common/image';

export interface GalleryCardProps {
    card: HippotherapyGalleryCardContent;
    fieldId: string;
    defaultImageStyle?: CSSProperties;
    onDescriptionChange: (description: string) => void;
    onImageChange: (image: ImageValues | null) => void;
    onImageError: (error: string | null) => void;
    imageError?: string | null;
    disabled?: boolean;
}

const GalleryCardComponent = ({
    card,
    fieldId,
    defaultImageStyle,
    onDescriptionChange,
    onImageChange,
    onImageError,
    imageError,
    disabled,
}: GalleryCardProps) => {
    const description = useValidatedRichTextField({
        value: card.description,
        onChange: onDescriptionChange,
    });

    return (
        <div className="hippotherapy-gallery-section-card">
            <div className="hippotherapy-gallery-section-card-image">
                <ImageInput
                    variant="whoWeAre"
                    value={card.image}
                    onChange={onImageChange}
                    setError={onImageError}
                    label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                    subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                        HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.cropHeight,
                        HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.cropWidth,
                    )}
                    cropWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.cropWidth}
                    cropHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.cropHeight}
                    minWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.minWidth}
                    minHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.minHeight}
                    style={defaultImageStyle}
                    disabled={disabled}
                />
            </div>
            <RichTextInputGroup
                className="hippotherapy-gallery-section-card-text"
                label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                isRequired
                id={`${fieldId}-description`}
                name={`${fieldId}-description`}
                value={card.description}
                onChange={description.handleChange}
                onBlur={description.handleBlur}
                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.GALLERY_CARD_DESCRIPTION}
                error={description.error}
                disabled={disabled}
            />
            {imageError && <p className="hippotherapy-gallery-section-error">{imageError}</p>}
        </div>
    );
};

export const GalleryCard = memo(GalleryCardComponent);
