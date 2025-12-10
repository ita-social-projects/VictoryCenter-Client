import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import {
    ForeignBankDetailsDto,
    BankCurrency,
    CreateForeignBankDetails,
    UpdateForeignBankDetails,
} from '../../../../../types/admin/donate';

export const ForeignBankDetailsApi = {
    getAll: async (client: AxiosInstance, currency: BankCurrency): Promise<ForeignBankDetailsDto[]> => {
        const response = await client.get<ForeignBankDetailsDto[]>(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, {
            params: { currency },
        });
        return response.data;
    },

    create: async (client: AxiosInstance, bankDetails: CreateForeignBankDetails): Promise<ForeignBankDetailsDto> => {
        const response = await client.post<ForeignBankDetailsDto>(API_ROUTES.DONATE.BANK_DETAILS_FOREIGN, bankDetails);
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        id: number,
        bankDetails: UpdateForeignBankDetails,
    ): Promise<ForeignBankDetailsDto> => {
        const response = await client.put<ForeignBankDetailsDto>(
            `${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/${id}`,
            bankDetails,
        );
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.DONATE.BANK_DETAILS_FOREIGN}/${id}`);
    },
};
