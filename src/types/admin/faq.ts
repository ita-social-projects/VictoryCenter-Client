import { VisibilityStatus } from './common';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '../common/language';

export interface VisitorPage {
    id: number;
    slug: string;
    title: string;
}

export interface FaqQuestion extends FaqLocalizableFields, EntityWithLocalizations<FaqLocalization> {
    id: number;
    questionText: string;
    answerText: string;
    status: VisibilityStatus;
    pages: VisitorPage[];
}
export interface FaqLocalizableFields {
    questionText: string;
    answerText: string;
}

export interface FaqLocalizationDto extends EntityLocalizationDto, FaqLocalizableFields {
    entityId: number;
}

export type CreateFaqLocalizationDto = {
    entityId: number;
    languageId: number;
    questionText: string;
    answerText?: string | null;
};

export type UpdateFaqLocalizationDto = {
    questionText: string;
    answerText?: string | null;
};

export interface FaqQuestionDto extends FaqLocalizableFields, EntityWithDtoLocalizations<FaqLocalizationDto> {
    id: number;
    questionText: string;
    answerText: string;
    status: VisibilityStatus;
    pageIds: number[];
}

export interface FaqCreateUpdate {
    id: number | null;
    questionText: string;
    answerText: string;
    status: VisibilityStatus;
    pageIds: number[];
}

export interface ReorderFaq {
    pageId: number;
    orderedIds: number[];
}

export interface FaqSearchItemData {
    id: number;
    question: string;
    pages: string[];
}
export interface FaqLocalizationDto extends EntityLocalizationDto, FaqLocalizableFields {
    entityId: number;
}
export interface FaqLocalization extends EntityLocalization, FaqLocalizableFields {}
