import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    LocaleCode,
    LocalizationInfo,
    LocalizationLanguage,
} from '../../../../../types/common/language';

export type LocalizationLanguageSource = {
    languageId?: number | null;
    code?: string | null;
    language?: Partial<LocalizationInfo> | null;
    localizationInfoDto?: Partial<LocalizationInfo> | null;
};

export function mapLocalizationDtoToModel<TDto extends EntityLocalizationDto, TModel extends EntityLocalization>(
    dto: TDto,
): Omit<TDto, 'localizationInfoDto'> & TModel {
    const raw = dto as unknown as { localizationInfoDto?: TModel['language']; language?: TModel['language'] };
    const { localizationInfoDto, ...rest } = dto;

    return {
        ...rest,
        language: localizationInfoDto ?? raw.language,
    } as Omit<TDto, 'localizationInfoDto'> & TModel;
}

export function mapEntityWithLocalizations<
    TEntityDto extends EntityWithDtoLocalizations<TLocalizationDto>,
    TLocalizationDto extends EntityLocalizationDto,
    TLocalizationModel extends EntityLocalization,
>(
    dto: TEntityDto,
): Omit<TEntityDto, 'localizations'> & {
    localizations: (Omit<TLocalizationDto, 'localizationInfoDto'> & TLocalizationModel)[];
} {
    return {
        ...dto,
        localizations: (dto.localizations ?? []).map((loc) =>
            mapLocalizationDtoToModel<TLocalizationDto, TLocalizationModel>(loc),
        ),
    };
}

export function getLocalizationLanguageId(localization: LocalizationLanguageSource): number | undefined {
    const directLanguageId = localization.languageId ?? undefined;
    const domainLanguageId = localization.language?.id ?? undefined;
    const dtoLanguageId = localization.localizationInfoDto?.id ?? undefined;

    return directLanguageId ?? domainLanguageId ?? dtoLanguageId;
}

export function getLocalizationLanguageCode(localization: LocalizationLanguageSource): string | undefined {
    const directLanguageCode = localization.code ?? undefined;
    const domainLanguageCode = localization.language?.code ?? undefined;
    const dtoLanguageCode = localization.localizationInfoDto?.code ?? undefined;

    return directLanguageCode ?? domainLanguageCode ?? dtoLanguageCode;
}

export function resolveLocaleCode(
    loc: LocalizationLanguageSource,
    languages?: LocalizationLanguage[],
): LocaleCode | null {
    const directCode = getLocalizationLanguageCode(loc);
    if (directCode === 'uk' || directCode === 'en') return directCode;

    if (!languages?.length) return null;

    const languageId = getLocalizationLanguageId(loc);
    const lang = languages.find((l) => l.id === languageId);
    const code = lang?.code;

    return code === 'uk' || code === 'en' ? code : null;
}

export function getLanguageIdByCode(languages: LocalizationLanguage[] | undefined, code: LocaleCode): number | null {
    if (!languages?.length) return null;

    const lang = languages.find((l) => l.code === code);
    return lang?.id ?? null;
}
