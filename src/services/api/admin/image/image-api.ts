import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { Image, ImageValues } from '@/types/common/image';
import { AxiosInstance, AxiosResponse } from 'axios';

export const ImageApi = {
    post: async (client: AxiosInstance, image: ImageValues): Promise<Image> => {
        const response: AxiosResponse<Image> = await client.post<Image>(API_ROUTES.IMAGE.BASE, {
            base64: image.base64,
            mimeType: image.mimeType,
        });
        return response.data;
    },

    put: async (client: AxiosInstance, image: ImageValues, id: number): Promise<Image> => {
        const response: AxiosResponse<Image> = await client.put<Image>(`${API_ROUTES.IMAGE.BASE}/${id}`, {
            base64: image.base64,
            mimeType: image.mimeType,
        });
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number) => {
        const response = await client.delete(`${API_ROUTES.IMAGE.BASE}/${id}`);
        return response.data;
    },

    get: async (client: AxiosInstance, id: number) => {
        const response: AxiosResponse<Image> = await client.get<Image>(`${API_ROUTES.IMAGE.BASE}/${id}`);
        return response.data;
    },

    getUpdateImageId: async (
        client: AxiosInstance,
        image: Image | ImageValues | null,
        imageId: number | null,
    ): Promise<{ finalImageId: number | null; imageIdToDelete: number | null }> => {
        let imageIdToDelete: number | null = null;
        let finalImageId = imageId;

        if (image && 'base64' in image) {
            if (imageId) {
                const imageResult = await ImageApi.put(client, image, imageId);
                finalImageId = imageResult.id;
            } else {
                const imageResult = await ImageApi.post(client, image);
                finalImageId = imageResult.id;
            }
        } else if (imageId && !image) {
            imageIdToDelete = imageId;
            finalImageId = null;
        }
        return { finalImageId, imageIdToDelete };
    },
};
