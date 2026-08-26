import { CSSProperties, memo, useState } from 'react';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_IMAGE_CONFIGS } from '@/const/admin/hippotherapy-page';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { HippotherapyGallerySectionContent } from '@/types/admin/hippotherapy-page';
import { ImageValues } from '@/types/common/image';
import './GallerySection.scss';

export interface GallerySectionProps {
    value: HippotherapyGallerySectionContent;
    onChange: (value: HippotherapyGallerySectionContent) => void;
    fieldIdPrefix: string;
    defaultCardImageStyles?: CSSProperties[];
    onCardImageError?: (index: number, error: string | null) => void;
    disabled?: boolean;
}

const GallerySectionComponent = ({
    value,
    onChange,
    fieldIdPrefix,
    defaultCardImageStyles,
    onCardImageError,
    disabled,
}: GallerySectionProps) => {
    const [titleError, setTitleError] = useState<string | undefined>();
    const [cardImageErrors, setCardImageErrors] = useState<Record<number, string | null>>({});
    const [cardDescriptionErrors, setCardDescriptionErrors] = useState<Record<number, string | undefined>>({});

    const handleTitleChange = (title: string) => {
        onChange({ ...value, title });
        setTitleError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(title)));
    };

    const handleCardImageChange = (index: number, image: ImageValues | null) => {
        const cards = value.cards.map((card, cardIndex) => (cardIndex === index ? { ...card, image } : card));
        onChange({ ...value, cards });
    };

    const handleCardDescriptionChange = (index: number, description: string) => {
        const cards = value.cards.map((card, cardIndex) => (cardIndex === index ? { ...card, description } : card));
        onChange({ ...value, cards });
        setCardDescriptionErrors((prev) => ({
            ...prev,
            [index]: HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(description)),
        }));
    };

    return (
        <div className="hippotherapy-gallery-section">
            <RichTextInputGroup
                label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                isRequired
                id={`${fieldIdPrefix}-title`}
                name={`${fieldIdPrefix}-title`}
                value={value.title}
                onChange={handleTitleChange}
                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.GALLERY_TITLE}
                error={titleError}
                disabled={disabled}
            />
            <div className="hippotherapy-gallery-section-cards">
                {value.cards.map((card, index) => (
                    <div key={index} className="hippotherapy-gallery-section-card">
                        <div className="hippotherapy-gallery-section-card-image">
                            <ImageInput
                                variant="whoWeAre"
                                value={card.image}
                                onChange={(image) => handleCardImageChange(index, image)}
                                setError={(error) => {
                                    setCardImageErrors((prev) => ({ ...prev, [index]: error }));
                                    onCardImageError?.(index, error);
                                }}
                                label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                                subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                    HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.cropHeight,
                                    HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.cropWidth,
                                )}
                                cropWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.cropWidth}
                                cropHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.cropHeight}
                                minWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.minWidth}
                                minHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.GALLERY_CARD.minHeight}
                                style={defaultCardImageStyles?.[index]}
                                disabled={disabled}
                            />
                        </div>
                        <RichTextInputGroup
                            className="hippotherapy-gallery-section-card-text"
                            label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                            isRequired
                            id={`${fieldIdPrefix}-card-${index}-description`}
                            name={`${fieldIdPrefix}-card-${index}-description`}
                            value={card.description}
                            onChange={(nextValue) => handleCardDescriptionChange(index, nextValue)}
                            maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.GALLERY_CARD_DESCRIPTION}
                            error={cardDescriptionErrors[index]}
                            disabled={disabled}
                        />
                        {cardImageErrors[index] && (
                            <p className="hippotherapy-gallery-section-error">{cardImageErrors[index]}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const GallerySection = memo(GallerySectionComponent);
