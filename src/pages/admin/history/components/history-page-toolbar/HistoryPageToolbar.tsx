import { Button } from '@/components/admin/button/Button';
import { HISTORY_TEXT } from '@/const/admin/history';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import styles from './HistoryPageToolbar.module.scss';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import {
    LocalizationToolkit,
    LocalizationToolkitProps,
} from '@/components/admin/localization-toolkit/LocalizationToolkit';
import {
    EntityLocalization,
    EntityWithLocalizations,
    EntityWithTranslationStatuses,
    LocalizationLanguage,
} from '@/types/common/language';

export interface HistoryPageToolbarProps extends LocalizationToolkitProps {
    onAddSection: () => void;
    onTranslate: () => void;
    localizedEntity?: EntityWithLocalizations<EntityLocalization> | EntityWithTranslationStatuses;
    translationLanguages: LocalizationLanguage[];
}

export const HistoryPageToolbar = ({
    translationLanguages,
    onAddSection,
    languages,
    localizedEntity,
    onLanguageChange,
    onTranslationStatusFilterChange,
    onTranslate,
}: HistoryPageToolbarProps) => {
    return (
        <div className={styles['history-page-toolbar']}>
            {localizedEntity && (
                <LocalizationStatuses languages={translationLanguages} localizedEntity={localizedEntity} />
            )}
            <LocalizationToolkit
                languages={languages}
                onLanguageChange={onLanguageChange}
                onTranslationStatusFilterChange={onTranslationStatusFilterChange}
            />
            <div className={styles['actions-wrapper']}>
                <IconButton
                    DefaultIcon={ACTION_ICONS.translate.default}
                    onClick={onTranslate}
                    aria-label={HISTORY_TEXT.BUTTON.TRANSLATE}
                    type="button"
                />
                <Button onClick={onAddSection} buttonStyle="primary">
                    {HISTORY_TEXT.BUTTON.ADD_SECTION}
                    <PlusIcon />
                </Button>
            </div>
        </div>
    );
};
