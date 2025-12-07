import { API_ROUTES } from '@const/common/api-routes/main-api';
import { AboutUsSection } from '@app-types/public/about-us-page';
import { axiosInstance } from '@api/axios';

export const AboutUsApi = {
    get: async (): Promise<AboutUsSection[]> => {
        const response = await axiosInstance.get(`${API_ROUTES.WHO_WE_ARE.PUBLIC}`);
        return response.data as AboutUsSection[];
    },
};
