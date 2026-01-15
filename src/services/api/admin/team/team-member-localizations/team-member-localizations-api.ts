import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateTeamMemberLocalizationDto,
    TeamMemberLocalizationDto,
    UpdateTeamMemberLocalizationDto,
} from '@/types/admin/team-members';

export const TeamMemberLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateTeamMemberLocalizationDto,
    ): Promise<TeamMemberLocalizationDto> => {
        const response = await client.post<TeamMemberLocalizationDto>(API_ROUTES.TEAM_MEMBER_LOCALIZATIONS.BASE, data);

        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateTeamMemberLocalizationDto,
    ): Promise<TeamMemberLocalizationDto> => {
        const response = await client.put<TeamMemberLocalizationDto>(
            `${API_ROUTES.TEAM_MEMBER_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
