import {
    mapPartnerDtoToPartner,
    mapSectionDtoToSection,
    mapBannerDtoToBanner,
    mapPartnerPageDataDtoToPageData,
} from './partner-mapper';
import {
    PartnerBannerDto,
    PartnerDto,
    PartnersPageDataDto,
    PartnersSectionDto,
} from '../../../../../services/api/admin/partners/partners-api';
import { Image } from '../../../../../types/common/image';

describe('partner-mapper', () => {
    const mockImage: Image = {
        id: 1,
        url: 'https://example.com/image.jpg',
        mimeType: 'image/jpeg',
    };

    const mockImage2: Image = {
        id: 2,
        url: 'https://example.com/image2.jpg',
        mimeType: 'image/png',
    };

    describe('mapPartnerDtoToPartner', () => {
        it('maps PartnerDto to Partner with image', () => {
            const dto: PartnerDto = {
                id: 1,
                description: 'Test partner description',
                image: mockImage,
            };

            const result = mapPartnerDtoToPartner(dto);

            expect(result).toEqual({
                id: 1,
                description: 'Test partner description',
                image: mockImage,
                imageId: 1,
            });
        });

        it('maps PartnerDto to Partner with null imageId when image id is null', () => {
            const dto: PartnerDto = {
                id: 2,
                description: 'Partner without image id',
                image: {
                    id: null,
                    url: 'https://example.com/image.jpg',
                    mimeType: 'image/jpeg',
                },
            };

            const result = mapPartnerDtoToPartner(dto);

            expect(result).toEqual({
                id: 2,
                description: 'Partner without image id',
                image: {
                    id: null,
                    url: 'https://example.com/image.jpg',
                    mimeType: 'image/jpeg',
                },
                imageId: null,
            });
        });
    });

    describe('mapBannerDtoToBanner', () => {
        it('maps PartnerBannerDto to PartnerBanner with image', () => {
            const dto: PartnerBannerDto = {
                id: 1,
                title: 'Banner Title',
                description: 'Banner description',
                image: mockImage,
            };

            const result = mapBannerDtoToBanner(dto);

            expect(result).toEqual({
                title: 'Banner Title',
                description: 'Banner description',
                image: mockImage,
                imageId: 1,
            });
        });

        it('maps PartnerBannerDto to PartnerBanner with null image', () => {
            const dto: PartnerBannerDto = {
                id: 2,
                title: 'Banner without image',
                description: 'Banner description',
                image: null,
            };

            const result = mapBannerDtoToBanner(dto);

            expect(result).toEqual({
                title: 'Banner without image',
                description: 'Banner description',
                image: null,
                imageId: null,
            });
        });

        it('maps PartnerBannerDto to PartnerBanner with null imageId when image id is null', () => {
            const dto: PartnerBannerDto = {
                id: 3,
                title: 'Banner Title',
                description: 'Banner description',
                image: {
                    id: null,
                    url: 'https://example.com/image.jpg',
                    mimeType: 'image/jpeg',
                },
            };

            const result = mapBannerDtoToBanner(dto);

            expect(result).toEqual({
                title: 'Banner Title',
                description: 'Banner description',
                image: {
                    id: null,
                    url: 'https://example.com/image.jpg',
                    mimeType: 'image/jpeg',
                },
                imageId: null,
            });
        });
    });

    describe('mapSectionDtoToSection', () => {
        it('maps PartnersSectionDto to PartnerSection with partners', () => {
            const dto: PartnersSectionDto = {
                id: 1,
                title: 'Section Title',
                description: 'Section description',
                partners: [
                    {
                        id: 1,
                        description: 'Partner 1',
                        image: mockImage,
                    },
                    {
                        id: 2,
                        description: 'Partner 2',
                        image: mockImage2,
                    },
                ],
            };

            const result = mapSectionDtoToSection(dto);

            expect(result).toEqual({
                id: 1,
                title: 'Section Title',
                description: 'Section description',
                partners: [
                    {
                        id: 1,
                        description: 'Partner 1',
                        image: mockImage,
                        imageId: 1,
                    },
                    {
                        id: 2,
                        description: 'Partner 2',
                        image: mockImage2,
                        imageId: 2,
                    },
                ],
            });
        });

        it('maps PartnersSectionDto to PartnerSection with empty partners array', () => {
            const dto: PartnersSectionDto = {
                id: 2,
                title: 'Empty Section',
                description: 'Section with no partners',
                partners: [],
            };

            const result = mapSectionDtoToSection(dto);

            expect(result).toEqual({
                id: 2,
                title: 'Empty Section',
                description: 'Section with no partners',
                partners: [],
            });
        });
    });

    describe('mapPartnerPageDataDtoToPageData', () => {
        it('maps PartnersPageDataDto to PartnersPageData with all data', () => {
            const dto: PartnersPageDataDto = {
                banner: {
                    id: 1,
                    title: 'Banner Title',
                    description: 'Banner description',
                    image: mockImage,
                },
                sections: [
                    {
                        id: 1,
                        title: 'Section 1',
                        description: 'Section 1 description',
                        partners: [
                            {
                                id: 1,
                                description: 'Partner 1',
                                image: mockImage,
                            },
                        ],
                    },
                    {
                        id: 2,
                        title: 'Section 2',
                        description: 'Section 2 description',
                        partners: [
                            {
                                id: 2,
                                description: 'Partner 2',
                                image: mockImage2,
                            },
                        ],
                    },
                ],
            };

            const result = mapPartnerPageDataDtoToPageData(dto);

            expect(result).toEqual({
                banner: {
                    title: 'Banner Title',
                    description: 'Banner description',
                    image: mockImage,
                    imageId: 1,
                },
                sections: [
                    {
                        id: 1,
                        title: 'Section 1',
                        description: 'Section 1 description',
                        partners: [
                            {
                                id: 1,
                                description: 'Partner 1',
                                image: mockImage,
                                imageId: 1,
                            },
                        ],
                    },
                    {
                        id: 2,
                        title: 'Section 2',
                        description: 'Section 2 description',
                        partners: [
                            {
                                id: 2,
                                description: 'Partner 2',
                                image: mockImage2,
                                imageId: 2,
                            },
                        ],
                    },
                ],
            });
        });

        it('maps PartnersPageDataDto to PartnersPageData with null banner image', () => {
            const dto: PartnersPageDataDto = {
                banner: {
                    id: 1,
                    title: 'Banner Title',
                    description: 'Banner description',
                    image: null,
                },
                sections: [],
            };

            const result = mapPartnerPageDataDtoToPageData(dto);

            expect(result).toEqual({
                banner: {
                    title: 'Banner Title',
                    description: 'Banner description',
                    image: null,
                    imageId: null,
                },
                sections: [],
            });
        });

        it('maps PartnersPageDataDto to PartnersPageData with empty sections array', () => {
            const dto: PartnersPageDataDto = {
                banner: {
                    id: 1,
                    title: 'Banner Title',
                    description: 'Banner description',
                    image: mockImage,
                },
                sections: [],
            };

            const result = mapPartnerPageDataDtoToPageData(dto);

            expect(result).toEqual({
                banner: {
                    title: 'Banner Title',
                    description: 'Banner description',
                    image: mockImage,
                    imageId: 1,
                },
                sections: [],
            });
        });
    });
});
