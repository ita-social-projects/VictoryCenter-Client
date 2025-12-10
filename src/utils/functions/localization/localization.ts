import { EntityLocalization, EntityWithLocalizations } from '../../../types/common/language';

export const returnDisplayedLocalization = <TLocalization extends EntityLocalization>(
    localizedEntity: EntityWithLocalizations<TLocalization>,
    languageCode: string,
): TLocalization | null => {
    return localizedEntity.localizations.find((l) => l.language?.code === languageCode) ?? null;
};
