import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    ReportsMediaSettings,
    ReportsMediaSettingsDto,
    ReportsMediaSettingsUpdateRequest,
    UpdateReportsMediaSettingsDto,
} from '@/types/admin/reports';
import { mapReportsMediaSettingsDtoToMediaSettings } from '@/utils/functions/mappers/admin/reports-mapper/reports-mapper';
import { AxiosInstance } from 'axios';
import { ImageApi } from '../image/image-api';

export const ReportsApi = {
    getMediaSettings: async (client: AxiosInstance): Promise<ReportsMediaSettings> => {
        const response = await client.get<ReportsMediaSettingsDto>(API_ROUTES.REPORTS.MEDIA_SETTINGS);
        return mapReportsMediaSettingsDtoToMediaSettings(response.data);
    },

    updateMediaSettings: async (
        client: AxiosInstance,
        request: ReportsMediaSettingsUpdateRequest,
    ): Promise<ReportsMediaSettings> => {
        const [
            { finalImageId: finalImageIdCollectedFunds, imageIdToDelete: imageIdToDeleteCollectedFunds },
            { finalImageId: finalImageIdChangedLives, imageIdToDelete: imageIdToDeleteChangedLives },
        ] = await Promise.all([
            ImageApi.getUpdateImageId(client, request.collectedFunds.image, request.collectedFunds.imageId),
            ImageApi.getUpdateImageId(client, request.changedLives.image, request.changedLives.imageId),
        ]);

        const dto: UpdateReportsMediaSettingsDto = {
            collectedFundsBlock: {
                title: request.collectedFunds.title,
                titleEn: request.collectedFunds.titleEn,
                imageId: finalImageIdCollectedFunds ?? null,
            },
            changedLivesBlock: {
                title: request.changedLives.title,
                titleEn: request.changedLives.titleEn,
                changedLives: request.changedLives.changedLives,
                imageId: finalImageIdChangedLives ?? null,
            },
        };

        const response = await client.put<ReportsMediaSettingsDto>(API_ROUTES.REPORTS.MEDIA_SETTINGS, dto);

        await Promise.allSettled([
            imageIdToDeleteCollectedFunds && ImageApi.delete(client, imageIdToDeleteCollectedFunds),
            imageIdToDeleteChangedLives && ImageApi.delete(client, imageIdToDeleteChangedLives),
        ]);

        return mapReportsMediaSettingsDtoToMediaSettings(response.data);
    },
};
