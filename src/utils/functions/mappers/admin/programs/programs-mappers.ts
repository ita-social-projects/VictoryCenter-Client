import { HippotherapyProgramDto, HippotherapyProgram } from '@/types/admin/programs';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

export function mapHippotherapyProgramDtoToModel(dto: HippotherapyProgramDto): HippotherapyProgram {
    const mappedLocalizations = dto.localizations.map((localization) => mapLocalizationDtoToModel(localization));

    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        categories: dto.categories,
        status: dto.status,
        previewImage: dto.previewImage,
        backgroundImage: dto.backgroundImage,
        location: dto.location,
        participantsCount: dto.participantsCount,
        meetingsCount: dto.meetingsCount,
        sections: dto.sections,
        slug: dto.slug,
        localizations: mappedLocalizations,
    };
}
