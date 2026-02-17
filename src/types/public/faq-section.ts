import { FaqLocalization, FaqLocalizationDto } from '@/types/admin/faq';

export interface PublishedFaqQuestion {
    id: number;
    questionText: string;
    answerText: string;
    localizations?: FaqLocalization[];
}

export interface PublishedFaqQuestionDto {
    id: number;
    questionText: string;
    answerText: string;
    localizations?: FaqLocalizationDto[];
}
