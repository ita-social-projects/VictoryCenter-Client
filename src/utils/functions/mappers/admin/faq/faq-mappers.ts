import { FaqQuestionDto, VisitorPage, FaqQuestion } from '../../../../../types/admin/faq';

export function mapFaqQuestionDtoToModel(dto: FaqQuestionDto, pages: VisitorPage[]): FaqQuestion {
    const mappedPages = pages.filter((page) => dto.pageIds.includes(page.id));
    return {
        id: dto.id,
        questionText: dto.questionText,
        answerText: dto.answerText,
        status: dto.status,
        pages: mappedPages,
    };
}
