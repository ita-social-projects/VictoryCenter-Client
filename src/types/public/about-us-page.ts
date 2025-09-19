import { ContentType, SectionType } from '../common/about-us';
import { Image } from '../common/image';

export type AboutUsSection = {
    sectionType: SectionType;
    contents: AboutUsContent[];
};

export type AboutUsContent = {
    id: number;
    contentType: ContentType;
    image: Image | null;
    description: string | null;
    title: string | null;
};
