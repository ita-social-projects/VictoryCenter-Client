import { AxiosInstance } from 'axios';
import { WhoWeAreApi } from './who-we-are-api';
import { ImageApi } from '../image/image-api';
import { API_ROUTES } from '../../../../const/common/api-routes/main-api';
import { Content, WhoWeAreCategory, WhoWeAreSection } from '../../../../types/admin/who-we-are';
import { ContentType, SectionType } from '../../../../types/common/about-us';
import { Image } from '../../../../types/common/image';

jest.mock('../image/image-api');

describe('WhoWeAreApi', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should call client.get with the correct URL and return data', async () => {
            const mockData: WhoWeAreCategory[] = [{ id: 1, title: 'Category 1', sectionType: SectionType.Main }];
            mockClient.get.mockResolvedValue({ data: mockData });

            const result = await WhoWeAreApi.getAll(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.WHO_WE_ARE.BASE);
            expect(result).toEqual(mockData);
        });
    });

    describe('getByType', () => {
        it('should call client.get with the correct URL and section type and return data', async () => {
            const mockData: WhoWeAreSection = {
                id: 1,
                title: 'Section 1',
                sectionType: SectionType.Main,
                contents: [],
            };
            mockClient.get.mockResolvedValue({ data: mockData });

            const result = await WhoWeAreApi.getByType(mockClient, SectionType.Main);

            expect(mockClient.get).toHaveBeenCalledWith(`${API_ROUTES.WHO_WE_ARE.BASE}/${SectionType.Main}`);
            expect(result).toEqual(mockData);
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
                },
                {
                    id: 2,
                    description: 'Text 2',
                    contentType: ContentType.Description,
                    imageId: null,
                    image: null,
                    title: null,
                },
            ];
            const mockResponse: WhoWeAreSection = {
                id: 1,
                title: 'Main',
                sectionType: SectionType.Main,
                contents: mockContents,
            };
            mockClient.put.mockResolvedValue({ data: mockResponse });

            const result = await WhoWeAreApi.UpdateContent(mockClient, mockContents, mockSectionType);

            expect(ImageApi.getUpdateImageId).not.toHaveBeenCalled();
            expect(ImageApi.delete).not.toHaveBeenCalled();
            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.WHO_WE_ARE.BASE}/${mockSectionType}`,
                mockContents,
            );
            expect(result).toEqual(mockResponse);
        });

        it('should update content with a new image and not delete any old images', async () => {
            const newImageFile = {
                id: 1,
                url: 'https://example.com/card/1',
                mimeType: 'image/png',
            } as Image;
            const mockContents: Content[] = [
                {
                    id: 1,
                    title: 'Text 1',
                    imageId: null,
                    image: newImageFile,
                    description: null,
                    contentType: ContentType.Description,
                },
            ];
            const updatedContents: Content[] = [
                { id: 1, title: 'Text 1', imageId: 99, image: null, description: null, contentType: ContentType.Title },
            ];
            const mockResponse: WhoWeAreSection = {
                id: 1,
                title: 'Main',
                sectionType: SectionType.Main,
                contents: updatedContents,
            };

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue({
                finalImageId: 99,
                imageIdToDelete: null,
            });
            mockClient.put.mockResolvedValue({ data: mockResponse });

            const result = await WhoWeAreApi.UpdateContent(mockClient, mockContents, mockSectionType);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, newImageFile, null);
            expect(ImageApi.delete).not.toHaveBeenCalled();
            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.WHO_WE_ARE.BASE}/${mockSectionType}`,
                expect.arrayContaining([expect.objectContaining({ imageId: 99 })]),
            );
            expect(result).toEqual(mockResponse);
        });

        it('should update content with an existing image and delete the old image', async () => {
            const newImageFile = {
                id: 1,
                url: 'https://example.com/card/1',
                mimeType: 'image/png',
            } as Image;
            const mockContents: Content[] = [
                {
                    id: 1,
                    title: 'Text 1',
                    imageId: 50,
                    image: {
                        id: 1,
                        url: 'https://example.com/card/1',
                        mimeType: 'image/png',
                    } as Image,
                    description: null,
                    contentType: ContentType.Title,
                },
            ];
            const updatedContents: Content[] = [
                {
                    id: 1,
                    title: 'Text 1',
                    imageId: 99,
                    image: newImageFile,
                    description: null,
                    contentType: ContentType.Card,
                },
            ];
            const mockResponse: WhoWeAreSection = {
                id: 1,
                title: 'History',
                sectionType: mockSectionType,
                contents: updatedContents,
            };

            (ImageApi.getUpdateImageId as jest.Mock).mockResolvedValue({
                finalImageId: 99,
                imageIdToDelete: 50,
            });
            mockClient.put.mockResolvedValue({ data: mockResponse });
            (ImageApi.delete as jest.Mock).mockResolvedValue({});

            const result = await WhoWeAreApi.UpdateContent(mockClient, mockContents, mockSectionType);

            expect(ImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, newImageFile, 50);
            expect(ImageApi.delete).toHaveBeenCalledWith(mockClient, 50);
            expect(mockClient.put).toHaveBeenCalledWith(
                `${API_ROUTES.WHO_WE_ARE.BASE}/${mockSectionType}`,
                expect.arrayContaining([expect.objectContaining({ imageId: 99 })]),
            );
            expect(result).toEqual(mockResponse);
        });
    });
});
