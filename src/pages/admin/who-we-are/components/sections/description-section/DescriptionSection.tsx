import { Content } from '../../../../../../types/admin/who-we-are';
import { ImageInputProps } from '../../../../../../components/admin/image-input/ImageInput';
import { WHO_WE_ARE_TEXT } from '../../../../../../const/admin/who-we-are';
import React, { useState } from 'react';
import { COMMON_TEXT_ADMIN } from '../../../../../../const/admin/common';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { MainPageProps } from '../SectionsProps';
import { ReactComponent as ArrowIcon } from '../../../../../../assets/icons/arrow-up-right.svg';
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
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (descriptionContent?.id || descriptionContent) {
            onChange({
                ...descriptionContent,
                description: e.target.value,
            });
        }
        setIsPublishButtonActive(true);
    };

    if (!content) return null;

    const descriptionContent = content.find((item) => item.contentType === ContentType.Description);

    if (!descriptionContent) {
        return null;
    }

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
                    onBlur={(e) => {
                        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(e.target.value);
                        setDescriptionError(error || null);
                    }}
                />
                {descriptionError && <p className="error">{descriptionError}</p>}
                <Button
                    className="button"
                    buttonStyle={'primary'}
                    onClick={onPublish}
                    type={'submit'}
                    disabled={!!descriptionError || !isPublishButtonActive}
                >
                    Опублікувати
                </Button>
            </div>
        </div>
    );
};
