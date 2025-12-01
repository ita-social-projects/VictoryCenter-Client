import { PartnerPage } from '../../../../types/public/partners-page';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { axiosInstance } from '../../axios';

export const PartnersApi = {
    getPage: async (): Promise<PartnerPage> => {
        const response = await axiosInstance.get<PartnerPage>(`${API_ROUTES.PARTNERS.PAGE}`);
        return response.data;
    },
};
