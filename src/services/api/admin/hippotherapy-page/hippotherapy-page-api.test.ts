import { AxiosInstance } from 'axios';
import { HippotherapyPageApi } from './hippotherapy-page-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { HippotherapyPageContentDto, HippotherapyPageContentModel } from '@/types/admin/hippotherapy-page';
import { ImageValues } from '@/types/common/image';

jest.mock('@/services/api/admin/image/image-api');

describe('HippotherapyPageApi', () => {
    const mockClient = {
        get: jest.fn(),
        put: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    const buildDto = (): HippotherapyPageContentDto => ({
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
        scientificReferencesSection: {
            ...buildDto().scientificReferencesSection,
            scientificReferences: [
                { localId: 'local-1', id: 1, name: 'Citation', url: 'https://example.com/citation' },
            ],
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();

        if (!(global as any).crypto) {
            Object.defineProperty(global, 'crypto', { value: {}, configurable: true, writable: true });
        }
        (global as any).crypto.randomUUID = jest.fn(() => 'generated-uuid');
    });

    describe('get', () => {
        it('calls client.get with the correct URL and attaches a localId to each research item', async () => {
            const mockDto = buildDto();
            mockClient.get.mockResolvedValue({ data: mockDto });

            const result = await HippotherapyPageApi.get(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.HIPPOTHERAPY_PAGE.BASE);
            expect(result.introSection).toEqual(mockDto.introSection);
            expect(result.scientificReferencesSection.scientificReferences).toEqual([
                { id: 1, name: 'Citation', url: 'https://example.com/citation', localId: expect.any(String) },
            ]);
        });
    });

    describe('update', () => {
        it('strips localId from research items and does not touch ImageApi when there are no images', async () => {
            const content = buildContent();
            mockClient.put.mockResolvedValue({ data: buildDto() });

            const result = await HippotherapyPageApi.update(mockClient, content);

            expect(ImageApi.getUpdateImageId).not.toHaveBeenCalled();
            expect(ImageApi.delete).not.toHaveBeenCalled();
            expect(mockClient.put).toHaveBeenCalledWith(
                API_ROUTES.HIPPOTHERAPY_PAGE.BASE,
                expect.objectContaining({
                    scientificReferencesSection: {
                        title: content.scientificReferencesSection.title,
                        description: content.scientificReferencesSection.description,
                        scientificReferences: [{ id: 1, name: 'Citation', url: 'https://example.com/citation' }],
                    },
                }),
            );
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
            mockClient.put.mockResolvedValue({ data: buildDto() });

            await HippotherapyPageApi.update(mockClient, content);

            expect(mockClient.put).toHaveBeenCalledWith(
                API_ROUTES.HIPPOTHERAPY_PAGE.BASE,
                expect.objectContaining({
                    scientificReferencesSection: expect.objectContaining({
                        scientificReferences: [
                            { id: 1, name: 'Citation', url: 'https://example.com/citation' },
                            { id: null, name: 'New citation', url: 'https://example.com/new' },
                        ],
                    }),
                }),
            );
        });

        it('resolves a newly uploaded intro image before publishing', async () => {
            const content = buildContent();
            const newImage: ImageValues = { base64: 'mock-base64', mimeType: 'image/png' };
            content.introSection.image = newImage;

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue({ finalImageId: 42, imageIdToDelete: null });
            mockClient.put.mockResolvedValue({ data: buildDto() });

            await HippotherapyPageApi.update(mockClient, content);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, newImage, null);
            expect(ImageApi.delete).not.toHaveBeenCalled();
            expect(mockClient.put).toHaveBeenCalledWith(
                API_ROUTES.HIPPOTHERAPY_PAGE.BASE,
                expect.objectContaining({
                    introSection: expect.objectContaining({ imageId: 42 }),
                }),
            );
        });

        it('resolves gallery card images and deletes stale ones after a successful publish', async () => {
            const content = buildContent();
            const newCardImage: ImageValues = { base64: 'mock-card-base64', mimeType: 'image/png' };
            content.advantagesSection.cards[0].image = newCardImage;
            content.advantagesSection.cards[0].imageId = 7;

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue({ finalImageId: 99, imageIdToDelete: 7 });
            mockClient.put.mockResolvedValue({ data: buildDto() });
            (ImageApi.delete as jest.Mock).mockResolvedValue({});

            await HippotherapyPageApi.update(mockClient, content);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, newCardImage, 7);
            expect(mockClient.put).toHaveBeenCalledWith(
                API_ROUTES.HIPPOTHERAPY_PAGE.BASE,
                expect.objectContaining({
                    advantagesSection: expect.objectContaining({
                        cards: [expect.objectContaining({ imageId: 99 })],
                    }),
                }),
            );
            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 7);
        });
    });
});
