import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { SectionType, WhoWeAreCategory, WhoWeAreSection } from '../../../../types/admin/who-we-are';

export const WhoWeAreApi = {
    getAll: async (client: AxiosInstance): Promise<WhoWeAreCategory[]> => {
        const response = await client.get(`${API_ROUTES.WHO_WE_ARE.BASE}`);
        return response.data as WhoWeAreCategory[];
    },
    getByType: async (client: AxiosInstance, type: SectionType): Promise<WhoWeAreSection> => {
        const response = await client.get(`${API_ROUTES.WHO_WE_ARE.BASE}/${type}`);
        return response.data as WhoWeAreSection;
    },
};
