import { Content, ContentType } from '../../../../../types/admin/who-we-are';
import { ImageInputProps } from '../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../const/admin/who-we-are';
import { BaseContent } from '../base-content/BaseContent';
import React from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { TextAreaWithCharacterLimit } from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { CardContent } from '../card-content/CardContent';
import { Image, ImageValues } from '../../../../../types/common/image';

interface CardsSectionProps {
    content: Content[] | undefined;
    titleLimit: number;
    descriptionLimit: number;
    onChange: (data: Content) => void;
    className?: string; // <-- added this
}

export const CardsSection = ({ content, titleLimit, descriptionLimit, onChange, className }: CardsSectionProps) => {
    const commonImageProps: Omit<ImageInputProps, 'className' | 'value'> = {
        onChange: () => {},
        label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
        subText: '1440x860',
    };

    // const handleImageChange = (value: ImageValues | Image) => {
    //     onChange({
    //         ...cardContents,
    //         image: value
    //     });
    // };
    //
    // const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     onChange({
    //         ...cardContents,
    //         description: e.target.value
    //     });
    // };

    if (!content) return null;

    const cardContents = content.filter((item) => item.contentType === ContentType.Description);

    if (!cardContents) {
        return null;
    }

    return (
        <div className="div">
            {cardContents.map((c: Content) => {
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

                // Передаємо унікальні обробники в CardContent
                return (
                    <CardContent
                        key={c.id}
                        content={c}
                        onImageChange={handleImageChange}
                        onChange={handleDescriptionChange}
                        descriptionLimit={descriptionLimit}
                    />
                );
            })}
        </div>
    );
};
