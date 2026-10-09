import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateHippotherapyPageLocalizationDto,
    HippotherapyPageLocalizationDto,
    HippotherapyPageTranslationStatusDto,
    UpdateHippotherapyPageLocalizationDto,
} from '@/types/admin/hippotherapy-page';

const BASE = API_ROUTES.HIPPOTHERAPY_PAGE_LOCALIZATIONS.BASE;

export const HippotherapyPageLocalizationsApi = {
    getByLanguageId: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
    ): Promise<HippotherapyPageLocalizationDto> => {
        const response = await client.get<HippotherapyPageLocalizationDto>(`${BASE}/${entityId}/${languageId}`);
        return response.data;
    },

    getStatuses: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
    ): Promise<HippotherapyPageTranslationStatusDto[]> => {
        const response = await client.get<HippotherapyPageTranslationStatusDto[]>(`${BASE}/${entityId}/${languageId}/statuses`);
        return response.data;
    },

    create: async (
        client: AxiosInstance,
        data: CreateHippotherapyPageLocalizationDto,
    ): Promise<HippotherapyPageLocalizationDto> => {
        const response = await client.post<HippotherapyPageLocalizationDto>(BASE, data);
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateHippotherapyPageLocalizationDto,
    ): Promise<HippotherapyPageLocalizationDto> => {
        const response = await client.put<HippotherapyPageLocalizationDto>(`${BASE}/${entityId}/${languageId}`, data);
        return response.data;
    },
};