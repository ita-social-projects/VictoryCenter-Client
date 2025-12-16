import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import {
    CreateTeamMemberLocalizationDto,
    TeamMemberLocalizationDto,
} from '../../../../../types/admin/localization/team-member-localization';

export const TeamMemberLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateTeamMemberLocalizationDto,
    ): Promise<TeamMemberLocalizationDto> => {
        const response = await client.post<TeamMemberLocalizationDto>(API_ROUTES.TEAM_LOCALIZATIONS.BASE, data);

        return response.data;
    },
};
