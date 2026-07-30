import { AxiosInstance } from 'axios';
import axios from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreatePartnerSectionLocalizationDto,
    PartnerSectionLocalizationDto,
    UpdatePartnerSectionLocalizationDto,
} from '@/types/admin/partners';

export const PartnerSectionLocalizationApi = {
    get: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
    ): Promise<PartnerSectionLocalizationDto | null> => {
        try {
            const response = await client.get<PartnerSectionLocalizationDto>(
                `${API_ROUTES.PARTNER_SECTION_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    create: async (
        client: AxiosInstance,
        data: CreatePartnerSectionLocalizationDto,
    ): Promise<PartnerSectionLocalizationDto> => {
        const response = await client.post<PartnerSectionLocalizationDto>(
            API_ROUTES.PARTNER_SECTION_LOCALIZATIONS.BASE,
            data,
        );
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdatePartnerSectionLocalizationDto,
    ): Promise<PartnerSectionLocalizationDto> => {
        const response = await client.put<PartnerSectionLocalizationDto>(
            `${API_ROUTES.PARTNER_SECTION_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
