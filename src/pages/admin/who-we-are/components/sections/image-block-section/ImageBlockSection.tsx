import { Content } from '@/types/admin/who-we-are';
import { ImageInput, ImageInputProps } from '@/components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import React, { useState } from 'react';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import './ImageBlockSection.scss';
import { Button } from '@/components/admin/button/Button';
import { ContentType } from '@/types/common/about-us';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

export interface ImageSectionProps {
    content: Content[] | undefined;
    titleLimit?: number;
    descriptionLimit: number;
    rows?: number;
    onChange: (data: Content) => void;
    onPublish: () => void;
    imageInputProps: Omit<ImageInputProps, 'className' | 'value' | 'onChange' | 'setError'>;
    isPublishButtonActive: boolean;
    setIsPublishButtonActive: (value: boolean) => void;
}

export const ImageSection = ({
    content,
    titleLimit = 10,
    descriptionLimit,
    onChange,
    onPublish,
    imageInputProps,
    isPublishButtonActive,
    setIsPublishButtonActive,
}: ImageSectionProps) => {
    const [imageError, setImageError] = useState<string | null>(null);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [descriptionError, setDescriptionError] = useState<string | null>(null);

    const imageContent = content?.find((item) => item.contentType === ContentType.Image) ?? null;
    const titleContent = content?.find((item) => item.contentType === ContentType.Title);
    const descriptionContent = content?.find((item) => item.contentType === ContentType.Description);

    if (!content || !descriptionContent) {
        return null;
    }

    const handleImageChange = (value: ImageValues | null) => {
        onChange({
            ...(imageContent || { contentType: ContentType.Image }),
            image: value,
            id: imageContent ? imageContent.id : 0,
            description: null,
            title: null,
            imageId: null,
        });
        setIsPublishButtonActive(true);
    };

    const handleTitleChange = (value: string) => {
        if (!titleContent) return;
        onChange({
            ...titleContent,
            title: value,
        });
        setIsPublishButtonActive(true);

        const plainText = getPlainTextFromHtml(value);
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);
        setTitleError(error || null);
    };

    const handleDescriptionChange = (value: string) => {
        if (!descriptionContent) return;
        onChange({
            ...descriptionContent,
            description: value,
        });
        setIsPublishButtonActive(true);

        const plainText = getPlainTextFromHtml(value);
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);
        setDescriptionError(error || null);
    };

    const handleTitleBlur = () => {
        if (!titleContent) return;
        const plainText = getPlainTextFromHtml(titleContent.title ?? '');
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);
        setTitleError(error || null);
    };

    const handleDescriptionBlur = () => {
        const plainText = getPlainTextFromHtml(descriptionContent?.description ?? '');
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);
        setDescriptionError(error || null);
    };

    return (
        <div className="image-section">
            <div className="image-wrapper">
                <ImageInput
                    setError={setImageError}
                    value={imageContent?.image ?? null}
                    onChange={handleImageChange}
                    variant="whoWeAre"
                    label={WHO_WE_ARE_TEXT.IMAGE.INPUT}
                    {...imageInputProps}
                />
                {imageError && (
                    <p data-testid="image-error" className="error">
                        {imageError}
                    </p>
                )}
            </div>

            <div className="content-wrapper">
                {titleContent && (
                    <div className="content-wrapper-title">
                        <RichTextInputGroup
                            label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                            value={titleContent.title ?? ''}
                            onChange={handleTitleChange}
                            name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                            id={titleContent.id.toString()}
                            maxLength={titleLimit}
                            onBlur={handleTitleBlur}
                            error={titleError || undefined}
                        />
                    </div>
                )}

                {descriptionContent && (
                    <div className="content-wrapper-description">
                        <RichTextInputGroup
                            label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                            onChange={handleDescriptionChange}
                            value={descriptionContent.description ?? ''}
                            maxLength={descriptionLimit}
                            name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                            id={descriptionContent.id.toString()}
                            onBlur={handleDescriptionBlur}
                            error={descriptionError || undefined}
                        />
                    </div>
                )}
                <Button
                    className="button"
                    buttonStyle="primary"
                    onClick={onPublish}
                    type="submit"
                    disabled={!!imageError || !!descriptionError || !!titleError || !isPublishButtonActive}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                </Button>
            </div>
        </div>
    );
};
