import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ContentType } from '@/types/common/section-contents';
import { SectionTemplate } from '@/types/common/sections';
import { HistorySectionDto } from '@/types/common/history-sections';
import { HistoryApi } from './history-api';

describe('HistoryApi', () => {
    const mockClient = {
        get: jest.fn(),
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
