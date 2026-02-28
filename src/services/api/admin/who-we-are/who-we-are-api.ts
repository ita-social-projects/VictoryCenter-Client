import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { Content, WhoWeAreCategory, WhoWeAreSection, WhoWeAreSectionDto } from '@/types/admin/who-we-are';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { SectionType } from '@/types/common/about-us';
import { mapEntityWithLocalizations } from '@/utils/functions/mappers/common/localization/localization-mappers';

export const WhoWeAreApi = {
    getPreviews: async (client: AxiosInstance): Promise<WhoWeAreCategory[]> => {
        const response = await client.get(`${API_ROUTES.WHO_WE_ARE.PREVIEWS}`);
        return response.data as WhoWeAreCategory[];
    },
    getByType: async (client: AxiosInstance, type: SectionType): Promise<WhoWeAreSection> => {
        const response = await client.get<WhoWeAreSectionDto>(`${API_ROUTES.WHO_WE_ARE.BASE}/${type}`);
        const sectionDto = response.data;

        const section: WhoWeAreSection = {
            ...sectionDto,
            contents: sectionDto.contents.map((contentDto) => mapEntityWithLocalizations(contentDto)),
        };

        return section;
    },
    updateContent: async (
        client: AxiosInstance,
        contents: Content[],
        sectionType: SectionType,
    ): Promise<WhoWeAreSection> => {
        const imagesToDelete: number[] = [];

        await Promise.all(
            contents.map(async (content) => {
                if (content.image || content.imageId) {
                    const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(
                        client,
                        content.image,
                        content.imageId,
                    );

                    content.imageId = finalImageId;

                    if (imageIdToDelete) {
                        imagesToDelete.push(imageIdToDelete);
                    }
                }
            }),
        );

        const response = await client.put<WhoWeAreSectionDto>(`${API_ROUTES.WHO_WE_ARE.BASE}/${sectionType}`, contents);

        await Promise.all(imagesToDelete.map((imageId) => ImageApi.delete(client, imageId)));

        const sectionDto = response.data;

        const section: WhoWeAreSection = {
            ...sectionDto,
            contents: sectionDto.contents.map((contentDto) => mapEntityWithLocalizations(contentDto)),
        };

        return section;
    },
};
