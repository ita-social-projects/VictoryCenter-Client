import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CreateFaqLocalizationDto, FaqLocalizationDto, UpdateFaqLocalizationDto } from '@/types/admin/faq';

export const FaqLocalizationsApi = {
    create: async (client: AxiosInstance, data: CreateFaqLocalizationDto): Promise<FaqLocalizationDto> => {
        const response = await client.post<FaqLocalizationDto>(API_ROUTES.FAQ_LOCALIZATIONS.BASE, data);

        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateFaqLocalizationDto,
    ): Promise<FaqLocalizationDto> => {
        const response = await client.put<FaqLocalizationDto>(
            `${API_ROUTES.FAQ_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
