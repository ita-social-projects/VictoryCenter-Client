import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { HistorySectionDto } from '@/types/common/history-sections';
import { HistorySection, HistorySectionContent, HistorySectionContentLocalization } from '@/types/public/history-page';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { RequestOptions } from '@/types/common/api';

const mapHistorySection = (dto: HistorySectionDto): HistorySection => ({
    ...dto,
    contents: dto.contents.map(
        (contentDto): HistorySectionContent => ({
            ...contentDto,
            localizations: contentDto.localizations?.map((loc) =>
                mapLocalizationDtoToModel<typeof loc, HistorySectionContentLocalization>(loc),
            ),
        }),
    ),
});

export const PublicHistoryApi = {
    getSections: async (options: RequestOptions): Promise<HistorySection[]> => {
        const response = await axiosInstance.get<HistorySectionDto[]>(API_ROUTES.HISTORY.PUBLIC, {
            signal: options.cancellationSignal,
        });
        return response.data.map(mapHistorySection);
    },
};
