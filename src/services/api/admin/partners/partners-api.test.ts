import { PartnersApi } from './partners-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    PartnerBanner,
    PartnerBannerUpdateRequest,
    PartnerSection,
    PartnersPageData,
    PartnersSectionCreateRequest,
    PartnersSectionUpdateRequest,
} from '@/types/admin/partners';
import { RequestOptions } from '@/types/common/api';
import { ImageApi } from '../image/image-api';

jest.mock('../image/image-api');

describe('PartnersApi (admin)', () => {
    const mockClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    } as any;

    const mockedImageApi = ImageApi as jest.Mocked<typeof ImageApi>;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getBanner', () => {
        it('fetches and maps banner data', async () => {
            const bannerDto = {
                id: 10,
                title: 'Banner title',
                description: 'Banner description',
                image: { id: 5, url: 'https://img', mimeType: 'image/png' },
                localizations: [],
            };

            mockClient.get.mockResolvedValueOnce({ data: bannerDto });

            const result = await PartnersApi.getBanner(mockClient);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.PARTNERS.BANNER);
            const expected: PartnerBanner = {
                id: bannerDto.id,
                title: bannerDto.title,
                description: bannerDto.description,
                image: bannerDto.image,
                imageId: bannerDto.image?.id ?? null,
                localizations: [],
            };
            expect(result).toEqual(expected);
        });
    });

    describe('updateBanner', () => {
        it('updates banner, maps response and deletes old image if needed', async () => {
            const request: PartnerBannerUpdateRequest = {
                title: 'New title',
                description: 'New description',
                image: { base64: 'data', mimeType: 'image/png' },
                imageId: 3,
            };

            mockedImageApi.getUpdateImageId.mockResolvedValueOnce({ finalImageId: 7, imageIdToDelete: 3 });

            const responseDto = {
                id: 1,
                title: request.title,
                description: request.description,
                image: { id: 7, url: 'https://new-image', mimeType: 'image/png' },
                localizations: [],
            };
            mockClient.put.mockResolvedValueOnce({ data: responseDto });

            const result = await PartnersApi.updateBanner(mockClient, request);

            expect(mockedImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, request.image, request.imageId);
            expect(mockClient.put).toHaveBeenCalledWith(API_ROUTES.PARTNERS.BANNER, {
                title: request.title,
                description: request.description,
                imageId: 7,
            });
            expect(mockedImageApi.delete).toHaveBeenCalledWith(mockClient, 3);

            const expected: PartnerBanner = {
                id: responseDto.id,
                title: responseDto.title,
                description: responseDto.description,
                image: responseDto.image,
                imageId: responseDto.image?.id ?? null,
                localizations: [],
            };
            expect(result).toEqual(expected);
        });

        it('does not delete image when there is nothing to remove', async () => {
            const request: PartnerBannerUpdateRequest = {
                title: 'Keep',
                description: 'Same',
                image: null,
                imageId: null,
            };

            mockedImageApi.getUpdateImageId.mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: null });

            const responseDto = {
                id: 2,
                title: request.title,
                description: request.description,
                image: null,
            };
            mockClient.put.mockResolvedValueOnce({ data: responseDto });

            await PartnersApi.updateBanner(mockClient, request);

            expect(mockedImageApi.delete).not.toHaveBeenCalled();
        });
    });

    describe('getPageData', () => {
        it('fetches and maps page data', async () => {
            const dto = {
                banner: {
                    id: 1,
                    title: 'Banner',
                    description: 'Desc',
                    image: { id: 2, url: 'https://img', mimeType: 'image/png' },
                },
                sections: [
                    {
                        id: 3,
                        title: 'Section',
                        description: 'Section description',
                        partners: [
                            {
                                id: 4,
                                description: 'Partner',
                                image: { id: 5, url: 'https://partner', mimeType: 'image/png' },
                            },
                        ],
                    },
                ],
            };

            mockClient.get.mockResolvedValueOnce({ data: dto });

            const result = await PartnersApi.getPageData(mockClient);

            const expected: PartnersPageData = {
                banner: {
                    id: dto.banner.id,
                    title: dto.banner.title,
                    description: dto.banner.description,
                    image: dto.banner.image,
                    imageId: dto.banner.image?.id ?? null,
                    localizations: [],
                },
                sections: [
                    {
                        id: dto.sections[0].id,
                        title: dto.sections[0].title,
                        description: dto.sections[0].description,
                        partners: [
                            {
                                id: dto.sections[0].partners[0].id,
                                description: dto.sections[0].partners[0].description,
                                image: dto.sections[0].partners[0].image,
                                imageId: dto.sections[0].partners[0].image?.id ?? null,
                            },
                        ],
                        localizations: [],
                    },
                ],
            };

            expect(result).toEqual(expected);
            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.PARTNERS.PAGE);
        });
    });

    describe('getSections', () => {
        it('fetches sections with cancellation signal', async () => {
            const sectionsDto = [
                {
                    id: 1,
                    title: 'First',
                    description: 'Desc',
                    partners: [{ id: 2, description: 'Partner', image: { id: 3, url: 'url', mimeType: 'image/png' } }],
                },
            ];
            const options: RequestOptions = { cancellationSignal: new AbortController().signal };

            mockClient.get.mockResolvedValueOnce({ data: sectionsDto });

            const result = await PartnersApi.getSections(mockClient, options);

            expect(mockClient.get).toHaveBeenCalledWith(API_ROUTES.PARTNERS.SECTIONS, {
                signal: options.cancellationSignal,
            });
            const expected: PartnerSection[] = [
                {
                    id: 1,
                    title: 'First',
                    description: 'Desc',
                    partners: [{ id: 2, description: 'Partner', image: sectionsDto[0].partners[0].image, imageId: 3 }],
                    localizations: [],
                },
            ];
            expect(result).toEqual(expected);
        });
    });

    describe('deleteSection', () => {
        it('calls delete endpoint', async () => {
            await PartnersApi.deleteSection(mockClient, 7);

            expect(mockClient.delete).toHaveBeenCalledWith(`${API_ROUTES.PARTNERS.SECTIONS}/7`);
        });
    });

    describe('postSection', () => {
        it('creates section with uploaded partner images', async () => {
            const request: PartnersSectionCreateRequest = {
                title: 'New section',
                description: 'Desc',
                partners: [
                    {
                        description: 'Partner A',
                        image: { base64: 'data', mimeType: 'image/png' },
                        imageId: null,
                    },
                ],
            };

            mockedImageApi.getUpdateImageId.mockResolvedValueOnce({ finalImageId: 11, imageIdToDelete: null });

            const responseDto = {
                id: 10,
                title: request.title,
                description: request.description,
                partners: [
                    {
                        id: 20,
                        description: request.partners[0].description,
                        image: { id: 11, url: 'https://img', mimeType: 'image/png' },
                    },
                ],
            };
            mockClient.post.mockResolvedValueOnce({ data: responseDto });

            const result = await PartnersApi.postSection(mockClient, request);

            expect(mockedImageApi.getUpdateImageId).toHaveBeenCalledWith(mockClient, request.partners[0].image, null);
            expect(mockClient.post).toHaveBeenCalledWith(API_ROUTES.PARTNERS.SECTIONS, {
                title: request.title,
                description: request.description,
                partners: [{ description: 'Partner A', imageId: 11 }],
            });

            const expected: PartnerSection = {
                id: 10,
                title: request.title,
                description: request.description,
                partners: [
                    {
                        id: 20,
                        description: request.partners[0].description,
                        image: responseDto.partners[0].image,
                        imageId: responseDto.partners[0].image?.id ?? null,
                    },
                ],
                localizations: [],
            };
            expect(result).toEqual(expected);
        });
    });

    describe('updateSection', () => {
        it('updates section and deletes images marked for removal', async () => {
            const request: PartnersSectionUpdateRequest = {
                title: 'Updated',
                description: 'Updated desc',
                partnersToUpdate: [
                    { id: 1, description: 'Existing', image: null, imageId: 4 },
                    {
                        id: null,
                        description: 'New partner',
                        image: { base64: 'data', mimeType: 'image/png' },
                        imageId: null,
                    },
                ],
                partnerIdsToDelete: [9],
            };

            mockedImageApi.getUpdateImageId
                .mockResolvedValueOnce({ finalImageId: null, imageIdToDelete: 4 })
                .mockResolvedValueOnce({ finalImageId: 12, imageIdToDelete: null });

            const responseDto = {
                id: 5,
                title: request.title,
                description: request.description,
                partners: [
                    {
                        id: 1,
                        description: 'Existing',
                        image: { id: 4, url: 'https://old', mimeType: 'image/png' },
                    },
                    {
                        id: 2,
                        description: 'New partner',
                        image: { id: 12, url: 'https://new', mimeType: 'image/png' },
                    },
                ],
            };
            mockClient.put.mockResolvedValueOnce({ data: responseDto });

            const updated = await PartnersApi.updateSection(mockClient, 5, request);

            expect(mockedImageApi.getUpdateImageId).toHaveBeenCalledTimes(2);
            expect(mockedImageApi.delete).toHaveBeenCalledWith(mockClient, 4);
            expect(mockClient.put).toHaveBeenCalledWith(`${API_ROUTES.PARTNERS.SECTIONS}/5`, {
                title: request.title,
                description: request.description,
                partnersToCreate: [{ description: 'New partner', imageId: 12 }],
                partnersToUpdate: [{ id: 1, description: 'Existing', imageId: 0 }],
                partnerIdsToDelete: request.partnerIdsToDelete,
            });

            const expected: PartnerSection = {
                id: 5,
                title: request.title,
                description: request.description,
                partners: responseDto.partners.map((partner) => ({
                    id: partner.id,
                    description: partner.description,
                    image: partner.image,
                    imageId: partner.image?.id ?? null,
                })),
                localizations: [],
            };
            expect(updated).toEqual(expected);
        });
    });
});
