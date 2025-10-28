import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { ImageApi } from '../image/image-api';
import {
    PartnerBannerDto,
    PartnerBannerUpdateRequest,
    PartnersSectionDto,
    PartnersSectionCreateRequest,
    PartnerSection,
    Partner,
} from '../../../../types/admin/partners';

export const PartnersApi = {
    getBanner: async (client: AxiosInstance): Promise<PartnerBannerDto> => {
        const response = await client.get<PartnerBannerDto>(API_ROUTES.PARTNERS.BANNER);
        return response.data;
    },

    updateBanner: async (client: AxiosInstance, banner: PartnerBannerUpdateRequest): Promise<PartnerBannerDto> => {
        const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(client, banner.image, banner.imageId);

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
        await client.delete(`${API_ROUTES.PARTNERS.BASE}/${id}`);
    },

    getAll: async (client: AxiosInstance): Promise<{ banner: PartnerBannerDto; section: PartnersSectionDto[] }> => {
        const response = await client.get<{
            banner: PartnerBannerDto;
            section: PartnersSectionDto[];
        }>(API_ROUTES.PARTNERS.BASE);
        return response.data;
    },

    postSection: async (client: AxiosInstance, section: PartnersSectionCreateRequest): Promise<PartnerSection> => {
        await Promise.all(
            section.partners.map(async (partner) => {
                if (partner.image && 'base64' in partner.image) {
                    const imageId = await ImageApi.post(client, partner.image);
                }
            }),
        );

        const createdPartners: Partner[] = [];

        for (const partner of section.partners) {
            const response = await client.post<Partner>(`${API_ROUTES.PARTNERS.BASE}/partner`, {
                description: partner.description,
                imageId: partner.imageId,
            });
            createdPartners.push(response.data);
        }

        const sectionResponse = await client.post<PartnerSection>(API_ROUTES.PARTNERS.BASE, {
            title: section.title,
            description: section.description,
            partners: createdPartners.map((p) => p.id),
        });

        return sectionResponse.data as PartnerSection;
    },

    updatePartnerSection: async (client: AxiosInstance, section: PartnerSection): Promise<PartnerSection> => {
        const imagesToDelete: number[] = [];

        await Promise.all(
            section.partners.map(async (partner) => {
                if (partner.image || partner.imageId) {
                    const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(
                        client,
                        partner.image,
                        partner.imageId,
                    );

                    partner.imageId = finalImageId;

                    if (imageIdToDelete) {
                        imagesToDelete.push(imageIdToDelete);
                    }
                }
            }),
        );

        const response = await client.put<PartnerSection>(`${API_ROUTES.PARTNERS.BASE}/${section.id}`, section);

        await Promise.all(imagesToDelete.map((imageId) => ImageApi.delete(client, imageId)));

        return response.data;
    },
};
