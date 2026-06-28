import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    LocaleCode,
    LocalizationLanguage,
} from '../../../../../types/common/language';

type LocalizationWithLanguageCode = {
    language?: { code?: string };
    localizationInfoDto?: { code?: string };
    languageId?: number;
};

export function mapLocalizationDtoToModel<TDto extends EntityLocalizationDto, TModel extends EntityLocalization>(
    dto: TDto,
): Omit<TDto, 'localizationInfoDto'> & TModel {
    const { localizationInfoDto, ...rest } = dto;

    return {
        ...rest,
        language: localizationInfoDto,
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

export function resolveLocaleCode(
    loc: LocalizationWithLanguageCode,
    languages?: LocalizationLanguage[],
): LocaleCode | null {
    const directCode = loc.language?.code ?? loc.localizationInfoDto?.code;
    if (directCode === 'uk' || directCode === 'en') return directCode;

    if (!languages?.length) return null;

    const lang = languages.find((l) => l.id === loc.languageId);
    const code = lang?.code;

    return code === 'uk' || code === 'en' ? code : null;
}

export function getLanguageIdByCode(languages: LocalizationLanguage[] | undefined, code: LocaleCode): number | null {
    if (!languages?.length) return null;

    const lang = languages.find((l) => l.code === code);
    return lang?.id ?? null;
}
