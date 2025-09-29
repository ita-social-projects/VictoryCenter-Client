import { COMMON_TEXT_ADMIN } from '../../../../../../../const/admin/common';
import { TextAreaWithCharacterLimit } from '../../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import React, { useState } from 'react';
import { ImageInput, ImageInputProps } from '../../../../../../../components/admin/image-input/ImageInput';
import { Content } from '../../../../../../../types/admin/who-we-are';
import { Image, ImageValues } from '../../../../../../../types/common/image';
import { WHO_WE_ARE_TEXT } from '../../../../../../../const/admin/who-we-are';
import './CardContent.scss';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '../../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema';

interface CardContentProps {
    content: Content;
    onImageChange: (value: ImageValues | null) => void;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    descriptionLimit: number;
    rows?: number;
    imageInputProps: Omit<ImageInputProps, 'className' | 'value' | 'onChange' | 'setError'>;
    onDescriptionBlur: (value: React.ChangeEvent<HTMLTextAreaElement>) => void;
    descriptionError: string | null;
    imageError: string | null;
    setImageError: (value: string | null) => void;
}
export const CardContent = ({
    content,
    onImageChange,
    onChange,
    descriptionLimit,
    rows,
    imageInputProps,
    onDescriptionBlur,
    descriptionError,
    imageError,
    setImageError,
}: CardContentProps) => {
    return (
        <div style={{ width: imageInputProps.style?.width }} className="card-content">
            <ImageInput
                value={content?.image ?? null}
                onChange={(image) => onImageChange(image ?? null)}
                label={WHO_WE_ARE_TEXT.IMAGE.INPUT}
                className="who-we-are-image-input-wrapper"
                setError={setImageError}
                {...imageInputProps}
            />
            {imageError && <p className="error">{imageError}</p>}
            <div className="card-content-description-wrapper">
                <span className="card-content-description-wrapper-label">{COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}</span>
                <TextAreaWithCharacterLimit
                    onChange={(e) => onChange(e)}
                    value={content.description ?? ''}
                    maxLength={descriptionLimit}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={content.id.toString()}
                    rows={rows}
                    onBlur={onDescriptionBlur}
                />
                {descriptionError && <p className="error">{descriptionError}</p>}
            </div>
        </div>
    );
};
