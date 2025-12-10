import {
    EntityLocalization,
    EntityWithLocalizations,
    LocalizationLanguage,
    TranslationStatus,
} from '../../../types/common/language';
import './LocalizationStatuses.scss';

export interface LocalizationStatusProps<TLocalization extends EntityLocalization> {
    languages: LocalizationLanguage[];
    localizedEntity: EntityWithLocalizations<TLocalization>;
}

export const LocalizationStatuses = <TLocalization extends EntityLocalization>({
    languages,
    localizedEntity,
}: LocalizationStatusProps<TLocalization>) => {
    return (
        <div className="statuses" data-testId="localization-statuses">
            {languages.map((language) => (
                <span
                    key={language.id}
                    className={`badge ${getLocalizationClassNameFromStatus(language, localizedEntity)}`}
                >
                    {language.code.toUpperCase()}
                </span>
            ))}
        </div>
    );
};

export function getLocalizationClassNameFromStatus<TLocalization extends EntityLocalization>(
    language: LocalizationLanguage,
    localizedEntity: EntityWithLocalizations<TLocalization>,
) {
    const entityLocalization = localizedEntity.localizations.find(
        (localization) => localization.language?.code === language.code,
    );

    switch (entityLocalization?.translationStatus) {
        case TranslationStatus.Relevant:
            return 'status-relevant';

        case TranslationStatus.Outdated:
            return 'status-outdated';

        default:
            return 'status-missing';
    }
}
