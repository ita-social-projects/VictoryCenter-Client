import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { ImageApi } from '../image/image-api';
import {
    PartnerBannerDto,
    PartnerBannerCreateUpdateRequest,
} from '../../../../types/admin/partners';

export const PartnersApi = {
    getBanner: async (client: AxiosInstance): Promise<PartnerBannerDto> => {
        const response = await client.get<PartnerBannerDto>(API_ROUTES.PARTNERS.BANNER);
        return response.data;
    },

    updateBanner: async (
        client: AxiosInstance,
        banner: PartnerBannerCreateUpdateRequest,
    ): Promise<PartnerBannerDto> => {
        const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(
            client,
            banner.image,
            banner.imageId,
        );

        const response = await client.put<PartnerBannerDto>(API_ROUTES.PARTNERS.BANNER, {
            title: banner.title,
            description: banner.description,
            imageId: finalImageId,
        });

        if (imageIdToDelete && imageIdToDelete !== finalImageId) {
            await ImageApi.delete(client, imageIdToDelete);
        }

        return response.data;
    },

    deleteSection: async (client: AxiosInstance, id: number) => {
        await client.delete(`${API_ROUTES.PARTNERS.BASE}/${id}`)
    },
};