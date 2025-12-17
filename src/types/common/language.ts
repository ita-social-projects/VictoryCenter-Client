export interface LocalizationLanguage extends LocalizationInfo {
    name: string;
}

export interface LocalizationInfo {
    id: number;
    code: string;
}

export interface EntityLocalization {
    language: LocalizationInfo;
    translationStatus: TranslationStatus;
}

export interface EntityLocalizationDto {
    localizationInfoDto: LocalizationInfo;
    translationStatus: TranslationStatus;
}

export interface EntityWithLocalizations<TLocalization extends EntityLocalization> {
    localizations: TLocalization[];
}

export interface EntityWithDtoLocalizations<TLocalization extends EntityLocalizationDto> {
    localizations: TLocalization[];
}

export enum TranslationStatus {
    Outdated,
    Relevant,
}

export enum TranslationStatusFilter {
    All,
    Outdated,
    Missing,
}
