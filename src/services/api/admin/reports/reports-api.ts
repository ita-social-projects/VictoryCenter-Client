import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { mapReportsMediaSettingsDtoToMediaSettings } from '@/utils/functions/mappers/admin/reports-mapper/reports-mapper';
import { ReportsMediaSettings, ReportsMediaSettingsDto, ReportsMediaSettingsUpdateRequest, UpdateReportsMediaSettingsDto } from '@/types/admin/reports';
import { ImageApi } from '../image/image-api';

export const ReportsApi = {
    getMediaSettings: async (client: AxiosInstance): Promise<ReportsMediaSettings> => {
        const response = await client.get<ReportsMediaSettingsDto>(API_ROUTES.REPORTS.MEDIA_SETTINGS);
        return mapReportsMediaSettingsDtoToMediaSettings(response.data);
    },

    updateMediaSettings: async (client: AxiosInstance, mediaSettings: ReportsMediaSettingsUpdateRequest): Promise<ReportsMediaSettings> => {
        const { finalImageId: finalImageIdCollectedFunds, imageIdToDelete: imageIdToDeleteCollectedFunds } = await ImageApi.getUpdateImageId(client, mediaSettings.collectedFunds.image, mediaSettings.collectedFunds.imageId);
        const { finalImageId: finalImageIdChangedLives, imageIdToDelete: imageIdToDeleteChangedLives } = await ImageApi.getUpdateImageId(client, mediaSettings.changedLives.image, mediaSettings.changedLives.imageId);

        const updateMediaSettingsDto: UpdateReportsMediaSettingsDto = {
            collectedFunds: {
                title: mediaSettings.collectedFunds.title,
                collectedFunds: mediaSettings.collectedFunds.collectedFunds,
                imageId: finalImageIdCollectedFunds ?? null,
            },
            changedLives: {
                title: mediaSettings.changedLives.title,
                changedLives: mediaSettings.changedLives.changedLives,
                imageId: finalImageIdChangedLives ?? null,
            },
        };

        const response = await client.put<ReportsMediaSettingsDto>(API_ROUTES.REPORTS.MEDIA_SETTINGS, updateMediaSettingsDto);

        if (imageIdToDeleteCollectedFunds && imageIdToDeleteCollectedFunds !== finalImageIdCollectedFunds) {
            await ImageApi.delete(client, imageIdToDeleteCollectedFunds);
        }
        if (imageIdToDeleteChangedLives && imageIdToDeleteChangedLives !== finalImageIdChangedLives) {
            await ImageApi.delete(client, imageIdToDeleteChangedLives);
        }
        return mapReportsMediaSettingsDtoToMediaSettings(response.data);
    },
};
