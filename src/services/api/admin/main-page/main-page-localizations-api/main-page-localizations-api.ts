import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateMainPageLocalizationDto,
    MainPageLocalizationDto,
    MainPageTranslationStatusDto,
    UpdateMainPageLocalizationDto,
} from '@/types/admin/main-page';
import { AxiosInstance } from 'axios';

export const MainPageLocalizationsApi = {
    getByLanguageId: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
    ): Promise<MainPageLocalizationDto> => {
        const response = await client.get<MainPageLocalizationDto>(
            `${API_ROUTES.MAIN_PAGE_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
        );
        return response.data;
    },

    getStatuses: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
    ): Promise<MainPageTranslationStatusDto[]> => {
        const response = await client.get<MainPageTranslationStatusDto[]>(
            `${API_ROUTES.MAIN_PAGE_LOCALIZATIONS.BASE}/${entityId}/${languageId}/statuses`,
        );
        return response.data;
    },

    create: async (client: AxiosInstance, data: CreateMainPageLocalizationDto): Promise<MainPageLocalizationDto> => {
        const response = await client.post<MainPageLocalizationDto>(API_ROUTES.MAIN_PAGE_LOCALIZATIONS.BASE, data);
        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateMainPageLocalizationDto,
    ): Promise<MainPageLocalizationDto> => {
        const response = await client.put<MainPageLocalizationDto>(
            `${API_ROUTES.MAIN_PAGE_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );
        return response.data;
    },
};
