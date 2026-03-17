import { Image, ImageValues } from '../common/image';
import { ContentType } from './programs';
import { FaqQuestion } from '../admin/faq';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from './language';

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

export interface FaqSectionQuestionDto {
    id?: number;
    questionText: string;
    answerText: string;
}

export interface HippotherapyProgramSectionContentDto
    extends ProgramSectionContentLocalizableFields,
        EntityWithDtoLocalizations<HippotherapyProgramSectionContentLocalizationDto> {
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
export interface HippotherapyProgramSectionContent
    extends ProgramSectionContentLocalizableFields,
        EntityWithLocalizations<HippotherapyProgramSectionContentLocalization> {
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

export interface HippotherapyProgramSectionDto {
    id?: number;
    programId?: number;
    template: ProgramSectionTemplate;
    order: number;
    contents: HippotherapyProgramSectionContentDto[];
}

export interface CreateFaqQuestionDto {
    id?: number | null;
    questionText: string;
    answerText: string;
}

export interface CreateProgramSectionContentDto {
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
    faqQuestion?: CreateFaqQuestionDto | null;
}

export interface CreateHippotherapyProgramSectionDto {
    id?: number;
    programId?: number;
    template: ProgramSectionTemplate;
    order: number;
    contents: CreateProgramSectionContentDto[];
}
export interface ProgramSectionContentLocalizableFields {
    title?: string | null;
    description?: string | null;
    author?: string | null;
    questionText?: string | null;
    answerText?: string | null;
}
export interface HippotherapyProgramSectionContentLocalization
    extends EntityLocalization,
        ProgramSectionContentLocalizableFields {}

export interface HippotherapyProgramSectionContentLocalizationDto
    extends EntityLocalizationDto,
        ProgramSectionContentLocalizableFields {
    entityId: number;
}
