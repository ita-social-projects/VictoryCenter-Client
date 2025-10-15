import { Image, ImageValues } from '../common/image';

export type Partner = {
    id: number;
    description: string;
    image: Image | ImageValues | null;
    imageId: number | null;
};

export type PartnerBanner = {
    id: number;
    title: string;
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

export interface PartnerBannerDto {
    id: number;
    title: string;
    description: string;
    image: Image;
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

export interface PartnerBannerCreateUpdateRequest {
    title: string;
    description: string;
    imageId: number;
    image: Image | ImageValues | null;
}

export interface PartnersSectionCreateRequest {
    title: string;
    description: string;
    partners: Array<{
        description: string;
        imageId: number;
    }>;
}

export interface PartnersSectionUpdateRequest {
    title: string;
    description: string;
    partnersToUpdate: Array<{
        id: number | null;
        description: string;
        imageId: number;
    }>;
    partnerIdsToDelete: number[];
}
