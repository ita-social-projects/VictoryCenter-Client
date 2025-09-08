import { Content, ContentType } from '../../../../../types/admin/who-we-are';
import { ImageInputProps } from '../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../const/admin/who-we-are';
import { BaseContent } from '../base-content/BaseContent';
import React from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { TextAreaWithCharacterLimit } from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { MainPageProps } from './SectionsProps';

export interface DescriptionSectionProps {
    content: Content[] | undefined;
    descriptionLimit: number;
    onChange: (data: Content) => void;
}

export const DescriptionSection = ({ content, onChange, descriptionLimit }: DescriptionSectionProps) => {
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({
            ...descriptionContent,
            description: e.target.value,
        });
    };

    if (!content) return null;

    const descriptionContent = content.find((item) => item.contentType === ContentType.Description);

    if (!descriptionContent) {
        return null;
    }

    return (
        <div className="">
            <TextAreaWithCharacterLimit
                onChange={handleDescriptionChange}
                value={descriptionContent.description ?? ''}
                name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                id={descriptionContent.id.toString()}
                maxLength={descriptionLimit}
            />
        </div>
    );
};
