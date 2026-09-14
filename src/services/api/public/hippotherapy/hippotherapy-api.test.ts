import { HippotherapyApi } from './hippotherapy-api';
import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { mapHippotherapyPageToAbout } from '@/utils/functions/mappers/public/hippotherapy/hippotherapy';
import { HippotherapyAbout } from '@/types/public/hippotherapy-page';

jest.mock('@/services/api/axios');
jest.mock('@/utils/functions/mappers/public/hippotherapy/hippotherapy');

describe('HippotherapyApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('requests the public endpoint and returns the mapped page', async () => {
        const dto = { introSection: { title: 'Intro title' } };
        const mapped = { introSection: { title: 'Intro title' } } as HippotherapyAbout;

        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: dto });
        (mapHippotherapyPageToAbout as jest.Mock).mockReturnValueOnce(mapped);

        const result = await HippotherapyApi.get();

        expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.HIPPOTHERAPY_PAGE.PUBLIC);
        expect(mapHippotherapyPageToAbout).toHaveBeenCalledWith(dto);
        expect(result).toBe(mapped);
    });

    it('propagates errors from axios', async () => {
        (axiosInstance.get as jest.Mock).mockRejectedValueOnce(new Error('network'));

        await expect(HippotherapyApi.get()).rejects.toThrow('network');
    });
});
