import { VisibilityStatus } from './common';

export interface VisitorPage {
    id: number;
    slug: string;
    title: string;
}

export interface FaqQuestion {
    id: number;
    questionText: string;
    answerText: string;
    status: VisibilityStatus;
    pages: VisitorPage[];
}

export interface FaqQuestionDto {
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
