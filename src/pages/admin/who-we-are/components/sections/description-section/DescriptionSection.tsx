import { Content } from '../../../../../../types/admin/who-we-are';
import React, { useState } from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import './DescriptionSection.scss';
import { Button } from '../../../../../../components/admin/button/Button';
import { OurMission } from '../../../../../public/about-us-page/our-mission/OurMission';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/who-we-are-schema/WhoWeAreSchema';
import { ContentType } from '../../../../../../types/common/about-us';

export interface DescriptionSectionProps {
    content: Content[] | undefined;
    descriptionLimit: number;
    onChange: (data: Content) => void;
    onPublish: () => void;
    isPublishButtonActive: boolean;
    setIsPublishButtonActive: (value: boolean) => void;
}

export const DescriptionSection = ({
    content,
    onChange,
    descriptionLimit,
    onPublish,
    setIsPublishButtonActive,
    isPublishButtonActive,
}: DescriptionSectionProps) => {
    const [descriptionError, setDescriptionError] = useState<string | null>(null);

    const descriptionContent = content?.find((item) => item.contentType === ContentType.Description);

    if (!descriptionContent) {
        return null;
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({
            ...descriptionContent,
            description: e.target.value,
        });
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(e.target.value);
        setDescriptionError(error || null);

        setIsPublishButtonActive(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(e.target.value);
        setDescriptionError(error || null);
    };

    return (
        <div className="description-section">
            <OurMission
                description={descriptionContent.description ?? ''}
                className="description-section-show-block"
                navigate={false}
            />
            <div className="description-section-textarea">
                <span className="description-section-textarea-label">{COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}</span>
                <TextAreaWithCharacterLimit
                    onChange={handleDescriptionChange}
                    value={descriptionContent.description ?? ''}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={descriptionContent.id.toString()}
                    maxLength={descriptionLimit}
                    rows={5}
                    onBlur={handleBlur}
                />
                {descriptionError && <p className="error">{descriptionError}</p>}
                <Button
                    className="button"
                    buttonStyle={'primary'}
                    onClick={onPublish}
                    type={'submit'}
                    disabled={!!descriptionError || !isPublishButtonActive}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                </Button>
            </div>
        </div>
    );
};
