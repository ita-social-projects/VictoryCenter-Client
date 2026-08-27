import { CSSProperties, memo, useState } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { HippotherapyGallerySectionContent } from '@/types/admin/hippotherapy-page';
import { ImageValues } from '@/types/common/image';
import { GalleryCard } from './gallery-card/GalleryCard';
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
    const [cardImageErrors, setCardImageErrors] = useState<Record<number, string | null>>({});

    const title = useValidatedRichTextField({
        value: value.title,
        onChange: (title) => onChange({ ...value, title }),
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
    });

    const handleCardImageChange = (index: number, image: ImageValues | null) => {
        const cards = value.cards.map((card, cardIndex) => (cardIndex === index ? { ...card, image } : card));
        onChange({ ...value, cards });
    };

    const handleCardDescriptionChange = (index: number, description: string) => {
        const cards = value.cards.map((card, cardIndex) => (cardIndex === index ? { ...card, description } : card));
        onChange({ ...value, cards });
    };

    const handleCardImageError = (index: number, error: string | null) => {
        setCardImageErrors((prev) => ({ ...prev, [index]: error }));
        onCardImageError?.(index, error);
    };

    return (
        <div className="hippotherapy-gallery-section">
            <RichTextInputGroup
                label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                isRequired
                id={`${fieldIdPrefix}-title`}
                name={`${fieldIdPrefix}-title`}
                value={value.title}
                onChange={title.handleChange}
                onBlur={title.handleBlur}
                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.GALLERY_TITLE}
                error={title.error}
                disabled={disabled}
            />
            <div className="hippotherapy-gallery-section-cards">
                {value.cards.map((card, index) => (
                    <GalleryCard
                        key={index}
                        card={card}
                        fieldId={`${fieldIdPrefix}-card-${index}`}
                        defaultImageStyle={defaultCardImageStyles?.[index]}
                        imageError={cardImageErrors[index]}
                        onDescriptionChange={(description) => handleCardDescriptionChange(index, description)}
                        onImageChange={(image) => handleCardImageChange(index, image)}
                        onImageError={(error) => handleCardImageError(index, error)}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
};

export const GallerySection = memo(GallerySectionComponent);
