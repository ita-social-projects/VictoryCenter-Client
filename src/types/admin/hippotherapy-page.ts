import { Image, ImageValues } from '@/types/common/image';

export interface HippotherapyImageValue {
    image: Image | ImageValues | null;
    imageId: number | null;
}

export interface HippotherapyIntroSectionContent extends HippotherapyImageValue {
    title: string;
    description: string;
}

export interface HippotherapyTextCardContent {
    title: string;
    description: string;
}

export interface HippotherapyQuoteContent extends HippotherapyImageValue {
    quoteText: string;
    authorName: string;
}

export interface HippotherapyGalleryCardContent extends HippotherapyImageValue {
    description: string;
}

export interface HippotherapyGallerySectionContent {
    title: string;
    cards: HippotherapyGalleryCardContent[];
}

export interface HippoventionCenterSectionContent extends HippotherapyImageValue {
    title: string;
    pros: string;
    description: string;
}

export interface HippotherapyScientificReference {
    localId: string;
    id: number | null;
    name: string;
    url: string;
}

export interface HippotherapyScientificReferencesSectionContent {
    title: string;
    description: string;
    scientificReferences: HippotherapyScientificReference[];
}

export interface HippotherapyScientificReferenceDto {
    id: number | null;
    name: string;
    url: string;
}

export interface HippotherapyEthicsSectionContent extends HippotherapyImageValue {
    title: string;
    description: string;
    principles: string[];
}

export interface HippotherapyPageContentModel {
    introSection: HippotherapyIntroSectionContent;
    descriptionSection: HippotherapyTextCardContent;
    quoteSection: HippotherapyQuoteContent;
    hippoventionSection: HippotherapyTextCardContent;
    hippoventionCenterSection: HippoventionCenterSectionContent;
    advantagesSection: HippotherapyGallerySectionContent;
    analysisSection: HippotherapyTextCardContent;
    scientificReferencesSection: HippotherapyScientificReferencesSectionContent;
    anotherQuoteSection: HippotherapyQuoteContent;
    participantsSection: HippotherapyGallerySectionContent;
    ethicsSection: HippotherapyEthicsSectionContent;
}

export interface HippotherapyPageContentDto extends Omit<HippotherapyPageContentModel, 'scientificReferencesSection'> {
    scientificReferencesSection: {
        title: string;
        description: string;
        scientificReferences: HippotherapyScientificReferenceDto[];
    };
}
