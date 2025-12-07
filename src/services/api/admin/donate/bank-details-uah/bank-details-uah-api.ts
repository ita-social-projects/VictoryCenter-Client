import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@const/common/api-routes/main-api';
import { UahBankDetailsDto, CreateUahBankDetails, UpdateUahBankDetails } from '@app-types/admin/donate';

export const BankDetailsUahApi = {
    getAll: async (client: AxiosInstance): Promise<UahBankDetailsDto[]> => {
        const response = await client.get<UahBankDetailsDto[]>(API_ROUTES.DONATE.BANK_DETAILS_UAH);
        return response.data;
    },

    create: async (client: AxiosInstance, bankDetails: CreateUahBankDetails): Promise<UahBankDetailsDto> => {
        const response = await client.post<UahBankDetailsDto>(API_ROUTES.DONATE.BANK_DETAILS_UAH, bankDetails);
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        id: number,
        bankDetails: UpdateUahBankDetails,
    ): Promise<UahBankDetailsDto> => {
        const response = await client.put<UahBankDetailsDto>(
            `${API_ROUTES.DONATE.BANK_DETAILS_UAH}/${id}`,
            bankDetails,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.DONATE.BANK_DETAILS_UAH}/${id}`);
    },
};
