import { CardImageConfig, Content } from '../../../../../../types/admin/who-we-are';
import { useState } from 'react';
import { CardContent } from '../../card-content/CardContent';
import './CardsSection.scss';
import { Button } from '../../../../../../components/admin/button/Button';
import { ContentType } from '../../../../../../types/common/about-us';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';

export interface CardsSectionProps {
    content: Content[] | undefined;
    descriptionLimit: number;
    rows?: number;
    onChange: (data: Content) => void;
    cardImageConfigs: CardImageConfig[];
    titleText?: string;
    onPublish: () => void;
    isPublishButtonActive: boolean;
    setIsPublishButtonActive: (value: boolean) => void;
}

export const CardsSection = ({
    content,
    descriptionLimit,
    rows,
    onChange,
    onPublish,
    cardImageConfigs,
    titleText,
    isPublishButtonActive,
    setIsPublishButtonActive,
}: CardsSectionProps) => {
    const [errors, setErrors] = useState<Record<number, { image: string | null; description?: string | null }>>({});

    if (!content) return null;

    const cardContents = content.filter((item) => item.contentType === ContentType.Card);

    const handleDescriptionBlur = (id: number, value: string) => {
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(value);
        setErrors((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                description: error || undefined,
            },
        }));
        setIsPublishButtonActive(true);
    };

    const handleSetImageError = (id: number, value: string | null) => {
        setErrors((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                image: value,
            },
        }));
    };

    if (cardContents.length === 0) {
        return null;
    }

    return (
        <>
            <div className="cards-section-wrapper">
                {titleText && <span className="cards-section-wrapper-title">{titleText}</span>}
                <div className="cards-section-wrapper-cards">
                    {cardContents.map((c: Content, index: number) => (
                        <CardContent
                            key={c.id}
                            content={c}
                            onChange={onChange}
                            onDescriptionBlur={(value) => handleDescriptionBlur(c.id, value.target.value)}
                            descriptionError={errors[c.id]?.description ?? null}
                            imageError={errors[c.id]?.image}
                            setImageError={(value) => handleSetImageError(c.id, value)}
                            descriptionLimit={descriptionLimit}
                            imageInputProps={{ ...(cardImageConfigs[index] || {}) }}
                            rows={rows}
                            setIsPublishButtonActive={setIsPublishButtonActive}
                        />
                    ))}
                </div>
            </div>
            <div className="button-section">
                <Button
                    className="button"
                    buttonStyle="primary"
                    onClick={onPublish}
                    type="submit"
                    disabled={
                        Object.values(errors).some((error) => error.image !== null || error.description != null) ||
                        !isPublishButtonActive
                    }
                >
                    {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                </Button>
            </div>
        </>
    );
};
