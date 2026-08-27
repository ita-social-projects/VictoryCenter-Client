import { memo, useState } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS } from '@/const/admin/hippotherapy-page';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { HippotherapyTextCardContent } from '@/types/admin/hippotherapy-page';
import './TextCardSection.scss';

export interface TextCardSectionProps {
    value: HippotherapyTextCardContent;
    onChange: (value: HippotherapyTextCardContent) => void;
    fieldIdPrefix: string;
    disabled?: boolean;
}

const TextCardSectionComponent = ({ value, onChange, fieldIdPrefix, disabled }: TextCardSectionProps) => {
    const [titleError, setTitleError] = useState<string | undefined>();
    const [descriptionError, setDescriptionError] = useState<string | undefined>();

    const handleTitleChange = (title: string) => {
        onChange({ ...value, title });
        setTitleError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(title)));
    };

    const handleDescriptionChange = (description: string) => {
        onChange({ ...value, description });
        setDescriptionError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(description)));
    };

    return (
        <div className="hippotherapy-text-card-section">
            <RichTextInputGroup
                label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                isRequired
                id={`${fieldIdPrefix}-title`}
                name={`${fieldIdPrefix}-title`}
                value={value.title}
                onChange={handleTitleChange}
                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_TITLE}
                error={titleError}
                disabled={disabled}
            />
            <RichTextInputGroup
                label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                isRequired
                id={`${fieldIdPrefix}-description`}
                name={`${fieldIdPrefix}-description`}
                value={value.description}
                onChange={handleDescriptionChange}
                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_DESCRIPTION}
                error={descriptionError}
                disabled={disabled}
            />
        </div>
    );
};

export const TextCardSection = memo(TextCardSectionComponent);
