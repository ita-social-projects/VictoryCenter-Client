import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import { ForeignBankDetailsType, BankCurrency } from '../../../../../types/admin/donate';

export const ForeignBankDetailsApi = {
    getAll: async (client: AxiosInstance, currency: BankCurrency): Promise<ForeignBankDetailsType[]> => {
        const response = await client.get<ForeignBankDetailsType[]>(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, {
            params: { currency },
        });
        return response.data;
    },

    create: async (
        client: AxiosInstance,
        bankDetails: Omit<ForeignBankDetailsType, 'id'>,
    ): Promise<ForeignBankDetailsType> => {
        const response = await client.post<ForeignBankDetailsType>(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, bankDetails);
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        id: number,
        bankDetails: Omit<ForeignBankDetailsType, 'id'>,
    ): Promise<ForeignBankDetailsType> => {
        const response = await client.put<ForeignBankDetailsType>(
            `${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/${id}`,
            bankDetails,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/${id}`);
    },
};
