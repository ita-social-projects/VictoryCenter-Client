import { Content } from '@/types/admin/who-we-are';
import { useState, useMemo } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import './DescriptionSection.scss';
import { Button } from '@/components/admin/button/Button';
import { OurMission } from '@/pages/public/about-us-page/our-mission/OurMission';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { ContentType } from '@/types/common/about-us';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { LocalizationLanguage } from '@/types/common/language';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';
import { DEFAULT_LOCALE } from '@/const/common/locales';

export interface DescriptionSectionProps {
    content: Content[] | undefined;
    descriptionLimit: number;
    onChange: (data: Content) => void;
    onPublish: () => void;
    isPublishButtonActive: boolean;
    setIsPublishButtonActive: (value: boolean) => void;
    language: LocalizationLanguage;
}

export const DescriptionSection = ({
    content,
    onChange,
    descriptionLimit,
    onPublish,
    setIsPublishButtonActive,
    isPublishButtonActive,
    language,
}: DescriptionSectionProps) => {
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const isBaseLanguage = language.code === DEFAULT_LOCALE;
    const descriptionContent = content?.find((item) => item.contentType === ContentType.Description);

    const displayedDescription = useMemo(() => {
        if (!descriptionContent) return null;
        const displayedLocalization = returnDisplayedLocalization(descriptionContent, language.code);
        return displayedLocalization?.description ?? descriptionContent.description;
    }, [language.code, descriptionContent]);

    if (!descriptionContent) {
        return null;
    }

    const handleDescriptionChange = (value: string) => {
        if (!isBaseLanguage) return;
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
        if (!isBaseLanguage) return;
        const plainText = getPlainTextFromHtml(displayedDescription ?? '');
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText);
        setDescriptionError(error || null);
    };

    return (
        <div className="description-section">
            <OurMission description={displayedDescription ?? ''} className="description-section-show-block" />
            <div className="description-section-textarea">
                <RichTextInputGroup
                    key={`description-${language.code}`}
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={descriptionContent.id.toString()}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    value={displayedDescription ?? ''}
                    onChange={handleDescriptionChange}
                    onBlur={handleBlur}
                    maxLength={descriptionLimit}
                    error={isBaseLanguage ? (descriptionError ?? undefined) : undefined}
                    disabled={!isBaseLanguage}
                    hideToolbar={!isBaseLanguage}
                />
                {isBaseLanguage && (
                    <Button
                        className="button"
                        buttonStyle={'primary'}
                        onClick={onPublish}
                        type={'submit'}
                        disabled={!!descriptionError || !isPublishButtonActive || !isBaseLanguage}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                )}
            </div>
        </div>
    );
};
