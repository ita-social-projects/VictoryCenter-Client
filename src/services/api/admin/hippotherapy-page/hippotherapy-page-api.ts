import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import {
    HippotherapyGalleryCardContent,
    HippotherapyImageValue,
    HippotherapyPageContentDto,
    HippotherapyPageContentModel,
    HippotherapyScientificReference,
    HippotherapyScientificReferenceDto,
} from '@/types/admin/hippotherapy-page';

const resolveImageValue = async <T extends HippotherapyImageValue>(
    client: AxiosInstance,
    value: T,
    imagesToDelete: number[],
): Promise<T> => {
    if (!value.image && !value.imageId) {
        return value;
    }

    const { finalImageId, imageIdToDelete } = await ImageApi.getUpdateImageId(client, value.image, value.imageId);

    if (imageIdToDelete) {
        imagesToDelete.push(imageIdToDelete);
    }

    return { ...value, imageId: finalImageId };
};

const resolveGalleryCards = async (
    client: AxiosInstance,
    cards: HippotherapyGalleryCardContent[],
    imagesToDelete: number[],
): Promise<HippotherapyGalleryCardContent[]> =>
    Promise.all(cards.map((card) => resolveImageValue(client, card, imagesToDelete)));

const stripReferenceLocalIds = (
    scientificReferences: HippotherapyScientificReference[],
): HippotherapyScientificReferenceDto[] => scientificReferences.map(({ localId: _localId, ...rest }) => rest);

const attachReferenceLocalIds = (
    scientificReferences: HippotherapyScientificReferenceDto[],
): HippotherapyScientificReference[] =>
    scientificReferences.map((reference) => ({ ...reference, localId: crypto.randomUUID() }));

const toContentModel = (dto: HippotherapyPageContentDto): HippotherapyPageContentModel => ({
    ...dto,
    scientificReferencesSection: {
        ...dto.scientificReferencesSection,
        scientificReferences: attachReferenceLocalIds(dto.scientificReferencesSection.scientificReferences),
    },
});

export const HippotherapyPageApi = {
    get: async (client: AxiosInstance): Promise<HippotherapyPageContentModel> => {
        const response = await client.get<HippotherapyPageContentDto>(API_ROUTES.HIPPOTHERAPY_PAGE.BASE);
        return toContentModel(response.data);
    },

    update: async (
        client: AxiosInstance,
        content: HippotherapyPageContentModel,
    ): Promise<HippotherapyPageContentModel> => {
        const imagesToDelete: number[] = [];

        const [
            introSection,
            quoteSection,
            hippoventionCenterSection,
            advantagesCards,
            anotherQuoteSection,
            participantsCards,
            ethicsSection,
        ] = await Promise.all([
            resolveImageValue(client, content.introSection, imagesToDelete),
            resolveImageValue(client, content.quoteSection, imagesToDelete),
            resolveImageValue(client, content.hippoventionCenterSection, imagesToDelete),
            resolveGalleryCards(client, content.advantagesSection.cards, imagesToDelete),
            resolveImageValue(client, content.anotherQuoteSection, imagesToDelete),
            resolveGalleryCards(client, content.participantsSection.cards, imagesToDelete),
            resolveImageValue(client, content.ethicsSection, imagesToDelete),
        ]);

        const payload: HippotherapyPageContentDto = {
            ...content,
            introSection,
            quoteSection,
            hippoventionCenterSection,
            advantagesSection: { ...content.advantagesSection, cards: advantagesCards },
            anotherQuoteSection,
            participantsSection: { ...content.participantsSection, cards: participantsCards },
            ethicsSection,
            scientificReferencesSection: {
                ...content.scientificReferencesSection,
                scientificReferences: stripReferenceLocalIds(content.scientificReferencesSection.scientificReferences),
            },
        };

        const response = await client.put<HippotherapyPageContentDto>(API_ROUTES.HIPPOTHERAPY_PAGE.BASE, payload);

        await Promise.all(imagesToDelete.map((imageId) => ImageApi.delete(client, imageId)));

        return toContentModel(response.data);
    },
};
