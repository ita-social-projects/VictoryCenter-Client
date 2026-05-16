import {
    CreateUpdateHistorySectionDto,
    CreateHistorySectionContentDto,
    HistorySectionDto,
} from '@/types/common/history-sections';
import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { Image, ImageValues } from '@/types/common/image';

interface UploadSectionImagesResult {
    newlyCreatedImageIds: number[];
    imagesToDeleteAfterSync: number[];
}

const uploadSectionContentsImages = async (
    client: AxiosInstance,
    sections: CreateUpdateHistorySectionDto[],
): Promise<UploadSectionImagesResult> => {
    const newlyCreatedImageIds: number[] = [];
    const imagesToDeleteAfterSync: number[] = [];

    try {
        await Promise.all(
            sections.map(async (section) => {
                await Promise.all(
                    section.contents.map(async (content: CreateHistorySectionContentDto) => {
                        if (content.image || content.imageId) {
                            const existingImageId =
                                content.imageId ??
                                (content.image && 'id' in content.image ? (content.image as Image).id : null);

                            const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(
                                client,
                                (content.image as Image | ImageValues | null) ?? null,
                                existingImageId ?? null,
                            );

                            if (finalImageId && finalImageId !== existingImageId) {
                                newlyCreatedImageIds.push(finalImageId);
                            }

                            content.imageId = finalImageId;
                            content.image = null;

                            if (imageIdToDelete) {
                                imagesToDeleteAfterSync.push(imageIdToDelete);
                            }
                        }
                    }),
                );
            }),
        );
    } catch (error) {
        await Promise.allSettled(newlyCreatedImageIds.map((id) => ImageApi.delete(client, id)));
        throw error;
    }

    return { newlyCreatedImageIds, imagesToDeleteAfterSync };
};

export const HistoryApi = {
    fetchSections: async (client: AxiosInstance): Promise<HistorySectionDto[]> => {
        const response = await client.get<HistorySectionDto[]>(API_ROUTES.HISTORY.BASE);
        return response.data;
    },

    syncSections: async (
        client: AxiosInstance,
        sections: CreateUpdateHistorySectionDto[],
    ): Promise<HistorySectionDto[]> => {
        const { newlyCreatedImageIds, imagesToDeleteAfterSync } = await uploadSectionContentsImages(client, sections);

        try {
            const response = await client.put<HistorySectionDto[]>(API_ROUTES.HISTORY.BASE, sections);
            await Promise.allSettled(imagesToDeleteAfterSync.map((id) => ImageApi.delete(client, id)));
            return response.data;
        } catch (error) {
            await Promise.allSettled(newlyCreatedImageIds.map((id) => ImageApi.delete(client, id)));
            throw error;
        }
    },
};
