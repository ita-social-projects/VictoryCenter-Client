import cn from 'classnames';
import {
    EntityLocalization,
    EntityWithLocalizations,
    EntityWithTranslationStatuses,
    LocalizationLanguage,
    TranslationStatus,
} from '@/types/common/language';
import styles from './LocalizationStatuses.module.scss';

export interface LocalizationStatusProps<TLocalization extends EntityLocalization = EntityLocalization> {
    languages: LocalizationLanguage[];
    localizedEntity: Partial<EntityWithLocalizations<TLocalization>> | Partial<EntityWithTranslationStatuses>;
}

const getTranslationStatus = <TLocalization extends EntityLocalization>(
    language: LocalizationLanguage,
    localizedEntity: Partial<EntityWithLocalizations<TLocalization>> | Partial<EntityWithTranslationStatuses>,
): TranslationStatus | undefined => {
    if (
        'translationStatuses' in localizedEntity &&
        localizedEntity.translationStatuses &&
        localizedEntity.translationStatuses.length > 0
    ) {
        return localizedEntity.translationStatuses.find((loc) => loc.languageId === language.id)?.translationStatus;
    }

    if (
        'localizations' in localizedEntity &&
        localizedEntity.localizations &&
        localizedEntity.localizations.length > 0
    ) {
        return localizedEntity.localizations.find(
            (loc: any) =>
                loc.language?.code === language.code ||
                loc.localizationInfoDto?.code === language.code ||
                loc.language?.id === language.id ||
                loc.localizationInfoDto?.id === language.id,
        )?.translationStatus;
    }

    return undefined;
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
