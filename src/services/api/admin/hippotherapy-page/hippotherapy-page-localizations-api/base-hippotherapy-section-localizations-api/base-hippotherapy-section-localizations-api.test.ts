import { AxiosInstance } from 'axios';
import { createSectionLocalizationsApi } from './base-hippotherapy-section-localizations-api';

interface TestCreateDto {
    entityId: number;
    languageId: number;
    title: string;
}

interface TestUpdateDto {
    title: string;
}

interface TestResponseDto {
    id: number;
    title: string;
}

describe('createSectionLocalizationsApi', () => {
    const testUrl = 'test-section-localizations';
    const api = createSectionLocalizationsApi<TestCreateDto, TestUpdateDto, TestResponseDto>(testUrl);

    let mockClient: jest.Mocked<Pick<AxiosInstance, 'post' | 'put'>>;

    beforeEach(() => {
        mockClient = {
            post: jest.fn(),
            put: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('calls client.post with the correct URL, payload, and returns response.data', async () => {
            const createPayload: TestCreateDto = {
                entityId: 10,
                languageId: 2,
                title: 'New Section Translation',
            };

            const mockResponse: TestResponseDto = {
                id: 100,
                title: 'New Section Translation',
            };

            mockClient.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await api.create(mockClient as unknown as AxiosInstance, createPayload);

            expect(mockClient.post).toHaveBeenCalledTimes(1);
            expect(mockClient.post).toHaveBeenCalledWith(testUrl, createPayload);
            expect(result).toEqual(mockResponse);
        });

        it('propagates errors when client.post fails', async () => {
            const createPayload: TestCreateDto = {
                entityId: 10,
                languageId: 2,
                title: 'New Section Translation',
            };

            const networkError = new Error('Network error on post');
            mockClient.post.mockRejectedValueOnce(networkError);

            await expect(api.create(mockClient as unknown as AxiosInstance, createPayload)).rejects.toThrow(
                networkError,
            );
            expect(mockClient.post).toHaveBeenCalledTimes(1);
        });
    });

    describe('update', () => {
        it('calls client.put with the formatted URL (url/entityId/languageId), payload, and returns response.data', async () => {
            const entityId = 42;
            const languageId = 3;
            const updatePayload: TestUpdateDto = {
                title: 'Updated Section Translation',
            };

            const mockResponse: TestResponseDto = {
                id: 100,
                title: 'Updated Section Translation',
            };

            mockClient.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await api.update(
                mockClient as unknown as AxiosInstance,
                entityId,
                languageId,
                updatePayload,
            );

            expect(mockClient.put).toHaveBeenCalledTimes(1);
            expect(mockClient.put).toHaveBeenCalledWith(`${testUrl}/${entityId}/${languageId}`, updatePayload);
            expect(result).toEqual(mockResponse);
        });

        it('propagates errors when client.put fails', async () => {
            const entityId = 42;
            const languageId = 3;
            const updatePayload: TestUpdateDto = {
                title: 'Updated Section Translation',
            };

            const networkError = new Error('Network error on put');
            mockClient.put.mockRejectedValueOnce(networkError);

            await expect(
                api.update(mockClient as unknown as AxiosInstance, entityId, languageId, updatePayload),
            ).rejects.toThrow(networkError);
            expect(mockClient.put).toHaveBeenCalledTimes(1);
        });
    });
});
