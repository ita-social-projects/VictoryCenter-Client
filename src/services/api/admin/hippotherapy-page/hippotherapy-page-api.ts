import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import {
    HippotherapyImageValue,
    HippotherapyPageContentDto,
    HippotherapyPageContentModel,
    HippotherapyPageTranslationStatusDto,
    HippotherapyPageTranslationStatusInfo,
    HippotherapyScientificReference,
    HippotherapyScientificReferenceDto,
    UpdateHippotherapyPageContentDto,
} from '@/types/admin/hippotherapy-page';
import { mapEntityWithLocalizations } from '@/utils/functions/mappers/common/localization/localization-mappers';

const resolveImageValue = async <T extends HippotherapyImageValue>(
    client: AxiosInstance,
    value: T,
    uploadedImageIds: number[],
): Promise<T> => {
    if (!value.image && !value.imageId) {
        return value;
    }

    const { finalImageId } = await ImageApi.getUpdateImageId(client, value.image, value.imageId);

    if (finalImageId && !value.imageId) {
        uploadedImageIds.push(finalImageId);
    }

    return { ...value, imageId: finalImageId };
};

const stripReferenceLocalIds = (
    scientificReferences: HippotherapyScientificReference[],
): HippotherapyScientificReferenceDto[] => scientificReferences.map(({ localId: _localId, ...rest }) => rest);

const attachReferenceLocalIds = (
    scientificReferences: HippotherapyScientificReferenceDto[],
): HippotherapyScientificReference[] =>
    scientificReferences.map((reference) => ({ ...reference, localId: crypto.randomUUID() }));

const withImageId = <T extends HippotherapyImageValue>(value: T): T => ({
    ...value,
    imageId: value.image && 'id' in value.image ? value.image.id : (value.imageId ?? null),
});

const mapTranslationStatuses = (
    statuses: HippotherapyPageTranslationStatusDto[] | undefined,
): HippotherapyPageTranslationStatusInfo[] =>
    (statuses ?? []).flatMap(({ block, languageId, translationStatus }) =>
        translationStatus === null ? [] : [{ block, languageId, translationStatus }],
    );

const toContentModel = (dto: HippotherapyPageContentDto): HippotherapyPageContentModel => ({
    ...dto,
    ...mapEntityWithLocalizations(dto),
    translationStatuses: mapTranslationStatuses(dto.translationStatuses),
    introSection: withImageId(dto.introSection),
    quoteSection: withImageId(dto.quoteSection),
    hippoventionCenterSection: withImageId(dto.hippoventionCenterSection),
    advantagesSection: {
        ...dto.advantagesSection,
        cards: dto.advantagesSection.cards.map((card) => withImageId(card)),
    },
    anotherQuoteSection: withImageId(dto.anotherQuoteSection),
    participantsSection: {
        ...dto.participantsSection,
        cards: dto.participantsSection.cards.map((card) => withImageId(card)),
    },
    ethicsSection: withImageId(dto.ethicsSection),
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
        const uploadedImageIds: number[] = [];
        const imageRequests: Promise<unknown>[] = [];

        const resolveImage = <T extends HippotherapyImageValue>(value: T): Promise<T> => {
            const request = resolveImageValue(client, value, uploadedImageIds);
            imageRequests.push(request);
            return request;
        };

        try {
            const [
                introSection,
                quoteSection,
                hippoventionCenterSection,
                advantagesCards,
                anotherQuoteSection,
                participantsCards,
                ethicsSection,
            ] = await Promise.all([
                resolveImage(content.introSection),
                resolveImage(content.quoteSection),
                resolveImage(content.hippoventionCenterSection),
                Promise.all(content.advantagesSection.cards.map((card) => resolveImage(card))),
                resolveImage(content.anotherQuoteSection),
                Promise.all(content.participantsSection.cards.map((card) => resolveImage(card))),
                resolveImage(content.ethicsSection),
            ]);
            const {
                localizations: _localizations,
                translationStatuses: _translationStatuses,
                ...editableContent
            } = content;

            const payload: UpdateHippotherapyPageContentDto = {
                ...editableContent,
                introSection,
                quoteSection,
                hippoventionCenterSection,
                advantagesSection: { ...content.advantagesSection, cards: advantagesCards },
                anotherQuoteSection,
                participantsSection: { ...content.participantsSection, cards: participantsCards },
                ethicsSection,
                scientificReferencesSection: {
                    ...content.scientificReferencesSection,
                    scientificReferences: stripReferenceLocalIds(
                        content.scientificReferencesSection.scientificReferences,
                    ),
                },
            };

            const response = await client.put<HippotherapyPageContentDto>(API_ROUTES.HIPPOTHERAPY_PAGE.BASE, payload);

            return toContentModel(response.data);
        } catch (error) {
            await Promise.allSettled(imageRequests);
            await Promise.allSettled(uploadedImageIds.map((imageId) => ImageApi.delete(client, imageId)));
            throw error;
        }
    },
};
