import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreatePartnerBannerLocalizationDto,
    PartnerBannerLocalizationDto,
    UpdatePartnerBannerLocalizationDto,
} from '@/types/admin/partners';
import { AxiosInstance } from 'axios';

export const PartnerBannerLocalizationApi = {
    create: async (
        client: AxiosInstance,
        data: CreatePartnerBannerLocalizationDto,
    ): Promise<PartnerBannerLocalizationDto> => {
        const response = await client.post<PartnerBannerLocalizationDto>(
            API_ROUTES.PARTNERS_PAGE_BANNER_LOCALIZATIONS.BASE,
            data,
        );
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdatePartnerBannerLocalizationDto,
    ): Promise<PartnerBannerLocalizationDto> => {
        const response = await client.put<PartnerBannerLocalizationDto>(
            `${API_ROUTES.PARTNERS_PAGE_BANNER_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
