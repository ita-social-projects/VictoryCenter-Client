import { memo } from 'react';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_CHAR_LIMITS } from '@/const/admin/hippotherapy-page';
import { useHippotherapyTextFields } from '@/hooks/admin/use-hippotherapy-text-fields/useHippotherapyTextFields';
import { HippotherapyTextCardContent } from '@/types/admin/hippotherapy-page';
import './TextCardSection.scss';

export interface TextCardSectionProps {
    value: HippotherapyTextCardContent;
    onChange: (value: HippotherapyTextCardContent) => void;
    fieldIdPrefix: string;
    disabled?: boolean;
}

const TextCardSectionComponent = ({ value, onChange, fieldIdPrefix, disabled }: TextCardSectionProps) => {
    const {
        titleError,
        descriptionError,
        handleTitleChange,
        handleTitleBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    } = useHippotherapyTextFields({ value, onChange });

    return (
        <div className="hippotherapy-text-card-section">
            <RichTextInputGroup
                label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                isRequired
                id={`${fieldIdPrefix}-title`}
                name={`${fieldIdPrefix}-title`}
                value={value.title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
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
                onBlur={handleDescriptionBlur}
                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_DESCRIPTION}
                error={descriptionError}
                disabled={disabled}
            />
        </div>
    );
};

export const TextCardSection = memo(TextCardSectionComponent);
