import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PublicMainPageDto } from '@/types/public/main-page';
import { axiosInstance } from '@/services/api/axios';
import { resolveMetricKind } from '@/utils/functions/mappers/common/metrics/metric-kind-mappers';

export const PublicMainPageApi = {
    get: async (): Promise<PublicMainPageDto> => {
        const response = await axiosInstance.get<PublicMainPageDto>(API_ROUTES.MAIN_PAGE.PUBLIC);
        const statistics = response.data?.impactStatistics;
        if (!statistics?.metrics) return response.data;

        return {
            ...response.data,
            impactStatistics: {
                ...statistics,
                metrics: statistics.metrics.map((metric) => ({ ...metric, kind: resolveMetricKind(metric) })),
            },
        };
    },
};
