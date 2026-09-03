import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    MainPage,
    MainPageDto,
    ReorderMetricsDto,
    UpdateMainPageDto,
    UpdateMetricVisibilityDto,
    UpdateSingleMetricDto,
    UpdateMetricResult,
} from '@/types/admin/main-page';
import type { LocalizationLanguage } from '@/types/common/language';
import { mapEntityWithLocalizations } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { AxiosInstance } from 'axios';

const toDomainMainPage = (dto: MainPageDto): MainPage => {
    return {
        ...mapEntityWithLocalizations(dto),
        mainAboutUs: dto.mainAboutUs ? mapEntityWithLocalizations(dto.mainAboutUs) : null,
        mainDonations: dto.mainDonations ? mapEntityWithLocalizations(dto.mainDonations) : null,
        mainPartners: dto.mainPartners ? mapEntityWithLocalizations(dto.mainPartners) : null,
        impactStatistics: dto.impactStatistics
            ? {
                  ...mapEntityWithLocalizations(dto.impactStatistics),
                  metrics: (dto.impactStatistics.metrics ?? []).map((m) => mapEntityWithLocalizations(m)),
              }
            : null,
    } as MainPage;
};

export const MainPageApi = {
    get: async (client: AxiosInstance): Promise<{ page: MainPage; languages?: LocalizationLanguage[] }> => {
        const [pageRes, languagesRes] = await Promise.all([
            client.get<MainPageDto>(API_ROUTES.MAIN_PAGE.BASE),
            client.get<LocalizationLanguage[]>(API_ROUTES.LOCALIZATION_LANGUAGE.BASE),
        ]);

        return {
            page: toDomainMainPage(pageRes.data),
            languages: languagesRes.data,
        };
    },

    publish: async (
        client: AxiosInstance,
        patch: UpdateMainPageDto,
        fallbackLanguages?: LocalizationLanguage[],
    ): Promise<{ page: MainPage; languages?: LocalizationLanguage[] }> => {
        const response = await client.put<MainPageDto>(API_ROUTES.MAIN_PAGE.BASE, patch);

        const languages = await client
            .get<LocalizationLanguage[]>(API_ROUTES.LOCALIZATION_LANGUAGE.BASE)
            .then((res) => res.data)
            .catch(() => fallbackLanguages);

        return {
            page: toDomainMainPage(response.data),
            languages,
        };
    },

    updateMetricVisibility: async (
        client: AxiosInstance,
        id: number,
        dto: UpdateMetricVisibilityDto,
    ): Promise<void> => {
        await client.put(`${API_ROUTES.MAIN_PAGE.BASE}/metrics/${id}/visibility`, dto);
    },

    updateMetric: async (
        client: AxiosInstance,
        id: number,
        dto: UpdateSingleMetricDto,
    ): Promise<UpdateMetricResult> => {
        const response = await client.put<UpdateMetricResult>(`${API_ROUTES.MAIN_PAGE.BASE}/metrics/${id}`, dto);
        return response.data;
    },

    reorderMetrics: async (client: AxiosInstance, dto: ReorderMetricsDto): Promise<void> => {
        await client.put(`${API_ROUTES.MAIN_PAGE.BASE}/metrics/reorder`, dto);
    },
};
