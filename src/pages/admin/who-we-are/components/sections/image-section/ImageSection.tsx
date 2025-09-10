import { Content, ContentType } from '../../../../../../types/admin/who-we-are';
import { ImageInput, ImageInputProps } from '../../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../../const/admin/who-we-are';
import React from 'react';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { Image, ImageValues } from '../../../../../../types/common/image';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import bgImage from '../../../../../assets/images/public/about-us-page/background.jpg';
import './ImageSection.scss';

export interface ImageSectionProps {
    content: Content[] | undefined;
    titleLimit?: number;
    descriptionLimit?: number;
    rows?: number;
    onChange: (data: Content) => void;
    imageInputProps: Omit<ImageInputProps, 'className' | 'value' | 'onChange'>;
}

export const ImageSection = ({
    content,
    titleLimit = 10,
    descriptionLimit,
    rows,
    onChange,
    imageInputProps,
}: ImageSectionProps) => {
    const commonImageProps: Omit<ImageInputProps, 'className' | 'value' | 'onChange'> = {
        label: WHO_WE_ARE_TEXT.IMAGE.INPUT,
        subText: '1440x860',
    };
    const imageContent = content?.find((item) => item.contentType === ContentType.Image) ?? null;
    const titleContent = content?.find((item) => item.contentType === ContentType.Title);
    const descriptionContent = content?.find((item) => item.contentType === ContentType.Description);

    const handleImageChange = (value: ImageValues | null) => {
        onChange({
            ...(imageContent || { contentType: ContentType.Image }), // Create new object if not found
            image: value,
            id: imageContent?.id!,
            description: '',
            title: '',
        });
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // onChange({
        //     ...(titleContent || { contentType: ContentType.Title }),
        //     title: e.target.value,
        //     id: titleContent?.id ?? null,
        // });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // onChange({
        //     ...(descriptionContent || { contentType: ContentType.Description }),
        //     description: e.target.value,
        //     id: descriptionContent?.id,
        // });
    };

    //  const handleImageChange = (value: ImageValues | Image) => {
    //        onChange({
    //            ...cardContents,
    //            image: value
    //        });
    //  };

    //  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //        onChange({
    //            ...cardContents,
    //            description: e.target.value
    //        });
    //  };

    if (!content) return null;

    const cardContents = content.filter((item) => item.contentType === ContentType.Description);

    if (!cardContents) {
        return null;
    }

    return (
        <div className="image-section">
            <div className="image-wrapper">
                <ImageInput
                    value={imageContent?.image ?? null}
                    onChange={handleImageChange}
                    className="who-we-are-image-input-wrapper"
                    label={WHO_WE_ARE_TEXT.IMAGE.INPUT}
                    {...imageInputProps}
                />
            </div>

            <div className="content-wrapper">
                {titleContent && (
                    <div className="content-wrapper-title">
                        <span>{COMMON_TEXT_ADMIN.TYPE.TITLE}</span>
                        <TextAreaWithCharacterLimit
                            onChange={handleTitleChange}
                            value={titleContent.title}
                            maxLength={titleLimit}
                            name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                            id={titleContent.id.toString()}
                            rows={1}
                        />
                    </div>
                )}

                {descriptionContent && (
                    <div className="content-wrapper-description">
                        <span>{COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}</span>
                        <TextAreaWithCharacterLimit
                            onChange={handleDescriptionChange}
                            value={descriptionContent.description}
                            maxLength={descriptionLimit!}
                            name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                            id={descriptionContent.id.toString()}
                            rows={rows}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
