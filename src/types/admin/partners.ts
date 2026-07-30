import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '../common/language';
import { Image, ImageValues } from '../common/image';

export type PartnerBanner = {
    id: number;
    title: string;
    description: string;
    image: Image | ImageValues | null;
    imageId: number | null;
} & EntityWithLocalizations<PartnerBannerLocalization>;

export type Partner = {
    id: number;
    description: string;
    image: Image | ImageValues | null;
    imageId: number | null;
};

export type PartnerSection = {
    id: number;
    title: string;
    description: string;
    partners: Partner[];
} & EntityWithLocalizations<EntityLocalization>;

export type PartnersPageData = {
    banner: PartnerBanner;
    sections: PartnerSection[];
};

export interface PartnerBannerUpdateRequest {
    title: string;
    description: string;
    imageId: number | null;
    image: Image | ImageValues | null;
}

export interface PartnersSectionCreateRequest {
    title: string;
    description: string;
    partners: Array<{
        description: string;
        imageId: number | null;
        image: Image | ImageValues | null;
    }>;
}

export interface PartnersSectionUpdateRequest {
    title: string;
    description: string;
    partnersToUpdate: Array<{
        id: number | null;
        description: string;
        imageId: number | null;
        image: Image | ImageValues | null;
    }>;
    partnerIdsToDelete: number[];
}

// DTO Payloads (Internal Request Body Types)
export interface CreatePartnerDto {
    description: string;
    imageId: number;
}

export interface CreatePartnersSectionDto {
    title: string;
    description: string;
    partners: CreatePartnerDto[];
}

export interface UpdatePartnerDto {
    id: number;
    description: string;
    imageId: number;
}

export interface UpdatePartnersSectionDto {
    title: string;
    description: string;
    partnersToCreate: CreatePartnerDto[];
    partnersToUpdate: UpdatePartnerDto[];
    partnerIdsToDelete: number[];
}

export interface UpdatePartnerBannerDto {
    title: string;
    description: string;
    imageId: number | null;
}

// Response DTO
export interface PartnerBannerDto extends EntityWithDtoLocalizations<PartnerBannerLocalizationDto> {
    id: number;
    title: string;
    description: string;
    image: Image | null;
}

export interface PartnerBannerLocalization extends EntityLocalization {
    title: string;
    description: string;
}

export interface PartnerBannerLocalizationDto extends EntityLocalizationDto {
    entityId: number;
    title: string;
    description: string;
}

export interface CreatePartnerBannerLocalizationDto {
    entityId: number;
    languageId: number;
    title: string;
    description: string;
}

export interface UpdatePartnerBannerLocalizationDto {
    title: string;
    description: string;
}

export interface PartnerDto {
    id: number;
    description: string;
    image: Image;
}

export interface PartnersSectionDto extends EntityWithDtoLocalizations<EntityLocalizationDto> {
    id: number;
    title: string;
    description: string;
    partners: PartnerDto[];
}

export interface PartnerLocalizationDto {
    partnerId: number;
    description: string;
}

export interface PartnerLocalization {
    entityId: number;
    description: string;
}

export interface PartnerSectionLocalizationDto extends EntityLocalizationDto {
    entityId: number;
    title: string;
    description: string;
    partners: PartnerLocalizationDto[];
}

export interface CreatePartnerSectionLocalizationDto {
    entityId: number;
    languageId: number;
    title: string;
    description: string;
    partners: PartnerLocalizationDto[];
}

export interface UpdatePartnerSectionLocalizationDto {
    title: string;
    description: string;
    partners: PartnerLocalizationDto[];
}

export interface PartnersPageDataDto {
    banner: PartnerBannerDto;
    sections: PartnersSectionDto[];
}
