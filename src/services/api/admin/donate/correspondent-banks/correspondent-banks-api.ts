import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import {
    CorrespondentBankDetailsDto,
    CreateCorrespondentBankDetails,
    UpdateCorrespondentBankDetails,
} from '../../../../../types/admin/donate';

export const CorrespondentBankDetailsApi = {
    create: async (
        client: AxiosInstance,
        bankDetails: CreateCorrespondentBankDetails,
    ): Promise<CorrespondentBankDetailsDto> => {
        const response = await client.post<CorrespondentBankDetailsDto>(
            API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS,
            bankDetails,
        );
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        id: number,
        bankDetails: UpdateCorrespondentBankDetails,
    ): Promise<CorrespondentBankDetailsDto> => {
        const response = await client.put<CorrespondentBankDetailsDto>(
            `${API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS}/${id}`,
            bankDetails,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.DONATE.CORRESPONDENT_BANK_DETAILS}/${id}`);
    },
};
