import {
    PartnerBannerDto,
    PartnerDto,
    PartnersPageDataDto,
    PartnersSectionDto,
    PartnerBanner,
    PartnersPageData,
    Partner,
    PartnerSection,
} from '@/types/admin/partners';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

export const mapPartnerDtoToPartner = (dto: PartnerDto): Partner => ({
    id: dto.id,
    description: dto.description,
    image: dto.image,
    imageId: dto.image?.id ?? null,
});

export const mapSectionDtoToSection = (dto: PartnersSectionDto): PartnerSection => ({
    id: dto.id,
    title: dto.title,
    description: dto.description,
    partners: dto.partners.map(mapPartnerDtoToPartner),
    localizations: (dto.localizations ?? []).map(mapLocalizationDtoToModel),
});

export const mapBannerDtoToBanner = (dto: PartnerBannerDto): PartnerBanner => ({
    id: dto.id,
    title: dto.title,
    description: dto.description,
    image: dto.image,
    imageId: dto.image?.id ?? null,
    localizations: (dto.localizations ?? []).map(mapLocalizationDtoToModel),
});

export const mapPartnerPageDataDtoToPageData = (dto: PartnersPageDataDto): PartnersPageData => ({
    banner: mapBannerDtoToBanner(dto.banner),
    sections: dto.sections.map(mapSectionDtoToSection),
});
