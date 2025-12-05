import {
    PartnerBannerDto,
    PartnerDto,
    PartnersPageDataDto,
    PartnersSectionDto,
} from '../../../../../services/api/admin/partners/partners-api';
import { PartnerBanner, PartnersPageData, Partner, PartnerSection } from '../../../../../types/admin/partners';

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
});

export const mapBannerDtoToBanner = (dto: PartnerBannerDto): PartnerBanner => ({
    title: dto.title,
    description: dto.description,
    image: dto.image,
    imageId: dto.image?.id ?? null,
});

export const mapPartnerPageDataDtoToPageData = (dto: PartnersPageDataDto): PartnersPageData => ({
    banner: mapBannerDtoToBanner(dto.banner),
    sections: dto.sections.map(mapSectionDtoToSection),
});
