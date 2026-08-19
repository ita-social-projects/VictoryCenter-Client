import {
    mapPartnerDtoToPartner,
    mapSectionDtoToSection,
    mapBannerDtoToBanner,
    mapPartnerPageDataDtoToPageData,
} from './partner-mappers';
import { PartnerBannerDto, PartnerDto, PartnersPageDataDto, PartnersSectionDto } from '@/types/admin/partners';
import { Image } from '@/types/common/image';
import { TranslationStatus } from '@/types/common/language';

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
                localizations: [],
            };

            const result = mapBannerDtoToBanner(dto);

            expect(result).toEqual({
                id: 1,
                title: 'Banner Title',
                description: 'Banner description',
                image: mockImage,
                imageId: 1,
                localizations: [],
            });
        });

        it('maps PartnerBannerDto to PartnerBanner with null image', () => {
            const dto: PartnerBannerDto = {
                id: 2,
                title: 'Banner without image',
                description: 'Banner description',
                image: null,
                localizations: [],
            };

            const result = mapBannerDtoToBanner(dto);

            expect(result).toEqual({
                id: 2,
                title: 'Banner without image',
                description: 'Banner description',
                image: null,
                imageId: null,
                localizations: [],
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
                localizations: [],
            };

            const result = mapBannerDtoToBanner(dto);

            expect(result).toEqual({
                id: 3,
                title: 'Banner Title',
                description: 'Banner description',
                image: {
                    id: null,
                    url: 'https://example.com/image.jpg',
                    mimeType: 'image/jpeg',
                },
                imageId: null,
                localizations: [],
            });
        });

        it('maps localizations from PartnerBannerLocalizationDto to PartnerBannerLocalization', () => {
            const dto: PartnerBannerDto = {
                id: 4,
                title: 'Banner Title',
                description: 'Banner description',
                image: mockImage,
                localizations: [
                    {
                        entityId: 4,
                        title: 'Banner Title EN',
                        description: 'Banner description EN',
                        localizationInfoDto: { id: 2, code: 'en' },
                        translationStatus: TranslationStatus.Relevant,
                    },
                ],
            };

            const result = mapBannerDtoToBanner(dto);

            expect(result.localizations).toEqual([
                {
                    entityId: 4,
                    title: 'Banner Title EN',
                    description: 'Banner description EN',
                    language: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                },
            ]);
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
                localizations: [],
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
                localizations: [],
            });
        });

        it('maps PartnersSectionDto to PartnerSection with empty partners array', () => {
            const dto: PartnersSectionDto = {
                id: 2,
                title: 'Empty Section',
                description: 'Section with no partners',
                partners: [],
                localizations: [],
            };

            const result = mapSectionDtoToSection(dto);

            expect(result).toEqual({
                id: 2,
                title: 'Empty Section',
                description: 'Section with no partners',
                partners: [],
                localizations: [],
            });
        });

        it('maps localizations from EntityLocalizationDto to EntityLocalization', () => {
            const dto: PartnersSectionDto = {
                id: 3,
                title: 'Section Title',
                description: 'Section description',
                partners: [],
                localizations: [
                    {
                        localizationInfoDto: { id: 2, code: 'en' },
                        translationStatus: TranslationStatus.Relevant,
                    },
                ],
            };

            const result = mapSectionDtoToSection(dto);

            expect(result.localizations).toEqual([
                {
                    language: { id: 2, code: 'en' },
                    translationStatus: TranslationStatus.Relevant,
                },
            ]);
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
                    localizations: [],
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
                        localizations: [],
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
                        localizations: [],
                    },
                ],
            };

            const result = mapPartnerPageDataDtoToPageData(dto);

            expect(result).toEqual({
                banner: {
                    id: 1,
                    title: 'Banner Title',
                    description: 'Banner description',
                    image: mockImage,
                    imageId: 1,
                    localizations: [],
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
                        localizations: [],
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
                        localizations: [],
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
                    localizations: [],
                },
                sections: [],
            };

            const result = mapPartnerPageDataDtoToPageData(dto);

            expect(result).toEqual({
                banner: {
                    id: 1,
                    title: 'Banner Title',
                    description: 'Banner description',
                    image: null,
                    imageId: null,
                    localizations: [],
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
                    localizations: [],
                },
                sections: [],
            };

            const result = mapPartnerPageDataDtoToPageData(dto);

            expect(result).toEqual({
                banner: {
                    id: 1,
                    title: 'Banner Title',
                    description: 'Banner description',
                    image: mockImage,
                    imageId: 1,
                    localizations: [],
                },
                sections: [],
            });
        });
    });
});
