import { Image, ImageValues } from '../common/image';
import { ContentType } from './programs';
import { FaqQuestion } from '../admin/faq';

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
    DualTitleDescriptionPairs = 8,
    TripleTitleDescriptionPairs = 9,
    QuadTitleDescriptionPairs = 10,
    SingleTitleQuintupleDescription = 11,
    SingleTitleDescriptionAuthorPairs = 12,
    SingleTitleQuestionAnswerPairs = 13,
}

export enum ProgramSectionMode {
    Template = 'template',
    Edit = 'edit',
    View = 'view',
}

export interface FaqPairData {
    id?: number;
    questionText: string;
    answerText: string;
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
    imageId?: number | null;
    author?: string | null;
    faqQuestionId?: number | null;
    faqQuestion?: FaqQuestion | null;
}

export interface ProgramSection {
    id?: number;
    programId?: number;
    template: ProgramSectionTemplate;
    order: number;
    contents: ProgramSectionContent[];
}
