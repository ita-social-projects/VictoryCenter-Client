import { Image, ImageValues } from '../../../../types/Image';
import { AxiosInstance, AxiosResponse } from 'axios';

export const ImagesApi = {
    post: async (client: AxiosInstance, image: ImageValues): Promise<Image> => {
        const response: AxiosResponse<Image> = await client.post<Image>(`/Image`, {
            base64: image.base64,
            mimeType: image.mimeType,
        });
        return response.data;
    },

    put: async (client: AxiosInstance, image: ImageValues, id: number): Promise<Image> => {
        const response: AxiosResponse<Image> = await client.put<Image>(`/Image/${id}`, {
            base64: image.base64,
            mimeType: image.mimeType,
        });
        return response.data;
    },

    delete: async (client: AxiosInstance, id: number) => {
        const response = await client.delete(`/Image/${id}`);
        return response.data;
    },

    get: async (client: AxiosInstance, id: number) => {
        const response: AxiosResponse<Image> = await client.get<Image>(`/Image/${id}`);
        return response.data;
    },
};
