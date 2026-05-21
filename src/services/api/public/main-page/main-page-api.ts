import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PublicMainPageDto } from '@/types/public/main-page';
import { AxiosInstance } from 'axios';

export const PublicMainPageApi = {
    get: async (client: AxiosInstance): Promise<PublicMainPageDto> => {
        const response = await client.get<PublicMainPageDto>(API_ROUTES.MAIN_PAGE.PUBLIC);
        return response.data;
    },
};
