import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { AboutUsSection } from '@/types/public/about-us-page';
import { axiosInstance } from '@/services/api/axios';

export const AboutUsApi = {
    get: async (): Promise<AboutUsSection[]> => {
        const response = await axiosInstance.get(`${API_ROUTES.WHO_WE_ARE.PUBLIC}`);
        return response.data as AboutUsSection[];
    },
};
