import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PublicMainPageDto } from '@/types/public/main-page';
import { AxiosInstance } from 'axios';
import { PublicMainPageApi } from './main-page-api';

describe('PublicMainPageApi', () => {
    let mockClient: jest.Mocked<Partial<AxiosInstance>>;

    beforeEach(() => {
        mockClient = {
            get: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch the public main page data and return it', async () => {
        const mockData: PublicMainPageDto = {
            id: 1,
            title: 'Test Title',
            description: 'Test Description',
            image: null,
            mainAboutUs: {
                id: 1,
                title: 'About Us',
                description: 'About Us Description',
                localizations: [],
            },
            mainPartners: null,
            impactStatistics: null,
            localizations: [],
        };

        (mockClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

        const result = await PublicMainPageApi.get(mockClient as AxiosInstance);

        expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.MAIN_PAGE.PUBLIC);
        expect(mockClient.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockData);
    });

    it('should handle a null/empty response', async () => {
        (mockClient.get as jest.Mock).mockResolvedValueOnce({ data: null });

        const result = await PublicMainPageApi.get(mockClient as AxiosInstance);

        expect(result).toBeNull();
    });

    it('should propagate errors from the client', async () => {
        const error = new Error('Network Error');
        (mockClient.get as jest.Mock).mockRejectedValueOnce(error);

        await expect(PublicMainPageApi.get(mockClient as AxiosInstance)).rejects.toThrow('Network Error');
    });
});
