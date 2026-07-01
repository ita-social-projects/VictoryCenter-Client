import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PublicMainPageDto } from '@/types/public/main-page';
import { axiosInstance } from '@/services/api/axios';

export const PublicMainPageApi = {
    get: async (): Promise<PublicMainPageDto> => {
        const response = await axiosInstance.get<PublicMainPageDto>(API_ROUTES.MAIN_PAGE.PUBLIC);
        return response.data;
    },
};
