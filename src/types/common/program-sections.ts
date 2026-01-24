import { Image, ImageValues } from '../common/image';
import { ContentType } from './programs';

export enum ProgramSectionType {
    Title,
    Description,
    Image,
    Card,
    Author,
}

export enum ProgramSectionTemplate {
    QuadImagesBottom = 1,
    DualImagesBottom = 2,
    TextOnly = 3,
    TripleImagesBottom = 4,
    SingleImageBottom = 5,
    SingleImageTop = 6,
    SingleImageRight = 7,
}

export interface ProgramSectionContent {
    id?: number;
    sectionId?: number;
    contentType: ContentType;
    order: number;
    groupIndex?: number | null;
    title?: string | null;
    description?: string | null;
    image?: Image | ImageValues | null;
    author?: string | null;
}

export interface ProgramSection {
    id?: number;
    programId?: number;
    template: ProgramSectionTemplate;
    order: number;
    contents: ProgramSectionContent[];
}
