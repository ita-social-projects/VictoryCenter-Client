import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { TextAreaWithCharacterLimit } from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import React from 'react';
import { ImageInput, ImageInputProps } from '../../../../../components/admin/image-input/ImageInput';
import { Content } from '../../../../../types/admin/who-we-are';
import { Image, ImageValues } from '../../../../../types/common/image';
import { WHO_WE_ARE_TEXT } from '../../../../../const/admin/who-we-are';
import './CardContent.scss';

interface CardContentProps {
    content: Content;
    onImageChange: (value: Image | ImageValues) => void;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    descriptionLimit: number;
    imageInputProps: Omit<ImageInputProps, 'className' | 'value' | 'onChange'>;
}
export const CardContent = ({
    content,
    onImageChange,
    onChange,
    descriptionLimit,
    imageInputProps,
}: CardContentProps) => {
    return (
        <div style={{ width: imageInputProps.style?.width }} className="card-content">
            <ImageInput
                value={content?.image ?? null}
                onChange={(image) => onImageChange(image ?? content.image!)}
                label={WHO_WE_ARE_TEXT.IMAGE.INPUT}
                className="who-we-are-image-input-wrapper"
                {...imageInputProps}
            />
            <span>{COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}</span>
            <TextAreaWithCharacterLimit
                onChange={(e) => onChange(e)}
                value={content.description ?? ''}
                maxLength={descriptionLimit}
                name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                id={content.id.toString()}
            ></TextAreaWithCharacterLimit>
        </div>
    );
};
