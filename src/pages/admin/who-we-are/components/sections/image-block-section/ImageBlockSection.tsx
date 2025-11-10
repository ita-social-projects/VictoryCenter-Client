import { Content } from '../../../../../../types/admin/who-we-are';
import { ImageInput, ImageInputProps } from '../../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../../const/admin/who-we-are';
import React, { useState } from 'react';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { ImageValues } from '../../../../../../types/common/image';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import './ImageBlockSection.scss';
import { InputWithCharacterLimit } from '../../../../../../components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Button } from '../../../../../../components/admin/button/Button';
import { ContentType } from '../../../../../../types/common/about-us';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema';

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
    rows,
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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!titleContent) return;
        onChange({
            ...titleContent,
            title: e.target.value,
        });
        setIsPublishButtonActive(true);

        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(e.target.value);
        setTitleError(error || null);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!descriptionContent) return;
        onChange({
            ...descriptionContent,
            description: e.target.value,
        });
        setIsPublishButtonActive(true);

        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(e.target.value);
        setDescriptionError(error || null);
    };

    const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(e.target.value);
        setTitleError(error || null);
    };

    const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(e.target.value);
        setDescriptionError(error || null);
    };

    return (
        <div className="image-section">
            <div className="image-wrapper">
                <ImageInput
                    setError={setImageError}
                    value={imageContent?.image ?? null}
                    onChange={handleImageChange}
                    className="who-we-are-image-input-wrapper"
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
                        <label htmlFor={titleContent.id.toString()} className="content-wrapper-title-label">
                            {COMMON_TEXT_ADMIN.TYPE.TITLE}
                        </label>
                        <InputWithCharacterLimit
                            value={titleContent.title ?? ''}
                            onChange={handleTitleChange}
                            name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                            id={titleContent.id.toString()}
                            maxLength={titleLimit}
                            className="content-wrapper-title-field"
                            onBlur={handleTitleBlur}
                            disabled={true}
                        />
                        {titleError && (
                            <p data-testid="title-error" className="error">
                                {titleError}
                            </p>
                        )}
                    </div>
                )}

                {descriptionContent && (
                    <div className="content-wrapper-description">
                        <label htmlFor={descriptionContent.id.toString()} className="content-wrapper-description-label">
                            {COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                        </label>
                        <TextAreaWithCharacterLimit
                            onChange={handleDescriptionChange}
                            value={descriptionContent.description ?? ''}
                            maxLength={descriptionLimit}
                            name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                            id={descriptionContent.id.toString()}
                            rows={rows}
                            onBlur={handleDescriptionBlur}
                        />
                        {descriptionError && (
                            <p data-testid="description-error" className="error">
                                {descriptionError}
                            </p>
                        )}
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
