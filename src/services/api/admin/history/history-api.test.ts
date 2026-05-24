import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import { HistorySectionDto, CreateUpdateHistorySectionDto } from '@/types/common/history-sections';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { HistoryApi } from './history-api';

jest.mock('@/services/api/admin/image/image-api');

const mockSectionDto: HistorySectionDto = {
    id: 1,
    template: SectionTemplate.TextOnly,
    order: 0,
    contents: [{ contentType: ContentType.Title, order: 0, title: 'History title' }],
};

const makeSyncSection = (imageId?: number): CreateUpdateHistorySectionDto => ({
    template: SectionTemplate.TextOnly,
    order: 0,
    contents: [
        {
            contentType: ContentType.Image,
            order: 0,
            imageId: imageId ?? null,
            image: imageId ? { id: imageId, url: 'img.jpg', mimeType: 'image/jpeg' } : null,
        },
    ],
});

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
            mockClient.get.mockResolvedValueOnce({ data: [mockSectionDto] });

            const result = await HistoryApi.fetchSections(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.HISTORY.BASE);
            expect(result).toEqual([mockSectionDto]);
        });
    });

    describe('syncSections', () => {
        it('should upload images, PUT sections, delete old images and return data', async () => {
            const section = makeSyncSection(5);
            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValueOnce({
                finalImageId: 99,
                imageIdToDelete: 5,
            });
            (ImageApi.delete as jest.Mock).mockResolvedValue(undefined);
            mockClient.put.mockResolvedValueOnce({ data: [mockSectionDto] });

            const result = await HistoryApi.syncSections(mockClient, [section]);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalled();
            expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.HISTORY.BASE, [section]);
            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 5);
            expect(result).toEqual([mockSectionDto]);
        });

        it('should delete newly uploaded images and rethrow when PUT fails', async () => {
            const section = makeSyncSection(5);
            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValueOnce({
                finalImageId: 99,
                imageIdToDelete: null,
            });
            (ImageApi.delete as jest.Mock).mockResolvedValue(undefined);
            mockClient.put.mockRejectedValueOnce(new Error('PUT failed'));

            await expect(HistoryApi.syncSections(mockClient, [section])).rejects.toThrow('PUT failed');
            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 99);
        });

        it('should delete newly uploaded images and rethrow when image upload fails', async () => {
            const section = makeSyncSection(5);
            (ImageApi.getUpdateImageId as jest.Mock).mockRejectedValueOnce(new Error('upload failed'));
            (ImageApi.delete as jest.Mock).mockResolvedValue(undefined);

            await expect(HistoryApi.syncSections(mockClient, [section])).rejects.toThrow('upload failed');
        });

        it('should skip image processing for content without image or imageId', async () => {
            const section: CreateUpdateHistorySectionDto = {
                template: SectionTemplate.TextOnly,
                order: 0,
                contents: [{ contentType: ContentType.Title, order: 0, image: null, imageId: null }],
            };
            mockClient.put.mockResolvedValueOnce({ data: [mockSectionDto] });

            const result = await HistoryApi.syncSections(mockClient, [section]);

            expect(ImageApi.getUpdateImageId).not.toHaveBeenCalled();
            expect(result).toEqual([mockSectionDto]);
        });
    });
});
