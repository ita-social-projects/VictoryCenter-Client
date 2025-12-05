import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import { CorrespondentBankDetailsType } from '../../../../../types/admin/donate';

export const CorrespondentBankDetailsApi = {
    create: async (
        client: AxiosInstance,
        bankDetails: Omit<CorrespondentBankDetailsType, 'id'>,
    ): Promise<CorrespondentBankDetailsType> => {
        const response = await client.post<CorrespondentBankDetailsType>(
            API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS,
            bankDetails,
        );
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        id: number,
        bankDetails: Partial<CorrespondentBankDetailsType>,
    ): Promise<CorrespondentBankDetailsType> => {
        const response = await client.put<CorrespondentBankDetailsType>(
            `${API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS}/${id}`,
            bankDetails,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS}/${id}`);
    },
};
