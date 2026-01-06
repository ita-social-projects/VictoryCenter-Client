import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import React from 'react';
import { ImageInput, ImageInputProps } from '@/components/admin/image-input/ImageInput';
import { Content } from '@/types/admin/who-we-are';
import { ImageValues } from '@/types/common/image';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import './CardContent.scss';

export interface CardContentProps {
    content: Content;
    onChange: (data: Content) => void;
    descriptionLimit: number;
    rows?: number;
    imageInputProps: Omit<ImageInputProps, 'className' | 'value' | 'onChange' | 'setError'>;
    onDescriptionValidate: (value: React.ChangeEvent<HTMLTextAreaElement>) => void;
    descriptionError: string | null;
    imageError: string | null;
    setImageError: (value: string | null) => void;
    setIsPublishButtonActive: (value: boolean) => void;
}

export const CardContent = ({
    content,
    onChange,
    descriptionLimit,
    rows,
    imageInputProps,
    onDescriptionValidate,
    descriptionError,
    imageError,
    setImageError,
    setIsPublishButtonActive,
}: CardContentProps) => {
    const handleImageChange = (value: ImageValues | null) => {
        onChange({
            ...content,
            image: value,
        });
        setIsPublishButtonActive(true);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({
            ...content,
            description: e.target.value,
        });
        onDescriptionValidate(e);
    };

    return (
        <div style={{ width: imageInputProps.style?.width }} className="card-content">
            <ImageInput
                value={content?.image ?? null}
                onChange={handleImageChange}
                label={WHO_WE_ARE_TEXT.IMAGE.INPUT}
                variant="whoWeAre"
                setError={setImageError}
                {...imageInputProps}
            />
            {imageError && <p className="error">{imageError}</p>}
            <div className="card-content-description-wrapper">
                <TextAreaWithCharacterLimitGroup
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    onChange={handleDescriptionChange}
                    value={content.description ?? ''}
                    maxLength={descriptionLimit}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={content.id.toString()}
                    rows={rows}
                    onBlur={onDescriptionValidate}
                    error={descriptionError ?? undefined}
                />
            </div>
        </div>
    );
};
