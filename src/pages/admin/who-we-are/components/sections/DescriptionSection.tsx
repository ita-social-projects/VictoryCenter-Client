import React from 'react';
import { Content, ContentType } from '../../../../../types/admin/who-we-are';
import { WHO_WE_ARE_TEXT } from '../../../../../const/admin/who-we-are';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { TextAreaWithCharacterLimit } from '../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { MainPageProps } from './SectionsProps';
import { Button } from "../../../../../components/admin/button/Button";
import { OurMission } from "../../../../public/about-us-page/our-mission/OurMission";

export interface DescriptionSectionProps {
    content: Content[] | undefined;
    descriptionLimit: number;
    onChange: (data: Content) => void;
    onPublish: () => void;
}

export const DescriptionSection = ({ content, onChange, descriptionLimit, onPublish }: DescriptionSectionProps) => {
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
        <div className="container">
            <div className="our-mission">
                <OurMission mainText={descriptionContent.description ?? ''} />
            </div>
            <div className="text-area">
                <TextAreaWithCharacterLimit
                    onChange={handleDescriptionChange}
                    value={descriptionContent.description ?? ''}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={descriptionContent.id.toString()}
                    maxLength={descriptionLimit}
                />
            </div>
            <Button className="button" buttonStyle={"primary"} onClick={onPublish} type={"submit"}>
                Опублікувати
            </Button>
        </div>
    );
};