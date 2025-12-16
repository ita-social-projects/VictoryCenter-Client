import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ImageApi } from '../image/image-api';
import {
    PartnerBannerUpdateRequest,
    PartnersSectionCreateRequest,
    PartnerSection,
    PartnerBanner,
    PartnersPageData,
    PartnersSectionUpdateRequest,
    CreatePartnerDto,
    CreatePartnersSectionDto,
    UpdatePartnerDto,
    UpdatePartnersSectionDto,
    UpdatePartnerBannerDto,
    PartnerBannerDto,
    PartnersSectionDto,
    PartnersPageDataDto,
} from '@/types/admin/partners';
import { RequestOptions } from '@/types/common/api';
import {
    mapBannerDtoToBanner,
    mapPartnerPageDataDtoToPageData,
    mapSectionDtoToSection,
} from '@/utils/functions/mappers/admin/partner-mappers/partner-mappers';

export const PartnersApi = {
    getBanner: async (client: AxiosInstance): Promise<PartnerBanner> => {
        const response = await client.get<PartnerBannerDto>(API_ROUTES.PARTNERS.BANNER);
        return mapBannerDtoToBanner(response.data);
    },

    updateBanner: async (client: AxiosInstance, banner: PartnerBannerUpdateRequest): Promise<PartnerBanner> => {
        const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(client, banner.image, banner.imageId);

        const updateBannerDto: UpdatePartnerBannerDto = {
            title: banner.title,
            description: banner.description,
            imageId: finalImageId ?? 0,
        };

        const response = await client.put<PartnerBannerDto>(API_ROUTES.PARTNERS.BANNER, updateBannerDto);

        if (imageIdToDelete && imageIdToDelete !== finalImageId) {
            await ImageApi.delete(client, imageIdToDelete);
        }

        return mapBannerDtoToBanner(response.data);
    },

    getPageData: async (client: AxiosInstance): Promise<PartnersPageData> => {
        const response = await client.get<PartnersPageDataDto>(API_ROUTES.PARTNERS.PAGE);
        return mapPartnerPageDataDtoToPageData(response.data);
    },

    getSections: async (client: AxiosInstance, options: RequestOptions): Promise<PartnerSection[]> => {
        const response = await client.get<PartnersSectionDto[]>(API_ROUTES.PARTNERS.SECTIONS, {
            signal: options.cancellationSignal,
        });
        return response.data.map(mapSectionDtoToSection);
    },

    deleteSection: async (client: AxiosInstance, id: number): Promise<void> => {
        await client.delete(`${API_ROUTES.PARTNERS.SECTIONS}/${id}`);
    },

    postSection: async (client: AxiosInstance, section: PartnersSectionCreateRequest): Promise<PartnerSection> => {
        const partnersPayload = await Promise.all(
            section.partners.map(async (partner) => {
                const { finalImageId } = await ImageApi.getUpdateImageId(client, partner.image, null);
                const partnerDto: CreatePartnerDto = {
                    description: partner.description,
                    imageId: finalImageId ?? 0,
                };
                return partnerDto;
            }),
        );

        const createDto: CreatePartnersSectionDto = {
            title: section.title,
            description: section.description,
            partners: partnersPayload,
        };

        const response = await client.post<PartnersSectionDto>(API_ROUTES.PARTNERS.SECTIONS, createDto);

        return mapSectionDtoToSection(response.data);
    },

    updateSection: async (
        client: AxiosInstance,
        sectionId: number,
        section: PartnersSectionUpdateRequest,
    ): Promise<PartnerSection> => {
        const imagesToDelete: number[] = [];
        const partnersToCreate: CreatePartnerDto[] = [];
        const partnersToUpdate: UpdatePartnerDto[] = [];

        await Promise.all(
            section.partnersToUpdate.map(async (partner) => {
                const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(
                    client,
                    partner.image || null,
                    partner.imageId || null,
                );

                if (imageIdToDelete) {
                    imagesToDelete.push(imageIdToDelete);
                }

                const partnerId = partner.id;

                if (partnerId === null) {
                    partnersToCreate.push({
                        description: partner.description,
                        imageId: finalImageId ?? 0,
                    });
                } else {
                    partnersToUpdate.push({
                        id: partnerId,
                        description: partner.description,
                        imageId: finalImageId ?? 0,
                    });
                }
            }),
        );

        const updateDto: UpdatePartnersSectionDto = {
            title: section.title,
            description: section.description,
            partnersToCreate: partnersToCreate,
            partnersToUpdate: partnersToUpdate,
            partnerIdsToDelete: section.partnerIdsToDelete,
        };

        const response = await client.put<PartnersSectionDto>(
            `${API_ROUTES.PARTNERS.SECTIONS}/${sectionId}`,
            updateDto,
        );
        await Promise.allSettled(imagesToDelete.map((id) => ImageApi.delete(client, id)));

        return mapSectionDtoToSection(response.data);
    },
};
