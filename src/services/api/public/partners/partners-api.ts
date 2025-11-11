import { AxiosInstance } from 'axios';
import { PartnerPage } from '../../../../types/public/partners-page';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';

export const PartnersApi = {
    getPage: async (client: AxiosInstance): Promise<PartnerPage> => {
        const response = await client.get<PartnerPage>(`${API_ROUTES.PARTNERS.PAGE}`);
        return response.data;
    },
};
