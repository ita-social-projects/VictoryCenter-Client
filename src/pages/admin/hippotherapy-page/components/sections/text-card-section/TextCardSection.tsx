import { memo } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { HippotherapyTextCardContent } from '@/types/admin/hippotherapy-page';
import { SectionTranslationHeader } from '../../section-translation-header/SectionTranslationHeader';
import './TextCardSection.scss';
import { LocalizationLanguage, EntityLocalization } from '@/types/common/language';
import { useHippotherapyReadOnly } from '@/pages/admin/hippotherapy-page/context/HippotherapyReadOnlyContext';

export interface TextCardSectionProps {
    value: HippotherapyTextCardContent;
    onChange: (value: HippotherapyTextCardContent) => void;
    fieldIdPrefix: string;
    disabled?: boolean;
    onTranslateClick?: () => void;
    isTranslateDisabled?: boolean;
    translationLanguages?: LocalizationLanguage[];
    localizations?: EntityLocalization[];
}

const TextCardSectionComponent = ({
    value,
    onChange,
    fieldIdPrefix,
    disabled,
    onTranslateClick,
    isTranslateDisabled,
    translationLanguages,
    localizations,
}: TextCardSectionProps) => {
    const title = useValidatedRichTextField({
        value: value.title,
        onChange: (title) => onChange({ ...value, title }),
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
    });

    const description = useValidatedRichTextField({
        value: value.description,
        onChange: (description) => onChange({ ...value, description }),
    });

    const isReadOnly = useHippotherapyReadOnly();

    return (
        <div className="hippotherapy-text-card-section">
            <SectionTranslationHeader
                onTranslateClick={onTranslateClick}
                isTranslateDisabled={isTranslateDisabled}
                languages={translationLanguages}
                localizations={localizations}
            />

            <div className="hippotherapy-text-card-section-content">
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                    isRequired
                    id={`${fieldIdPrefix}-title`}
                    name={`${fieldIdPrefix}-title`}
                    value={value.title}
                    onChange={title.handleChange}
                    onBlur={title.handleBlur}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_TITLE}
                    error={title.error}
                    disabled={disabled}
                    hideToolbar={isReadOnly}
                />
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    isRequired
                    id={`${fieldIdPrefix}-description`}
                    name={`${fieldIdPrefix}-description`}
                    value={value.description}
                    onChange={description.handleChange}
                    onBlur={description.handleBlur}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_DESCRIPTION}
                    error={description.error}
                    disabled={disabled}
                    hideToolbar={isReadOnly}
                />
            </div>
        </div>
    );
};

export const TextCardSection = memo(TextCardSectionComponent);
