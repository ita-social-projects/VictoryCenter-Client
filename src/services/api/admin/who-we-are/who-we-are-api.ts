import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { Content, SectionType, WhoWeAreCategory, WhoWeAreSection } from '../../../../types/admin/who-we-are';
import { ImageApi } from '../image/image-api';

export const WhoWeAreApi = {
    getAll: async (client: AxiosInstance): Promise<WhoWeAreCategory[]> => {
        const response = await client.get(`${API_ROUTES.WHO_WE_ARE.BASE}`);
        return response.data as WhoWeAreCategory[];
    },
    getByType: async (client: AxiosInstance, type: SectionType): Promise<WhoWeAreSection> => {
        const response = await client.get(`${API_ROUTES.WHO_WE_ARE.BASE}/${type}`);
        return response.data as WhoWeAreSection;
    },
    UpdateContent: async (
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

        const response = await client.put<WhoWeAreSection>(`${API_ROUTES.WHO_WE_ARE.BASE}/${sectionType}`, contents);

        await Promise.all(imagesToDelete.map((imageId) => ImageApi.delete(client, imageId)));

        return response.data;
    },
};
