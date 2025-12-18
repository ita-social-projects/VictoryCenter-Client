import {
    EntityLocalizationDto,
    EntityLocalization,
    EntityWithDtoLocalizations,
} from '../../../../../types/common/language';

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
        localizations: dto.localizations.map((loc) =>
            mapLocalizationDtoToModel<TLocalizationDto, TLocalizationModel>(loc),
        ),
    };
}
