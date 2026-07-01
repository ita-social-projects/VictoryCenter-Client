import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { axiosInstance } from '@/services/api/axios';
import { PublicMainPageDto } from '@/types/public/main-page';
import { PublicMainPageApi } from './main-page-api';

jest.mock('@/services/api/axios');

describe('PublicMainPageApi', () => {
    beforeEach(() => {
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

        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

        const result = await PublicMainPageApi.get();

        expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.MAIN_PAGE.PUBLIC);
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockData);
    });

    it('should handle a null/empty response', async () => {
        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: null });

        const result = await PublicMainPageApi.get();

        expect(result).toBeNull();
    });

    it('should propagate errors from the client', async () => {
        const error = new Error('Network Error');
        (axiosInstance.get as jest.Mock).mockRejectedValueOnce(error);

        await expect(PublicMainPageApi.get()).rejects.toThrow('Network Error');
    });
});
