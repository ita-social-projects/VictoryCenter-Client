import { Content } from '../../../../../../types/admin/who-we-are';
import { ImageInput, ImageInputProps } from '../../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../../const/admin/who-we-are';
import React, { useCallback, useState } from 'react';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { Image, ImageValues } from '../../../../../../types/common/image';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import bgImage from '../../../../../assets/images/public/about-us-page/background.jpg';
import './ImageBlockSection.scss';
import { InputWithCharacterLimit } from '../../../../../../components/admin/input-with-character-limit/InputWithCharacterLimit';
import { Button } from '../../../../../../components/admin/button/Button';
import { ContentType } from '../../../../../../types/common/about-us';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema';

export interface ImageSectionProps {
    content: Content[] | undefined;
    titleLimit?: number;
    descriptionLimit?: number;
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

    if (!descriptionContent) {
        return null;
    }

    const handleImageChange = (value: ImageValues | null) => {
        onChange({
            ...(imageContent || { contentType: ContentType.Image }),
            image: value,
            id: imageContent?.id!,
            description: null,
            title: null,
            imageId: null,
        });
        setIsPublishButtonActive(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (titleContent?.id || titleContent) {
            onChange({
                ...(titleContent || { contentType: ContentType.Title }),
                title: e.target.value,
                id: titleContent?.id,
            });
            setIsPublishButtonActive(true);
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (descriptionContent?.id || descriptionContent) {
            onChange({
                ...(descriptionContent || { contentType: ContentType.Description }),
                description: e.target.value,
                id: descriptionContent?.id,
            });
            setIsPublishButtonActive(true);
        }
    };

    if (!content) return null;

    const cardContents = content.filter((item) => item.contentType === ContentType.Description);

    if (!cardContents) {
        return null;
    }

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
                {imageError && <p className="error">{imageError}</p>}
            </div>

            <div className="content-wrapper">
                {titleContent && (
                    <div className="content-wrapper-title">
                        <span className="content-wrapper-title-label">{COMMON_TEXT_ADMIN.TYPE.TITLE}</span>
                        <InputWithCharacterLimit
                            value={titleContent.title ?? ''}
                            onChange={handleTitleChange}
                            name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                            id={titleContent.id.toString()}
                            maxLength={titleLimit}
                            className="content-wrapper-title-field"
                            onBlur={(e) => {
                                const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(e.target.value);
                                setTitleError(error || null);
                            }}
                        />
                        {titleError && <p className="error">{titleError}</p>}
                    </div>
                )}

                {descriptionContent && (
                    <div className="content-wrapper-description">
                        <span className="content-wrapper-description-label">{COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}</span>
                        <TextAreaWithCharacterLimit
                            onChange={handleDescriptionChange}
                            value={descriptionContent.description ?? ''}
                            maxLength={descriptionLimit!}
                            name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                            id={descriptionContent.id.toString()}
                            rows={rows}
                            onBlur={(e) => {
                                const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(e.target.value);
                                setDescriptionError(error || null);
                            }}
                        />
                        {descriptionError && <p className="error">{descriptionError}</p>}
                    </div>
                )}
                <Button
                    className="button"
                    buttonStyle={'primary'}
                    onClick={onPublish}
                    type={'submit'}
                    disabled={!!descriptionError || !!titleError || !isPublishButtonActive}
                >
                    Опублікувати
                </Button>
            </div>
        </div>
    );
};
