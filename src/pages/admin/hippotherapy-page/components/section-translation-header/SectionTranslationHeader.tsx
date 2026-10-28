import { IconButton } from '@/components/admin/icon-button/IconButton';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ACTION_ICONS } from '@/const/common/action-icons';
import './SectionTranslationHeader.scss';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import { LocalizationLanguage, EntityLocalization } from '@/types/common/language';

export interface SectionTranslationHeaderProps {
    onTranslateClick?: () => void;
    isTranslateDisabled?: boolean;
    languages?: LocalizationLanguage[];
    localizations?: EntityLocalization[];
}

export const SectionTranslationHeader = ({
    onTranslateClick,
    isTranslateDisabled,
    languages,
    localizations,
}: SectionTranslationHeaderProps) => {
    const hasStatuses = !!languages?.length && !!localizations;

    if (!hasStatuses && !onTranslateClick) return null;

    return (
        <div className="section-translation-header">
            {hasStatuses && <LocalizationStatuses languages={languages} localizedEntity={{ localizations }} />}
            {onTranslateClick && (
                <IconButton
                    aria-label={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
                    type="button"
                    className="section-translation-header-button"
                    onClick={onTranslateClick}
                    DefaultIcon={ACTION_ICONS.translate.default}
                    disabled={isTranslateDisabled}
                />
            )}
        </div>
    );
};
