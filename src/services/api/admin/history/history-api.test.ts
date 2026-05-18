import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import { HistorySectionDto, CreateUpdateHistorySectionDto } from '@/types/common/history-sections';
import { HistoryApi } from './history-api';
import { ImageApi } from '@/services/api/admin/image/image-api';

jest.mock('@/services/api/admin/image/image-api');

describe('HistoryApi', () => {
    const mockClient = {
        get: jest.fn(),
        put: jest.fn(),
    } as any;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchSections', () => {
        it('should call GET with history route and return data', async () => {
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
                        },
                    ],
                },
            ];

            mockClient.get.mockResolvedValueOnce({ data: mockSections });

            const result = await HistoryApi.fetchSections(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.HISTORY.BASE);
            expect(result).toEqual(mockSections);
        });
    });

    describe('syncSections', () => {
        it('should successfully sync sections with image uploads and deletions', async () => {
            const mockSections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title',
                            image: { base64: 'data:image/jpeg;base64,xyz', mimeType: 'image/jpeg' },
                            imageId: null,
                        },
                    ],
                },
            ];

            const mockResponseData: HistorySectionDto[] = [
                {
                    id: 1,
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title',
                            imageId: 101,
                        },
                    ],
                },
            ];

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValueOnce({
                finalImageId: 101,
                imageIdToDelete: null,
            });

            mockClient.put.mockResolvedValueOnce({ data: mockResponseData });

            const result = await HistoryApi.syncSections(mockClient, mockSections);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalled();
            expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.HISTORY.BASE, mockSections);
            expect(result).toEqual(mockResponseData);
        });

        it('should delete old images when syncing successfully', async () => {
            const mockSections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title',
                            image: { base64: 'data:image/jpeg;base64,abc', mimeType: 'image/jpeg' },
                            imageId: 50,
                        },
                    ],
                },
            ];

            const mockResponseData: HistorySectionDto[] = [
                {
                    id: 1,
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title',
                            imageId: 101,
                        },
                    ],
                },
            ];

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValueOnce({
                finalImageId: 101,
                imageIdToDelete: 50,
            });

            mockClient.put.mockResolvedValueOnce({ data: mockResponseData });
            (ImageApi.delete as jest.Mock).mockResolvedValue(undefined);

            const result = await HistoryApi.syncSections(mockClient, mockSections);

            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 50);
            expect(result).toEqual(mockResponseData);
        });

        it('should rollback newly created images if sync fails', async () => {
            const mockSections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title',
                            image: { base64: 'data:image/jpeg;base64,def', mimeType: 'image/jpeg' },
                            imageId: null,
                        },
                    ],
                },
            ];

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValueOnce({
                finalImageId: 101,
                imageIdToDelete: null,
            });

            const syncError = new Error('Sync failed');
            mockClient.put.mockRejectedValueOnce(syncError);
            (ImageApi.delete as jest.Mock).mockResolvedValue(undefined);

            await expect(HistoryApi.syncSections(mockClient, mockSections)).rejects.toThrow('Sync failed');

            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 101);
        });

        it('should handle image upload failure and rollback', async () => {
            const mockSections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title',
                            image: { base64: 'data:image/jpeg;base64,ghi', mimeType: 'image/jpeg' },
                            imageId: null,
                        },
                    ],
                },
            ];

            const uploadError = new Error('Upload failed');
            (ImageApi.getUpdateImageId as jest.Mock).mockRejectedValueOnce(uploadError);
            (ImageApi.delete as jest.Mock).mockResolvedValue(undefined);

            await expect(HistoryApi.syncSections(mockClient, mockSections)).rejects.toThrow('Upload failed');

            expect(mockClient.put).not.toHaveBeenCalled();
        });

        it('should handle multiple sections with multiple images', async () => {
            const mockSections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title 1',
                            image: { base64: 'data:image/jpeg;base64,jkl', mimeType: 'image/jpeg' },
                            imageId: null,
                        },
                        {
                            contentType: ContentType.Description,
                            order: 1,
                            description: 'Desc',
                            image: { base64: 'data:image/jpeg;base64,mno', mimeType: 'image/jpeg' },
                            imageId: null,
                        },
                    ],
                },
                {
                    template: SectionTemplate.TextOnly,
                    order: 1,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title 2',
                            image: { base64: 'data:image/jpeg;base64,pqr', mimeType: 'image/jpeg' },
                            imageId: null,
                        },
                    ],
                },
            ];

            const mockResponseData: HistorySectionDto[] = [
                {
                    id: 1,
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        { contentType: ContentType.Title, order: 0, title: 'Title 1', imageId: 101 },
                        { contentType: ContentType.Description, order: 1, description: 'Desc', imageId: 102 },
                    ],
                },
                {
                    id: 2,
                    template: SectionTemplate.TextOnly,
                    order: 1,
                    contents: [
                        { contentType: ContentType.Title, order: 0, title: 'Title 2', imageId: 103 },
                    ],
                },
            ];

            (ImageApi.getUpdateImageId as jest.Mock)
                .mockResolvedValueOnce({ finalImageId: 101, imageIdToDelete: null })
                .mockResolvedValueOnce({ finalImageId: 102, imageIdToDelete: null })
                .mockResolvedValueOnce({ finalImageId: 103, imageIdToDelete: null });

            mockClient.put.mockResolvedValueOnce({ data: mockResponseData });

            const result = await HistoryApi.syncSections(mockClient, mockSections);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledTimes(3);
            expect(result).toEqual(mockResponseData);
        });

        it('should not call delete when no images to delete after sync', async () => {
            const mockSections: CreateUpdateHistorySectionDto[] = [
                {
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title',
                        },
                    ],
                },
            ];

            const mockResponseData: HistorySectionDto[] = [
                {
                    id: 1,
                    template: SectionTemplate.TextOnly,
                    order: 0,
                    contents: [
                        {
                            contentType: ContentType.Title,
                            order: 0,
                            title: 'Title',
                        },
                    ],
                },
            ];

            mockClient.put.mockResolvedValueOnce({ data: mockResponseData });

            const result = await HistoryApi.syncSections(mockClient, mockSections);

            expect(ImageApi.delete).not.toHaveBeenCalled();
            expect(result).toEqual(mockResponseData);
        });
    });
});
