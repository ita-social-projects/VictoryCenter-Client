import { VisibilityStatus } from './common';

export interface VisitorPage {
    id: number;
    slug: string;
    title: string;
}

export interface FaqPlacement {
    pageId: number;
    questionId: number;
    priority: number;
}

export interface FaqQuestion {
    id: number;
    questionText: string;
    answerText: string;
    status: VisibilityStatus;
    pages: VisitorPage[];
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
