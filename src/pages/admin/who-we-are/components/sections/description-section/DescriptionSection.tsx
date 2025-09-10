import { Content, ContentType } from '../../../../../../types/admin/who-we-are';
import { ImageInputProps } from '../../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../../const/admin/who-we-are';
import React from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { MainPageProps } from '../SectionsProps';
import { ReactComponent as ArrowIcon } from '../../../../../../assets/icons/arrow-up-right.svg';
import './DescriptionSection.scss';

export interface DescriptionSectionProps {
    content: Content[] | undefined;
    descriptionLimit: number;
    onChange: (data: Content) => void;
}

export const DescriptionSection = ({ content, onChange, descriptionLimit }: DescriptionSectionProps) => {
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // onChange({
        //     ...descriptionContent,
        //     description: e.target.value,
        // });
    };

    if (!content) return null;

    const descriptionContent = content.find((item) => item.contentType === ContentType.Description);

    if (!descriptionContent) {
        return null;
    }

    return (
        <div className="description-section">
            <h2>{WHO_WE_ARE_TEXT.WHAT_WE_DO}</h2>
            <div className="description-section-preview">
                <span className="description-section-preview-text">{descriptionContent.description ?? ''}</span>
                <div className="description-section-preview-link">
                    <span className="description-section-preview-link-title">{WHO_WE_ARE_TEXT.GO_TO_PROGRAMS}</span>
                    <ArrowIcon />
                </div>
            </div>
            <div className="description-section-textarea">
                <span>{COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}</span>
                <TextAreaWithCharacterLimit
                    onChange={handleDescriptionChange}
                    value={descriptionContent.description ?? ''}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={descriptionContent.id.toString()}
                    maxLength={descriptionLimit}
                    rows={5}
                />
            </div>
        </div>
    );
};
