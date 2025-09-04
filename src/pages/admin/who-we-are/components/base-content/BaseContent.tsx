import { Content, ContentType } from '../../../../../types/admin/who-we-are';
import {
    TextAreaWithCharacterLimit,
    TextAreaWithCharacterLimitProps
} from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import React, { useCallback, useState } from 'react';
import {ImageInput, ImageInputProps} from '../../../../../components/admin/image-input/ImageInput';
import { Image, ImageValues } from '../../../../../types/common/image';
import { CardContent } from "../card-content/CardContent";
import {WHO_WE_ARE_TEXT} from "../../../../../const/admin/who-we-are";
import {CardContentProps} from "@mui/material";

interface BaseContentProps {
    content: Content;
    descriptionLimit: number;
    titleLimit: number;
    onChange: (data: Content) => void;
    className: string;
    imageProps?: Partial<ImageInputProps>;
    textAreaProps?: Partial<TextAreaWithCharacterLimitProps>;
    cardProps?: Partial<CardContentProps>;
}

export const BaseContent = ({ className, content, titleLimit, descriptionLimit, onChange, imageProps = {}, textAreaProps = {}, cardProps = {}, }: BaseContentProps) => {
    const handleChange = useCallback(
        <K extends keyof Content>(field: K, value: Content[K]) => {
            onChange({
                ...content,
                [field]: value,
            });
        },
        [content, onChange],
    );

    const handleImageChange = useCallback(
        (image: Image | ImageValues | null) => {
            onChange({
                ...content,
                image: image ?? content.image,
            });
        },
        [content, onChange],
    );



    switch (content.contentType) {
        case ContentType.Image:
            return <ImageInput value={content.image} onChange={(image) => handleImageChange(image ?? content.image)} {...imageProps} />;
        case ContentType.Title:
            return (
                <TextAreaWithCharacterLimit
                    onChange={(e) => handleChange('title', e.target.value)}
                    value={content.title}
                    maxLength={titleLimit}
                    name={COMMON_TEXT_ADMIN.TYPE.TITLE}
                    id={content.id.toString()}
                ></TextAreaWithCharacterLimit>
            );
        case ContentType.Description:
            return (
                <TextAreaWithCharacterLimit
                    onChange={(e) => handleChange('description', e.target.value)}
                    value={content.description ?? ""}
                    maxLength={descriptionLimit}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={content.id.toString()}
                ></TextAreaWithCharacterLimit>
            );
        case ContentType.Card:
            return (<CardContent content={content} onChange={handleChange} onImageChange={handleImageChange} descriptionLimit={descriptionLimit}/>
            );
        default:
            return null;
    }
};
