import { Content, ContentType } from '../../../../../../types/admin/who-we-are';
import { ImageInputProps } from '../../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../../const/admin/who-we-are';
import React from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { CardContent } from './card-content/CardContent';
import { Image, ImageValues } from '../../../../../../types/common/image';
import { CardImageConfig } from '../SectionsProps';
import './CardsSection.scss';

export interface CardsSectionProps {
    content: Content[] | undefined;
    descriptionLimit: number;
    rows?: number;
    onChange: (data: Content) => void;
    cardImageConfigs: CardImageConfig[];
    titleText?: string;
}

export const CardsSection = ({
    content,
    descriptionLimit,
    rows,
    onChange,
    cardImageConfigs,
    titleText,
}: CardsSectionProps) => {
    const commonImageProps: Omit<ImageInputProps, 'className' | 'value'> = {
        onChange: () => {},
        label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
        subText: '1440x860',
    };

    //  const handleImageChange = (value: ImageValues | Image | null) => {
    //      onChange({
    //          ...cardContents,
    //          image: value
    //      });
    //  };
    //
    // const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     onChange({
    //         ...cardContents,
    //         description: e.target.value
    //     });
    // };

    if (!content) return null;

    const cardContents = content.filter((item) => item.contentType === ContentType.Card);

    if (!cardContents) {
        return null;
    }

    return (
        <div className="cards-section-wrapper">
            {titleText && <span className="cards-section-wrapper-title">{titleText}</span>}
            <div className="cards-section-wrapper-cards">
                {cardContents.map((c: Content, index: number) => {
                    // Створюємо унікальні обробники для кожного елемента в циклі
                    const handleImageChange = (value: ImageValues | Image) => {
                        onChange({
                            ...c,
                            image: value,
                        });
                    };

                    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        onChange({
                            ...c,
                            description: e.target.value,
                        });
                    };

                    const imageConfig = cardImageConfigs[index] || {
                        style: { width: '20rem', height: '25rem' },
                        subText: '320x400',
                    };

                    // Передаємо унікальні обробники в CardContent
                    return (
                        <CardContent
                            key={c.id}
                            content={c}
                            onImageChange={handleImageChange}
                            onChange={handleDescriptionChange}
                            descriptionLimit={descriptionLimit}
                            imageInputProps={{ ...imageConfig }}
                            rows={rows}
                        />
                    );
                })}
            </div>
        </div>
    );
};
