import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@const/common/api-routes/main-api';
import {
    BankCurrency,
    CreateSupportOptionsDto,
    SupportOptionsDto,
    UpdateSupportOptionsDto,
} from '@app-types/admin/donate';

export const SupportOptionsApi = {
    getAll: async (client: AxiosInstance, currency: BankCurrency): Promise<SupportOptionsDto[]> => {
        const response = await client.get<SupportOptionsDto[]>(API_ROUTES.DONATE.SUPPORT_OPTIONS, {
            params: { currency },
        });
        return response.data;
    },

    create: async (client: AxiosInstance, supportOption: CreateSupportOptionsDto): Promise<SupportOptionsDto> => {
        const response = await client.post<SupportOptionsDto>(API_ROUTES.DONATE.SUPPORT_OPTIONS, supportOption);
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        id: number,
        supportOption: UpdateSupportOptionsDto,
    ): Promise<SupportOptionsDto> => {
        const response = await client.put<SupportOptionsDto>(
            `${API_ROUTES.DONATE.SUPPORT_OPTIONS}/${id}`,
            supportOption,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.DONATE.SUPPORT_OPTIONS}/${id}`);
    },
};
