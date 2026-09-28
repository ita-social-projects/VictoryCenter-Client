import { EventCategoryDto } from '@/types/admin/event-category';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

export function mapEventCategoryDtoToModel(dto: any): EventCategoryDto {
    const mappedLocalizations = dto.localizations
        ? dto.localizations.map((loc: any) => ('localizationInfoDto' in loc ? mapLocalizationDtoToModel(loc) : loc))
        : undefined;

    return {
        id: dto.id,
        name: dto.name,
        relatedEventNewsCount: dto.relatedEventNewsCount ?? 0,
        ...(mappedLocalizations !== undefined && { localizations: mappedLocalizations }),
    };
}
