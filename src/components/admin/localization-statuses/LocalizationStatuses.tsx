import cn from 'classnames';
import {
    EntityLocalization,
    EntityWithLocalizations,
    EntityWithTranslationStatuses,
    LocalizationLanguage,
    TranslationStatus,
} from '@/types/common/language';
import styles from './LocalizationStatuses.module.scss';

export interface LocalizationStatusProps<TLocalization extends EntityLocalization> {
    languages: LocalizationLanguage[];
    localizedEntity: EntityWithLocalizations<TLocalization> | EntityWithTranslationStatuses;
}

const getTranslationStatus = <TLocalization extends EntityLocalization>(
    language: LocalizationLanguage,
    localizedEntity: EntityWithLocalizations<TLocalization> | EntityWithTranslationStatuses,
): TranslationStatus | undefined => {
    if ('translationStatuses' in localizedEntity) {
        return localizedEntity.translationStatuses?.find((loc) => loc.languageId === language.id)?.translationStatus;
    }

    return localizedEntity.localizations?.find((loc) => loc.language?.code === language.code)?.translationStatus;
};

export const LocalizationStatuses = <TLocalization extends EntityLocalization>({
    languages,
    localizedEntity,
}: LocalizationStatusProps<TLocalization>) => {
    return (
        <div className={styles.statuses} data-testid="localization-statuses">
            {languages.map((language) => {
                const status = getTranslationStatus(language, localizedEntity);

                const statusClass = cn(styles.badge, {
                    [styles.relevant]: status === TranslationStatus.Relevant,
                    [styles.outdated]: status === TranslationStatus.Outdated,
                });
                return (
                    <span key={language.id} className={statusClass}>
                        {language.code.toUpperCase()}
                    </span>
                );
            })}
        </div>
    );
};
