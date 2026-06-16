import { HistoryLocalizationsApi } from './history-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { AxiosInstance } from 'axios';

describe('HistoryLocalizationsApi', () => {
    const mockClient = {
        post: jest.fn(),
        put: jest.fn(),
    } as unknown as AxiosInstance;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should call POST with correct endpoint and payload', async () => {
            const mockData = {
                entityId: 1,
                languageId: 2,
                contents: [
                    {
                        entityId: 10,
                        languageId: 2,
                        title: 'Test Title',
                        description: 'Test Description',
                    },
                ],
            };
            const mockResponse = { data: null };
            (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

            await HistoryLocalizationsApi.create(mockClient, mockData);

            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.HISTORY_LOCALIZATIONS.BASE, mockData);
        });
    });
    describe('update', () => {
        it('should call PUT with correct endpoint and payload', async () => {
            const mockData = {
                entityId: 1,
                languageId: 2,
                contents: [
                    {
                        entityId: 10,
                        languageId: 2,
                        title: 'Test Title Updated',
                        description: 'Test Description Updated',
                    },
                ],
            };
            const mockResponse = { data: null };
            (mockClient.put as jest.Mock).mockResolvedValue(mockResponse);

            await HistoryLocalizationsApi.update(mockClient, 1, 2, mockData);

            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.HISTORY_LOCALIZATIONS.BASE}/1/language/2`,
                mockData,
            );
        });
    });
});
