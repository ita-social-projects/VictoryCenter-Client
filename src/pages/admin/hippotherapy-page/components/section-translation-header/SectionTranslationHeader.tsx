import { IconButton } from '@/components/admin/icon-button/IconButton';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ACTION_ICONS } from '@/const/common/action-icons';
import './SectionTranslationHeader.scss';

export interface SectionTranslationHeaderProps {
    onTranslateClick: () => void;
    isTranslateDisabled?: boolean;
}

export const SectionTranslationHeader = ({ onTranslateClick, isTranslateDisabled }: SectionTranslationHeaderProps) => (
    <div className="section-translation-header">
        <IconButton
            aria-label={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
            type="button"
            className="section-translation-header-button"
            onClick={onTranslateClick}
            DefaultIcon={ACTION_ICONS.translate.default}
            disabled={isTranslateDisabled}
        />
    </div>
);
