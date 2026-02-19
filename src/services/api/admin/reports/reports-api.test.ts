import { ReportsApi } from './reports-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    ReportsMediaSettings,
    ReportsMediaSettingsDto,
    ReportsMediaSettingsUpdateRequest,
} from '@/types/admin/reports';
import { ImageApi } from '../image/image-api';
import { Image } from '@/types/common/image';

jest.mock('../image/image-api');

const createCollectedFundsBlockDto = (
    overrides: Partial<ReportsMediaSettingsDto['collectedFundsBlock']> = {},
) => ({
    title: 'CF Title',
    collectedAmount: 250000,
    image: { id: 10, url: 'https://img/cf.png', mimeType: 'image/png' } as Image,
    imageId: 10,
    ...overrides,
});

const createChangedLivesBlockDto = (
    overrides: Partial<ReportsMediaSettingsDto['changedLivesBlock']> = {},
) => ({
    title: 'CL Title',
    changedLives: 56,
    image: { id: 20, url: 'https://img/cl.png', mimeType: 'image/png' } as Image,
    imageId: 20,
    ...overrides,
});

const createResponseDto = (
    cfOverrides: Partial<ReportsMediaSettingsDto['collectedFundsBlock']> = {},
    clOverrides: Partial<ReportsMediaSettingsDto['changedLivesBlock']> = {},
): ReportsMediaSettingsDto => ({
    collectedFundsBlock: createCollectedFundsBlockDto(cfOverrides),
    changedLivesBlock: createChangedLivesBlockDto(clOverrides),
});

describe('ReportsApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as any;

    const mockedImageApi = ImageApi as jest.Mocked<typeof ImageApi>;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMediaSettings', () => {
        it('should fetch and map media settings', async () => {
            const dto = createResponseDto();
            mockClient.get.mockResolvedValueOnce({ data: dto });

            const result = await ReportsApi.getMediaSettings(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.REPORTS.MEDIA_SETTINGS);

            const expected: ReportsMediaSettings = {
                collectedFunds: {
                    title: 'CF Title',
                    collectedFunds: 250000,
                    image: dto.collectedFundsBlock.image,
                    imageId: 10,
                },
                changedLives: {
                    title: 'CL Title',
                    changedLives: 56,
                    image: dto.changedLivesBlock.image,
                    imageId: 20,
                },
            };
            expect(result).toEqual(expected);
        });

        it('should handle null images in response', async () => {
            const dto = createResponseDto(
                { title: 'Title', collectedAmount: 0, image: null, imageId: null },
                { title: 'Title 2', changedLives: 0, image: null, imageId: null },
            );
            mockClient.get.mockResolvedValueOnce({ data: dto });

            const result = await ReportsApi.getMediaSettings(mockClient);

            expect(result).toEqual({
                collectedFunds: { title: 'Title', collectedFunds: 0, image: null, imageId: null },
                changedLives: { title: 'Title 2', changedLives: 0, image: null, imageId: null },
            });
        });
    });

    describe('updateMediaSettings', () => {
        it('should update media settings with new images and delete old ones', async () => {
            const request: ReportsMediaSettingsUpdateRequest = {
                collectedFunds: {
                    title: 'New CF Title',
                    collectedFunds: 300000,
                    image: { base64: 'cf-base64', mimeType: 'image/png' },
                    imageId: 10,
                },
                changedLives: {
                    title: 'New CL Title',
                    changedLives: 100,
                    image: { base64: 'cl-base64', mimeType: 'image/jpeg' },
                    imageId: 20,
                },
            };

            mockedImageApi.getUpdateImageId
                .mockResolvedValueOnce({ finalImageId: 11, imageIdToDelete: 10 })
                .mockResolvedValueOnce({ finalImageId: 21, imageIdToDelete: 20 });

            const responseDto = createResponseDto(
                { title: 'New CF Title', collectedAmount: 300000, image: { id: 11, url: 'https://img/cf-new.png', mimeType: 'image/png' }, imageId: 11 },
                { title: 'New CL Title', changedLives: 100, image: { id: 21, url: 'https://img/cl-new.png', mimeType: 'image/jpeg' }, imageId: 21 },
            );
            mockClient.put.mockResolvedValueOnce({ data: responseDto });

            const result = await ReportsApi.updateMediaSettings(mockClient, request);

            expect(mockedImageApi.getUpdateImageId).toHaveBeenCalledTimes(2);
            expect(mockedImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, request.collectedFunds.image, request.collectedFunds.imageId);
            expect(mockedImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, request.changedLives.image, request.changedLives.imageId);

            expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.REPORTS.MEDIA_SETTINGS, {
                collectedFundsBlock: { title: 'New CF Title', collectedAmount: 300000, imageId: 11 },
                changedLivesBlock: { title: 'New CL Title', changedLives: 100, imageId: 21 },
            });

            expect(mockedImageApi.delete).toHaveBeenCalledWith(mockClient, 10);
            expect(mockedImageApi.delete).toHaveBeenCalledWith(mockClient, 20);

            expect(result).toEqual({
                collectedFunds: { title: 'New CF Title', collectedFunds: 300000, image: responseDto.collectedFundsBlock.image, imageId: 11 },
                changedLives: { title: 'New CL Title', changedLives: 100, image: responseDto.changedLivesBlock.image, imageId: 21 },
            });
        });

        it('should not delete images when there is nothing to remove', async () => {
            const request: ReportsMediaSettingsUpdateRequest = {
                collectedFunds: { title: 'Keep Title', collectedFunds: 100, image: null, imageId: null },
                changedLives: { title: 'Keep CL', changedLives: 10, image: null, imageId: null },
            };

            mockedImageApi.getUpdateImageId
                .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: null })
                .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: null });

            const responseDto = createResponseDto(
                { title: 'Keep Title', collectedAmount: 100, image: null, imageId: null },
                { title: 'Keep CL', changedLives: 10, image: null, imageId: null },
            );
            mockClient.put.mockResolvedValueOnce({ data: responseDto });

            await ReportsApi.updateMediaSettings(mockClient, request);

            expect(mockedImageApi.delete).not.toHaveBeenCalled();
        });

        it('should only delete the image that changed', async () => {
            const request: ReportsMediaSettingsUpdateRequest = {
                collectedFunds: { title: 'CF Title', collectedFunds: 500, image: { base64: 'new-cf', mimeType: 'image/png' }, imageId: 5 },
                changedLives: { title: 'CL Title', changedLives: 30, image: { id: 20, url: 'https://img/cl.png', mimeType: 'image/png' }, imageId: 20 },
            };

            mockedImageApi.getUpdateImageId
                .mockResolvedValueOnce({ finalImageId: 6, imageIdToDelete: 5 })
                .mockResolvedValueOnce({ finalImageId: 20, imageIdToDelete: null });

            const responseDto = createResponseDto(
                { title: 'CF Title', collectedAmount: 500, image: { id: 6, url: 'https://img/cf-new.png', mimeType: 'image/png' }, imageId: 6 },
                { title: 'CL Title', changedLives: 30 },
            );
            mockClient.put.mockResolvedValueOnce({ data: responseDto });

            await ReportsApi.updateMediaSettings(mockClient, request);

            expect(mockedImageApi.delete).toHaveBeenCalledTimes(1);
            expect(mockedImageApi.delete).toHaveBeenCalledWith(mockClient, 5);
        });

        it('should send null imageId when finalImageId is null', async () => {
            const request: ReportsMediaSettingsUpdateRequest = {
                collectedFunds: { title: 'Title', collectedFunds: 0, image: null, imageId: 7 },
                changedLives: { title: 'Title 2', changedLives: 0, image: null, imageId: 8 },
            };

            mockedImageApi.getUpdateImageId
                .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: 7 })
                .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: 8 });

            const responseDto = createResponseDto(
                { title: 'Title', collectedAmount: 0, image: null, imageId: null },
                { title: 'Title 2', changedLives: 0, image: null, imageId: null },
            );
            mockClient.put.mockResolvedValueOnce({ data: responseDto });

            await ReportsApi.updateMediaSettings(mockClient, request);

            expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.REPORTS.MEDIA_SETTINGS, {
                collectedFundsBlock: { title: 'Title', collectedAmount: 0, imageId: null },
                changedLivesBlock: { title: 'Title 2', changedLives: 0, imageId: null },
            });
        });
    });
});
