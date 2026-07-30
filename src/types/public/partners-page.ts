import { Image } from '../common/image';
import { EntityLocalizationDto } from '../common/language';

export interface PartnerPage {
    banner: PartnersBanner;
    sections: PartnerSection[];
}

export interface PartnersBannerLocalizationDto extends EntityLocalizationDto {
    entityId: number;
    title: string;
    description: string;
}

export interface PartnersBanner {
    title: string;
    description: string;
    image?: Image;
    localizations?: PartnersBannerLocalizationDto[];
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
