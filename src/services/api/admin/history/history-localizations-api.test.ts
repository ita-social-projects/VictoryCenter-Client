import { HistoryLocalizationsApi } from './history-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { AxiosInstance } from 'axios';

describe('HistoryLocalizationsApi', () => {
    const mockClient = {
        post: jest.fn(),
    } as unknown as AxiosInstance;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should call POST with correct endpoint and payload', async () => {
            const mockData = {
                entityId: 1,
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
});
