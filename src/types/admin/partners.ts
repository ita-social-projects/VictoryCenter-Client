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
