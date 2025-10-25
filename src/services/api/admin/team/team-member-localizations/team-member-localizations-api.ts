import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import {
    TeamMemberLocalizationUpdateRequest,
    TeamMemberLocalizationCreateRequest,
} from '../../../../../types/admin/localization/team-members';
import { TeamMember } from '../../../../../types/admin/team-members';

export const TeamMemberLocalizationsApi = {
    delete: async (client: AxiosInstance, id: number) => {
        await client.delete(`${API_ROUTES.TEAM_LOCALIZATIONS.BASE}/${id}`);
    },

    updateMemberLocalization: async (
        client: AxiosInstance,
        id: number,
        localization: TeamMemberLocalizationUpdateRequest,
    ): Promise<TeamMember> => {
        const response = await client.put(`${API_ROUTES.TEAM_LOCALIZATIONS.BASE}/${id}`, {
            fullName: localization.fullName,
            description: localization.description,
        });

        return response.data as TeamMember;
    },

    postMemberLocalization: async (
        client: AxiosInstance,
        localization: TeamMemberLocalizationCreateRequest,
    ): Promise<TeamMember> => {
        const response = await client.post(`${API_ROUTES.TEAM_LOCALIZATIONS.BASE}`, {
            fullName: localization.fullName,
            description: localization.description,
            teamMemberId: localization.teamMemberId,
            languageId: localization.languageId,
        });

        return response.data as TeamMember;
    },
};
