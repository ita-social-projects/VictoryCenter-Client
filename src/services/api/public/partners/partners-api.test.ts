import { PartnersApi } from './partners-api';
import { PartnerPage } from '../../../../types/public/partners-page';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';

describe('PartnersApi', () => {
    const mockClient = {
        get: jest.fn(),
    } as any;

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

        mockClient.get.mockResolvedValueOnce({ data: mockPageData });

        const result = await PartnersApi.getPage(mockClient);

        expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.PARTNERS.PAGE);
        expect(result).toEqual(mockPageData);
    });

    it('should handle a null response', async () => {
        mockClient.get.mockResolvedValueOnce({ data: null });

        const result = await PartnersApi.getPage(mockClient);

        expect(result).toBeNull();
    });

    it('should propagate errors from axios', async () => {
        const error = new Error('Network error');
        mockClient.get.mockRejectedValueOnce(error);

        await expect(PartnersApi.getPage(mockClient)).rejects.toThrow('Network error');
    });
});
