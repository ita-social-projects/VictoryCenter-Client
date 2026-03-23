import { AxiosInstance } from 'axios';
import { WhoWeAreApi } from './who-we-are-api';
import { ImageApi } from '@/services/api/admin/image/image-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { Content, WhoWeAreCategory, WhoWeAreSection } from '@/types/admin/who-we-are';
import { ContentType, SectionType } from '@/types/common/about-us';
import { ImageValues } from '@/types/common/image';

jest.mock('@/services/api/admin/image/image-api');

describe('WhoWeAreApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    beforeEach(() => {
        jest.clearAllMocks();
        (ImageApi.getUpdateImageId as jest.Mock).mockClear();
        (ImageApi.delete as jest.Mock).mockClear();
    });

    describe('getPreviews', () => {
        it('should call client.get with the correct URL and return data', async () => {
            const mockData: WhoWeAreCategory[] = [
                { id: 1, title: 'Category 1', sectionType: SectionType.Main, translationStatuses: [] },
            ];
            mockClient.get.mockResolvedValue({ data: mockData });

            const result = await WhoWeAreApi.getPreviews(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.WHO_WE_ARE.PREVIEWS);
            expect(result).toEqual(mockData);
        });
    });

    describe('getByType', () => {
        it('should call client.get with the correct URL and section type and return data', async () => {
            const mockContent = {
                id: 1,
                contentType: ContentType.Title,
                title: 'Text 1',
                localizations: [],
            } as unknown as Content;
            const mockData: WhoWeAreSection = {
                id: 1,
                title: 'Section 1',
                sectionType: SectionType.Main,
                contents: [mockContent],
            };
            mockClient.get.mockResolvedValue({ data: mockData });

            // eslint-disable-next-line testing-library/no-await-sync-query
            const result = await WhoWeAreApi.getByType(mockClient, SectionType.Main);

            expect(mockClient.get).toHaveBeenCalledWith(`${API_ROUTES.WHO_WE_ARE.BASE}/${SectionType.Main}`);
            expect(result.id).toEqual(mockData.id);
            expect(result.contents.length).toEqual(1);
            expect(result.contents[0].id).toEqual(mockContent.id);
        });
    });

    describe('UpdateContent', () => {
        const mockSectionType = SectionType.Main;

        it('should update content without images and not call ImageApi', async () => {
            const mockContents: Content[] = [
                {
                    id: 1,
                    contentType: ContentType.Title,
                    title: 'Text 1',
                    imageId: null,
                    image: null,
                    description: null,
                    localizations: [],
                },
            ];
            const mockResponse: WhoWeAreSection = {
                id: 1,
                title: 'Main',
                sectionType: SectionType.Main,
                contents: mockContents,
            };
            mockClient.put.mockResolvedValue({ data: mockResponse });

            const result = await WhoWeAreApi.updateContent(mockClient, mockContents, mockSectionType);

            expect(ImageApi.getUpdateImageId).not.toHaveBeenCalled();
            expect(ImageApi.delete).not.toHaveBeenCalled();
            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.WHO_WE_ARE.BASE}/${mockSectionType}`,
                mockContents,
            );
            expect(result).toEqual(mockResponse);
        });

        it('should update content with a new image and not delete any old images', async () => {
            const newImageValues: ImageValues = {
                base64: 'data:image/png;base64,mock-base64-string',
                mimeType: 'image/png',
            };
            const mockContents: Content[] = [
                {
                    id: 1,
                    title: 'Text 1',
                    imageId: null,
                    image: newImageValues,
                    description: null,
                    contentType: ContentType.Description,
                    localizations: [],
                },
            ];
            const mockResponse: WhoWeAreSection = {
                id: 1,
                title: 'Main',
                sectionType: SectionType.Main,
                contents: [
                    {
                        ...mockContents[0],
                        imageId: 99,
                        image: null,
                    },
                ],
            };

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue({
                finalImageId: 99,
                imageIdToDelete: null,
            });
            mockClient.put.mockResolvedValue({ data: mockResponse });

            const result = await WhoWeAreApi.updateContent(mockClient, mockContents, mockSectionType);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, newImageValues, null);
            expect(ImageApi.delete).not.toHaveBeenCalled();
            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.WHO_WE_ARE.BASE}/${mockSectionType}`,
                expect.arrayContaining([expect.objectContaining({ imageId: 99 })]),
            );
            expect(result).toEqual(mockResponse);
        });

        it('should replace an existing image and delete the old one', async () => {
            const replacingImageValues: ImageValues = {
                base64: 'data:image/png;base64,new-mock-base64-string',
                mimeType: 'image/png',
            };
            const mockContents: Content[] = [
                {
                    id: 1,
                    title: 'Text 1',
                    imageId: 50,
                    image: replacingImageValues,
                    description: null,
                    contentType: ContentType.Title,
                    localizations: [],
                },
            ];
            const mockResponse: WhoWeAreSection = {
                id: 1,
                title: 'History',
                sectionType: mockSectionType,
                contents: [
                    {
                        ...mockContents[0],
                        imageId: 99,
                        image: null,
                    },
                ],
            };

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue({
                finalImageId: 99,
                imageIdToDelete: 50,
            });
            mockClient.put.mockResolvedValue({ data: mockResponse });
            (ImageApi.delete as jest.Mock).mockResolvedValue({});

            const result = await WhoWeAreApi.updateContent(mockClient, mockContents, mockSectionType);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, replacingImageValues, 50);
            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 50);
            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.WHO_WE_ARE.BASE}/${mockSectionType}`,
                expect.arrayContaining([expect.objectContaining({ imageId: 99 })]),
            );
            expect(result).toEqual(mockResponse);
        });

        it('should delete an image without replacing it', async () => {
            const mockContents: Content[] = [
                {
                    id: 1,
                    title: 'Text 1',
                    imageId: 50,
                    image: null,
                    description: null,
                    contentType: ContentType.Title,
                    localizations: [],
                },
            ];
            const mockResponse: WhoWeAreSection = {
                id: 1,
                title: 'History',
                sectionType: mockSectionType,
                contents: [
                    {
                        ...mockContents[0],
                        imageId: null,
                    },
                ],
            };

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue({
                finalImageId: null,
                imageIdToDelete: 50,
            });
            mockClient.put.mockResolvedValue({ data: mockResponse });
            (ImageApi.delete as jest.Mock).mockResolvedValue({});

            const result = await WhoWeAreApi.updateContent(mockClient, mockContents, mockSectionType);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, null, 50);
            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 50);
            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.WHO_WE_ARE.BASE}/${mockSectionType}`,
                expect.arrayContaining([expect.objectContaining({ imageId: null })]),
            );
            expect(result).toEqual(mockResponse);
        });
    });
});
