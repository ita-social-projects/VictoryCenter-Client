import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { AboutUsSection } from '../../../../types/public/about-us-page';

export const AboutUsApi = {
    get: async (client: AxiosInstance): Promise<AboutUsSection[]> => {
        const response = await client.get(`${API_ROUTES.WHO_WE_ARE.PUBLIC}`);
        return response.data as AboutUsSection[];
    },
};
