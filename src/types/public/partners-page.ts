import { Image } from '../common/image';

export interface PartnerPage {
    banner: PartnersBanner;
    sections: PartnerSection[];
}

export interface PartnersBanner {
    title: string;
    description: string;
    image?: Image;
}

export interface PartnerSection {
    id: number;
    title: string;
    description: string;
    partners: Partner[];
}

export interface Partner {
    id: number;
    description: string;
    image: Image;
}
