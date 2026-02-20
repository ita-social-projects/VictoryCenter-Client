import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateTeamCategoryLocalizationDto,
    TeamCategoryLocalizationDto,
    UpdateTeamCategoryLocalizationDto,
} from '@/types/admin/team-category';
import { AxiosInstance } from 'axios';

export const TeamCategoryLocalizationApi = {
    create: async (
        client: AxiosInstance,
        data: CreateTeamCategoryLocalizationDto,
    ): Promise<TeamCategoryLocalizationDto> => {
        const response = await client.post<TeamCategoryLocalizationDto>(
            API_ROUTES.TEAM_CATEGORY_LOCALIZATIONS.BASE,
            data,
        );
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateTeamCategoryLocalizationDto,
    ): Promise<TeamCategoryLocalizationDto> => {
        const response = await client.put<TeamCategoryLocalizationDto>(
            `${API_ROUTES.TEAM_CATEGORY_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
