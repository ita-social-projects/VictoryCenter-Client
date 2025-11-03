import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import {
    BankCurrency,
    CreateSupportOptionsRequest,
    SupportOptionsType,
    UpdateSupportOptionsRequest,
} from '../../../../../types/admin/donate';

export const SupportOptionsApi = {
    getAll: async (client: AxiosInstance, currency: BankCurrency): Promise<SupportOptionsType[]> => {
        const response = await client.get<SupportOptionsType[]>(API_ROUTES.DONATE.SUPPORT_OPTIONS, {
            params: { currency },
        });
        return response.data;
    },

    create: async (client: AxiosInstance, supportOption: CreateSupportOptionsRequest): Promise<SupportOptionsType> => {
        const response = await client.post<SupportOptionsType>(API_ROUTES.DONATE.SUPPORT_OPTIONS, supportOption);
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        id: number,
        supportOption: UpdateSupportOptionsRequest,
    ): Promise<SupportOptionsType> => {
        const response = await client.put<SupportOptionsType>(
            `${API_ROUTES.DONATE.SUPPORT_OPTIONS}/${id}`,
            supportOption,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.DONATE.SUPPORT_OPTIONS}/${id}`);
    },
};
