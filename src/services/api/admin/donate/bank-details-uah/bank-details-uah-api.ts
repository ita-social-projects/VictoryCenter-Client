import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import { UahBankDetailsType } from '../../../../../types/admin/donate';

export const BankDetailsUahApi = {
    getAll: async (client: AxiosInstance): Promise<UahBankDetailsType[]> => {
        const response = await client.get<UahBankDetailsType[]>(API_ROUTES.DONATE.BANK_DETAILS_UAH);
        return response.data;
    },

    create: async (client: AxiosInstance, bankDetails: Omit<UahBankDetailsType, 'id'>): Promise<UahBankDetailsType> => {
        const response = await client.post<UahBankDetailsType>(API_ROUTES.DONATE.BANK_DETAILS_UAH, bankDetails);
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        id: number,
        bankDetails: Partial<UahBankDetailsType>,
    ): Promise<UahBankDetailsType> => {
        const response = await client.put<UahBankDetailsType>(
            `${API_ROUTES.DONATE.BANK_DETAILS_UAH}/${id}`,
            bankDetails,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/${id}`);
    },
};
