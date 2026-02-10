import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { TeamCategoryDto, TeamCategoryCreateUpdate } from '@/types/admin/team-category';

type TeamCategoryPayload = Omit<TeamCategoryCreateUpdate, 'id'>;
const toPayload = (category: TeamCategoryCreateUpdate): TeamCategoryPayload => {
    const { name, description } = category;
    return { name, description };
};

export const TeamCategoriesApi = {
    getAll: async (client: AxiosInstance): Promise<TeamCategoryDto[]> => {
        const response = await client.get<TeamCategoryDto[]>(API_ROUTES.TEAM_CATEGORIES.BASE);
        return response.data;
    },

    create: async (client: AxiosInstance, category: TeamCategoryCreateUpdate): Promise<TeamCategoryDto> => {
        const response = await client.post<TeamCategoryDto>(API_ROUTES.TEAM_CATEGORIES.BASE, toPayload(category));
        return response.data;
    },

    update: async (client: AxiosInstance, category: TeamCategoryCreateUpdate): Promise<TeamCategoryDto> => {
        if (category.id == null) {
            throw new Error('TeamCategoriesApi.update: category.id is required');
        }

        const response = await client.put(`${API_ROUTES.TEAM_CATEGORIES.BASE}/${category.id}`, toPayload(category));
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.TEAM_CATEGORIES.BASE}/${id}`);
    },
};
