import { TeamCategory, TeamCategoryDto } from '@/types/admin/team-category';
import { mapLocalizationDtoToModel } from '../../common/localization/localization-mappers';

export const mapTeamCategoryDtoToTeamCategory = (dto: TeamCategoryDto): TeamCategory => {
    const mappedLocalizations = dto.localizations.map((localization) => mapLocalizationDtoToModel(localization));

    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        teamMembersCount: dto.teamMembersCount,
        localizations: mappedLocalizations,
    };
};
