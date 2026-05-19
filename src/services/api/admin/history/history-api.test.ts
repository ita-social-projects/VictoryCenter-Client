import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import { HistorySectionDto, CreateUpdateHistorySectionDto } from '@/types/common/history-sections';
import { HistoryApi } from './history-api';
import { ImageApi } from '@/services/api/admin/image/image-api';

jest.mock('@/services/api/admin/image/image-api', () => ({
    ImageApi: {
        getUpdateImageId: jest.fn(),
        delete: jest.fn(),
    },
}));

const mockGetUpdateImageId = ImageApi.getUpdateImageId as jest.Mock;
const mockImageDelete = ImageApi.delete as jest.Mock;

describe('HistoryApi', () => {
    const mockClient = {
        get: jest.fn(),
        put: jest.fn(),
    } as any;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetchSections should call GET with history route and return data', async () => {
        const mockSections: HistorySectionDto[] = [
            {
                id: 1,
                template: SectionTemplate.TextOnly,
                order: 0,
                contents: [
                    {
                        contentType: ContentType.Title,
                        order: 0,
                        title: 'History title',
                        localizations: [],
                    },
                ],
            },
        ];

        mockClient.get.mockResolvedValueOnce({ data: mockSections });

        const result = await HistoryApi.fetchSections(mockClient);

        expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.HISTORY.BASE);
        expect(result).toEqual(mockSections);
    });

    describe('syncSections', () => {
        const mockResult: HistorySectionDto[] = [{ id: 1, template: SectionTemplate.TextOnly, order: 0, contents: [] }];

        it('syncs sections with no image contents and returns data', async () => {
            const sections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [{ contentType: ContentType.Title, order: 0, title: 'Test' }],
                },
            ];

            mockClient.put.mockResolvedValueOnce({ data: mockResult });

            const result = await HistoryApi.syncSections(mockClient, sections);

            expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.HISTORY.BASE, sections);
            expect(result).toEqual(mockResult);
            expect(mockGetUpdateImageId).not.toHaveBeenCalled();
        });

        it('uploads a new image (ImageValues) when content.image has no id', async () => {
            const imageValues = { base64: 'abc', mimeType: 'image/jpeg' };
            const sections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.SingleImageTop,
                    order: 0,
                    contents: [{ contentType: ContentType.Image, order: 0, image: imageValues as any }],
                },
            ];

            mockGetUpdateImageId.mockResolvedValueOnce({ finalImageId: 42, imageIdToDelete: null });
            mockClient.put.mockResolvedValueOnce({ data: mockResult });

            await HistoryApi.syncSections(mockClient, sections);

            expect(mockGetUpdateImageId).toHaveBeenCalledWith(mockClient, imageValues, null);
            expect(sections[0].contents[0].imageId).toBe(42);
            expect(sections[0].contents[0].image).toBeNull();
        });

        it('uses existingImageId from content.imageId when present', async () => {
            const sections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.SingleImageTop,
                    order: 0,
                    contents: [{ contentType: ContentType.Image, order: 0, imageId: 10, image: null }],
                },
            ];

            mockGetUpdateImageId.mockResolvedValueOnce({ finalImageId: 10, imageIdToDelete: null });
            mockClient.put.mockResolvedValueOnce({ data: mockResult });

            await HistoryApi.syncSections(mockClient, sections);

            expect(mockGetUpdateImageId).toHaveBeenCalledWith(mockClient, null, 10);
        });

        it('uses id from content.image when it is an Image object with id', async () => {
            const imageWithId = { id: 7, url: 'http://example.com/img.jpg' };
            const sections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.SingleImageTop,
                    order: 0,
                    contents: [{ contentType: ContentType.Image, order: 0, image: imageWithId as any }],
                },
            ];

            mockGetUpdateImageId.mockResolvedValueOnce({ finalImageId: 7, imageIdToDelete: null });
            mockClient.put.mockResolvedValueOnce({ data: mockResult });

            await HistoryApi.syncSections(mockClient, sections);

            expect(mockGetUpdateImageId).toHaveBeenCalledWith(mockClient, imageWithId, 7);
        });

        it('tracks newly created image id when finalImageId differs from existingImageId', async () => {
            const sections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.SingleImageTop,
                    order: 0,
                    contents: [{ contentType: ContentType.Image, order: 0, imageId: 5, image: null }],
                },
            ];

            mockGetUpdateImageId.mockResolvedValueOnce({ finalImageId: 99, imageIdToDelete: null });
            mockClient.put.mockResolvedValueOnce({ data: mockResult });
            mockImageDelete.mockResolvedValue(undefined);

            await HistoryApi.syncSections(mockClient, sections);

            expect(sections[0].contents[0].imageId).toBe(99);
        });

        it('deletes old image after successful sync when imageIdToDelete is returned', async () => {
            const sections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.SingleImageTop,
                    order: 0,
                    contents: [{ contentType: ContentType.Image, order: 0, imageId: 3, image: null }],
                },
            ];

            mockGetUpdateImageId.mockResolvedValueOnce({ finalImageId: 3, imageIdToDelete: 3 });
            mockClient.put.mockResolvedValueOnce({ data: mockResult });
            mockImageDelete.mockResolvedValue(undefined);

            await HistoryApi.syncSections(mockClient, sections);

            expect(mockImageDelete).toHaveBeenCalledWith(mockClient, 3);
        });

        it('cleans up newly created images and rethrows when PUT fails', async () => {
            const putError = new Error('PUT failed');
            const sections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.SingleImageTop,
                    order: 0,
                    contents: [{ contentType: ContentType.Image, order: 0, imageId: 5, image: null }],
                },
            ];

            mockGetUpdateImageId.mockResolvedValueOnce({ finalImageId: 77, imageIdToDelete: null });
            mockClient.put.mockRejectedValueOnce(putError);
            mockImageDelete.mockResolvedValue(undefined);

            await expect(HistoryApi.syncSections(mockClient, sections)).rejects.toThrow('PUT failed');
            expect(mockImageDelete).toHaveBeenCalledWith(mockClient, 77);
        });

        it('cleans up newly created images and rethrows when image upload fails', async () => {
            const uploadError = new Error('upload failed');
            const sections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.SingleImageTop,
                    order: 0,
                    contents: [
                        { contentType: ContentType.Image, order: 0, imageId: 1, image: null },
                        { contentType: ContentType.Image, order: 1, imageId: 2, image: null },
                    ],
                },
            ];

            mockGetUpdateImageId
                .mockResolvedValueOnce({ finalImageId: 50, imageIdToDelete: null })
                .mockRejectedValueOnce(uploadError);
            mockImageDelete.mockResolvedValue(undefined);

            await expect(HistoryApi.syncSections(mockClient, sections)).rejects.toThrow('upload failed');
            expect(mockClient.put).not.toHaveBeenCalled();
        });
    });
});
