import { Member, TeamCategory, TeamCategoryDto } from '../../../../types/admin/TeamMembers';
import { reverseCategoryMap } from '../../../../pages/admin/team/TeamPage';
import { MemberFormValues } from '../../../../pages/admin/team/components/member-form/MemberForm';
import { AxiosInstance } from 'axios';
import { Status } from '../../../../types/Common';

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
