import { Button } from '@/components/admin/button/Button';
import { HISTORY_TEXT } from '@/const/admin/history';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
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
            <Button onClick={onAddSection} buttonStyle="primary">
                {HISTORY_TEXT.BUTTON.ADD_SECTION}
                <PlusIcon />
            </Button>
        </div>
    );
};
