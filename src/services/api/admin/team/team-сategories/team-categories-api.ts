import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import { TeamCategory, TeamCategoryDto } from '../../../../../types/admin/team-members';

export const TeamCategoriesApi = {
    getAll: async (client: AxiosInstance): Promise<TeamCategory[]> => {
        const response = await client.get<TeamCategoryDto[]>(API_ROUTES.TEAM.CATEGORIES);
        return response.data.map(mapTeamCategoryDtoToTeamCategory);
    },
};

export const mapTeamCategoryDtoToTeamCategory = (dto: TeamCategoryDto): TeamCategory => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
});
