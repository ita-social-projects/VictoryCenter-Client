import { Content } from '@/types/admin/who-we-are';
import React, { useState } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import './DescriptionSection.scss';
import { Button } from '@/components/admin/button/Button';
import { OurMission } from '@/pages/public/about-us-page/our-mission/OurMission';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { ContentType } from '@/types/common/about-us';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

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

    const handleDescriptionChange = (value: string) => {
        onChange({
            ...descriptionContent,
            description: value,
        });
        const plainText = getPlainTextFromHtml(value);
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);
        setDescriptionError(error || null);

        setIsPublishButtonActive(true);
    };

    const handleBlur = () => {
        const plainText = getPlainTextFromHtml(descriptionContent.description ?? '');
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);
        setDescriptionError(error || null);
    };

    return (
        <div className="description-section">
            <OurMission description={descriptionContent.description ?? ''} className="description-section-show-block" />
            <div className="description-section-textarea">
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={descriptionContent.id.toString()}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    value={descriptionContent.description ?? ''}
                    onChange={handleDescriptionChange}
                    onBlur={handleBlur}
                    maxLength={descriptionLimit}
                    error={descriptionError || undefined}
                />
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
