import cn from 'classnames';
import {
    EntityLocalization,
    EntityWithLocalizations,
    LocalizationLanguage,
    TranslationStatus,
} from '@/types/common/language';
import styles from './LocalizationStatuses.module.scss';

export interface LocalizationStatusProps<TLocalization extends EntityLocalization> {
    languages: LocalizationLanguage[];
    localizedEntity: EntityWithLocalizations<TLocalization>;
}

export const LocalizationStatuses = <TLocalization extends EntityLocalization>({
    languages,
    localizedEntity,
}: LocalizationStatusProps<TLocalization>) => {
    const getTranslationStatus = <TLocalization extends EntityLocalization>(
        languageCode: string,
        localizations: TLocalization[],
    ): TranslationStatus | undefined => {
        return localizations.find((loc) => loc.language?.code === languageCode)?.translationStatus;
    };

    return (
        <div className={styles.statuses} data-testid="localization-statuses">
            {languages.map((language) => {
                const status = getTranslationStatus(language.code, localizedEntity.localizations);

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
