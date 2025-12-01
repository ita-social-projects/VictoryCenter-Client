import { PartnersApi } from './partners-api';
import { PartnerPage } from '../../../../types/public/partners-page';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { axiosInstance } from '../../axios';

jest.mock('../../axios');

describe('PartnersApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch the partners page and return data', async () => {
        const mockPageData: PartnerPage = {
            banner: {
                title: 'Test Banner',
                description: 'Description',
                image: {
                    url: 'http://example.com/image.png',
                    id: 1,
                    mimeType: 'image/png',
                },
            },
            sections: [
                {
                    id: 1,
                    title: 'Section 1',
                    description: 'Description for section 1',
                    partners: [
                        {
                            id: 1,
                            description: 'Partner 1',
                            image: {
                                url: 'http://example.com/partner.png',
                                id: 2,
                                mimeType: 'image/png',
                            },
                        },
                    ],
                },
            ],
        };

        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: mockPageData });

        const result = await PartnersApi.getPage();

        expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.PARTNERS.PAGE);
        expect(result).toEqual(mockPageData);
    });

    it('should handle a null response', async () => {
        (axiosInstance.get as jest.Mock).mockResolvedValueOnce({ data: null });

        const result = await PartnersApi.getPage();

        expect(result).toBeNull();
    });

    it('should propagate errors from axios', async () => {
        const error = new Error('Network error');
        (axiosInstance.get as jest.Mock).mockRejectedValueOnce(error);

        await expect(PartnersApi.getPage()).rejects.toThrow('Network error');
    });
});
