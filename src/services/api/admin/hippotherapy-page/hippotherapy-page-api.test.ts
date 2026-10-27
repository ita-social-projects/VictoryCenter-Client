import { AxiosInstance } from 'axios';
import { HippotherapyPageApi } from './hippotherapy-page-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    HippotherapyPageContentDto,
    HippotherapyPageContentModel,
    HippotherapyPageLocalizationBlock,
    HippotherapyPageTranslationStatusDto,
} from '@/types/admin/hippotherapy-page';
import { TranslationStatus } from '@/types/common/language';
import { ImageValues } from '@/types/common/image';

jest.mock('@/services/api/admin/image/image-api');

describe('HippotherapyPageApi', () => {
    const mockClient = {
        get: jest.fn(),
        put: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    const buildDto = (): HippotherapyPageContentDto => ({
        localizations: [],
        translationStatuses: [],
        introSection: { title: 'Intro title', description: 'Intro description', image: null, imageId: null },
        descriptionSection: { title: 'Description title', description: 'Description text' },
        quoteSection: { quoteText: 'Quote text', authorName: 'Author', image: null, imageId: null },
        hippoventionSection: { title: 'Hippovention title', description: 'Hippovention text' },
        hippoventionCenterSection: {
            title: 'Hippovention center title',
            description: 'Hippovention center text',
            pros: 'Pro one and pro two',
            image: null,
            imageId: null,
        },
        advantagesSection: {
            title: 'Advantages title',
            cards: [{ description: 'Card description', image: null, imageId: null }],
        },
        analysisSection: { title: 'Analysis title', description: 'Analysis text' },
        scientificReferencesSection: {
            title: 'Research title',
            description: 'Research text',
            scientificReferences: [{ id: 1, name: 'Citation', url: 'https://example.com/citation' }],
        },
        anotherQuoteSection: { quoteText: 'Another quote', authorName: 'Another author', image: null, imageId: null },
        participantsSection: {
            title: 'Participants title',
            cards: [{ description: 'Participant description', image: null, imageId: null }],
        },
        ethicsSection: {
            title: 'Ethics title',
            description: 'Ethics text',
            principles: ['Principle one'],
            image: null,
            imageId: null,
        },
    });

    const buildContent = (): HippotherapyPageContentModel => ({
        ...buildDto(),
        localizations: [],
        translationStatuses: [],
        scientificReferencesSection: {
            ...buildDto().scientificReferencesSection,
            scientificReferences: [
                { localId: 'local-1', id: 1, name: 'Citation', url: 'https://example.com/citation' },
            ],
        },
    });

    const buildStatus = (
        overrides: Partial<HippotherapyPageTranslationStatusDto> = {},
    ): HippotherapyPageTranslationStatusDto => ({
        block: HippotherapyPageLocalizationBlock.Intro,
        entityId: 1,
        languageId: 2,
        translationStatus: TranslationStatus.Relevant,
        ...overrides,
    });

    const mockGetResponse = (dto: HippotherapyPageContentDto = buildDto()) => {
        mockClient.get.mockResolvedValue({ data: dto });
        return dto;
    };

    const mockPutResponse = (dto: HippotherapyPageContentDto = buildDto()) => {
        mockClient.put.mockResolvedValue({ data: dto });
    };

    const mockImageResolution = (finalImageId: number | null, imageIdToDelete: number | null = null) => {
        (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue({ finalImageId, imageIdToDelete });
    };

    const getSentPayload = () => mockClient.put.mock.calls[0][1] as Record<string, unknown>;

    const expectPutCalledWith = (payload: Record<string, unknown>) =>
        expect(mockClient.put).toHaveBeenCalledWith(
            API_ROUTES.HIPPOTHERAPY_PAGE.BASE,
            expect.objectContaining(payload),
        );

    beforeEach(() => {
        jest.clearAllMocks();

        if (!(global as any).crypto) {
            Object.defineProperty(global, 'crypto', { value: {}, configurable: true, writable: true });
        }
        (global as any).crypto.randomUUID = jest.fn(() => 'generated-uuid');
    });

    describe('get', () => {
        it('calls client.get with the correct URL and attaches a localId to each research item', async () => {
            const mockDto = mockGetResponse();

            const result = await HippotherapyPageApi.get(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.HIPPOTHERAPY_PAGE.BASE);
            expect(result.introSection).toEqual(mockDto.introSection);
            expect(result.scientificReferencesSection.scientificReferences).toEqual([
                { id: 1, name: 'Citation', url: 'https://example.com/citation', localId: expect.any(String) },
            ]);
        });

        it('derives imageId from the image returned by the API', async () => {
            const mockDto = buildDto();
            mockDto.introSection.image = { id: 42, url: 'https://example.com/intro.png', mimeType: 'image/png' };
            mockDto.advantagesSection.cards[0].image = {
                id: 43,
                url: 'https://example.com/card.png',
                mimeType: 'image/png',
            };
            mockGetResponse(mockDto);

            const result = await HippotherapyPageApi.get(mockClient);

            expect(result.introSection.imageId).toBe(42);
            expect(result.advantagesSection.cards[0].imageId).toBe(43);
        });

        describe('translationStatuses mapping', () => {
            const getStatuses = async (statuses: HippotherapyPageTranslationStatusDto[] | undefined) => {
                const dto = buildDto();
                dto.translationStatuses = statuses;
                mockGetResponse(dto);

                return (await HippotherapyPageApi.get(mockClient)).translationStatuses;
            };

            it('keeps block, languageId and translationStatus', async () => {
                const result = await getStatuses([
                    buildStatus({
                        block: HippotherapyPageLocalizationBlock.Quote,
                        languageId: 3,
                        translationStatus: TranslationStatus.Outdated,
                    }),
                ]);

                expect(result).toEqual([
                    {
                        block: HippotherapyPageLocalizationBlock.Quote,
                        languageId: 3,
                        translationStatus: TranslationStatus.Outdated,
                    },
                ]);
            });

            it('does not expose entityId in the model', async () => {
                const [status] = await getStatuses([buildStatus()]);

                expect(status).not.toHaveProperty('entityId');
            });

            it('filters out statuses without a translation (null)', async () => {
                const result = await getStatuses([
                    buildStatus({ block: HippotherapyPageLocalizationBlock.Intro, translationStatus: null }),
                    buildStatus({ block: HippotherapyPageLocalizationBlock.Ethics }),
                ]);

                expect(result).toHaveLength(1);
                expect(result[0].block).toBe(HippotherapyPageLocalizationBlock.Ethics);
            });

            it('keeps Outdated (0) status, which is falsy but valid', async () => {
                const result = await getStatuses([buildStatus({ translationStatus: TranslationStatus.Outdated })]);

                expect(result).toEqual([expect.objectContaining({ translationStatus: TranslationStatus.Outdated })]);
            });

            it.each([
                ['undefined', undefined],
                ['an empty array', []],
            ])('returns an empty array when statuses are %s', async (_name, statuses) => {
                expect(await getStatuses(statuses)).toEqual([]);
            });
        });
    });

    describe('update', () => {
        it('strips localId from research items and does not touch ImageApi when there are no images', async () => {
            const content = buildContent();
            mockPutResponse();

            const result = await HippotherapyPageApi.update(mockClient, content);

            expect(ImageApi.getUpdateImageId).not.toHaveBeenCalled();
            expect(ImageApi.delete).not.toHaveBeenCalled();
            expectPutCalledWith({
                scientificReferencesSection: {
                    title: content.scientificReferencesSection.title,
                    description: content.scientificReferencesSection.description,
                    scientificReferences: [{ id: 1, name: 'Citation', url: 'https://example.com/citation' }],
                },
            });
            expect(result.scientificReferencesSection.scientificReferences[0]).toEqual(
                expect.objectContaining({ id: 1, name: 'Citation', localId: expect.any(String) }),
            );
        });

        it('sends a null id for a newly added, unsaved reference', async () => {
            const content = buildContent();
            content.scientificReferencesSection.scientificReferences.push({
                localId: 'local-2',
                id: null,
                name: 'New citation',
                url: 'https://example.com/new',
            });
            mockPutResponse();

            await HippotherapyPageApi.update(mockClient, content);

            expectPutCalledWith({
                scientificReferencesSection: expect.objectContaining({
                    scientificReferences: [
                        { id: 1, name: 'Citation', url: 'https://example.com/citation' },
                        { id: null, name: 'New citation', url: 'https://example.com/new' },
                    ],
                }),
            });
        });

        it('resolves a newly uploaded intro image before publishing', async () => {
            const content = buildContent();
            const newImage: ImageValues = { base64: 'mock-base64', mimeType: 'image/png' };
            content.introSection.image = newImage;
            mockImageResolution(42);
            mockPutResponse();

            await HippotherapyPageApi.update(mockClient, content);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, newImage, null);
            expect(ImageApi.delete).not.toHaveBeenCalled();
            expectPutCalledWith({ introSection: expect.objectContaining({ imageId: 42 }) });
        });

        it('resolves gallery card images and leaves image cleanup to the backend', async () => {
            const content = buildContent();
            const newCardImage: ImageValues = { base64: 'mock-card-base64', mimeType: 'image/png' };
            content.advantagesSection.cards[0].image = newCardImage;
            content.advantagesSection.cards[0].imageId = 7;
            mockImageResolution(99, 7);
            mockPutResponse();

            await HippotherapyPageApi.update(mockClient, content);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, newCardImage, 7);
            expectPutCalledWith({
                advantagesSection: expect.objectContaining({
                    cards: [expect.objectContaining({ imageId: 99 })],
                }),
            });
            expect(ImageApi.delete).not.toHaveBeenCalled();
        });

        it('does not delete an image from the client when it is removed from a section', async () => {
            const content = buildContent();
            content.introSection.image = null;
            content.introSection.imageId = 42;
            mockImageResolution(null, 42);
            mockPutResponse();

            await HippotherapyPageApi.update(mockClient, content);

            expect(ImageApi.delete).not.toHaveBeenCalled();
            expectPutCalledWith({ introSection: expect.objectContaining({ imageId: null }) });
        });

        it('sends the stored imageId when the image has not changed', async () => {
            const content = buildContent();
            content.introSection.image = { id: 42, url: 'https://example.com/intro.png', mimeType: 'image/png' };
            content.introSection.imageId = 42;
            mockImageResolution(42);
            mockPutResponse();

            await HippotherapyPageApi.update(mockClient, content);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, content.introSection.image, 42);
            expectPutCalledWith({ introSection: expect.objectContaining({ imageId: 42 }) });
        });

        it('uploads changed images in parallel', async () => {
            const content = buildContent();
            const newImage: ImageValues = { base64: 'mock-base64', mimeType: 'image/png' };
            content.introSection.image = newImage;
            content.quoteSection.image = newImage;
            content.ethicsSection.image = newImage;

            let inFlight = 0;
            let maxInFlight = 0;

            (ImageApi.getUpdateImageId as jest.Mock).mockImplementation(async () => {
                inFlight += 1;
                maxInFlight = Math.max(maxInFlight, inFlight);
                await Promise.resolve();
                inFlight -= 1;
                return { finalImageId: 1, imageIdToDelete: null };
            });
            mockPutResponse();

            await HippotherapyPageApi.update(mockClient, content);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledTimes(3);
            expect(maxInFlight).toBe(3);
        });

        it('waits for all uploads and deletes new images when one upload fails', async () => {
            const content = buildContent();
            content.introSection.image = { base64: 'intro', mimeType: 'image/png' };
            content.quoteSection.image = { base64: 'quote', mimeType: 'image/png' };

            const uploadError = new Error('Upload failed');
            (ImageApi.getUpdateImageId as jest.Mock).mockImplementation(
                async (_client: AxiosInstance, image: ImageValues) => {
                    if (image.base64 === 'quote') {
                        throw uploadError;
                    }
                    await new Promise((resolve) => setTimeout(resolve, 0));
                    return { finalImageId: 42, imageIdToDelete: null };
                },
            );

            await expect(HippotherapyPageApi.update(mockClient, content)).rejects.toThrow(uploadError);

            expect(mockClient.put).not.toHaveBeenCalled();
            expect(ImageApi.delete).toHaveBeenCalledTimes(1);
            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 42);
        });

        it('deletes new images when publishing the page fails', async () => {
            const content = buildContent();
            content.introSection.image = { base64: 'intro', mimeType: 'image/png' };
            mockImageResolution(42);
            mockClient.put.mockRejectedValue(new Error('Publish failed'));

            await expect(HippotherapyPageApi.update(mockClient, content)).rejects.toThrow('Publish failed');

            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 42);
        });

        it('does not delete images replaced in place when publishing fails', async () => {
            const content = buildContent();
            content.introSection.image = { base64: 'intro', mimeType: 'image/png' };
            content.introSection.imageId = 7;
            mockImageResolution(7);
            mockClient.put.mockRejectedValue(new Error('Publish failed'));

            await expect(HippotherapyPageApi.update(mockClient, content)).rejects.toThrow('Publish failed');

            expect(ImageApi.delete).not.toHaveBeenCalled();
        });

        it('does not send localizations or translationStatuses in the PUT body', async () => {
            const content = buildContent();
            content.translationStatuses = [
                {
                    block: HippotherapyPageLocalizationBlock.Intro,
                    languageId: 2,
                    translationStatus: TranslationStatus.Relevant,
                },
            ];
            mockPutResponse();

            await HippotherapyPageApi.update(mockClient, content);

            expect(getSentPayload()).not.toHaveProperty('localizations');
            expect(getSentPayload()).not.toHaveProperty('translationStatuses');
        });

        it('maps translationStatuses of the PUT response into the returned model', async () => {
            const dto = buildDto();
            dto.translationStatuses = [
                buildStatus({ block: HippotherapyPageLocalizationBlock.Ethics, translationStatus: null }),
                buildStatus({ block: HippotherapyPageLocalizationBlock.Participants }),
            ];
            mockPutResponse(dto);

            const result = await HippotherapyPageApi.update(mockClient, buildContent());

            expect(result.translationStatuses).toEqual([
                {
                    block: HippotherapyPageLocalizationBlock.Participants,
                    languageId: 2,
                    translationStatus: TranslationStatus.Relevant,
                },
            ]);
        });
    });
});
