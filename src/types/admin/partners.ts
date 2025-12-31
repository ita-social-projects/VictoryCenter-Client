import { Image, ImageValues } from '../common/image';

export type PartnerBanner = {
    title: string;
    description: string;
    image: Image | ImageValues | null;
    imageId: number | null;
};

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
};

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
export interface PartnerBannerDto {
    id: number;
    title: string;
    description: string;
    image: Image | null;
}

export interface PartnerDto {
    id: number;
    description: string;
    image: Image;
}

export interface PartnersSectionDto {
    id: number;
    title: string;
    description: string;
    partners: PartnerDto[];
}

export interface PartnersPageDataDto {
    banner: PartnerBannerDto;
    sections: PartnersSectionDto[];
}
