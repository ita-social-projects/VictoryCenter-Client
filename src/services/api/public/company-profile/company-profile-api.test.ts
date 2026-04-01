import axios from 'axios';
import { getPublicCompanyProfile } from './company-profile-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('public company-profile-api', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls correct endpoint and returns response data', async () => {
        const mockData = {
            contacts: {
                email: 'test@example.com',
                phone: '+380501112233',
                motto: 'Test motto',
                localizations: [{ localizationInfoDto: { code: 'en' }, motto: 'EN motto' }],
            },
            socialLinks: [{ socialPlatform: 1, url: 'https://facebook.com/test' }],
        };

        mockedAxios.get.mockResolvedValueOnce({ data: mockData } as any);

        const result = await getPublicCompanyProfile();

        expect(mockedAxios.get).toHaveBeenCalledWith(`${API_ROUTES.BASE}/${API_ROUTES.COMPANY_PROFILE.BASE}`);
        expect(result).toEqual(mockData);
    });
});
