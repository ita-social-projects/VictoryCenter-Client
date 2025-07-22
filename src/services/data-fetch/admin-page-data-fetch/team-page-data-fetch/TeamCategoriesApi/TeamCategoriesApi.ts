import { TeamCategory, TeamCategoryDto } from '../../../../../types/admin/TeamMembers';
import { AxiosInstance } from 'axios';

export const TeamCategoriesApi = {
    getAll: async (client: AxiosInstance): Promise<TeamCategory[]> => {
        const response = await client.get<TeamCategoryDto[]>('/Categories');
        return response.data.map(mapTeamCategoryDtoToTeamCategory);
    },
};

export const mapTeamCategoryDtoToTeamCategory = (dto: TeamCategoryDto): TeamCategory => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
});
