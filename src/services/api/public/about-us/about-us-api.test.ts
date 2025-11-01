import { AboutUsApi } from './about-us-api';
import { axiosInstance } from '../../axios';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { AboutUsSection } from '../../../../types/public/about-us-page';
import { ContentType, SectionType } from '../../../../types/common/about-us';
import { Image } from '../../../../types/common/image';

jest.mock('../../axios');

describe('AboutUsApi', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('get', () => {
        it('should fetch and return "about us" sections', async () => {
            const mockData: AboutUsSection[] = [
                {
                    sectionType: SectionType.Main,
                    contents: [
                        {
                            id: 1,
                            contentType: ContentType.Image,
                            image: {
                                id: 1,
                                url: 'https://example.com/image.png',
                                mimeType: 'image/png',
                            } as Image,
                            title: null,
                            description: null,
                        },
                        {
                            id: 2,
                            contentType: ContentType.Title,
                            title: 'Test title',
                            image: null,
                            description: null,
                        },
                    ],
                },
            ];

            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockData });

            const result = await AboutUsApi.get();

            expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.WHO_WE_ARE.PUBLIC);
            expect(axiosInstance.get).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockData);
        });

        it('should return an empty array if API returns no data', async () => {
            (axiosInstance.get as jest.Mock).mockResolvedValue({ data: [] });

            const result = await AboutUsApi.get();

            expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.WHO_WE_ARE.PUBLIC);
            expect(result).toEqual([]);
        });

        it('should throw an error if the API call fails', async () => {
            const errorMessage = 'Network Request Failed';
            (axiosInstance.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

            await expect(AboutUsApi.get()).rejects.toThrow(errorMessage);
            expect(axiosInstance.get).toHaveBeenCalledWith(API_ROUTES.WHO_WE_ARE.PUBLIC);
        });
    });
});
