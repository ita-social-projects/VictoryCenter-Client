import { FaqQuestionDto, VisitorPage, FaqQuestion } from '@/types/admin/faq';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

export function mapFaqQuestionDtoToModel(dto: FaqQuestionDto, pages: VisitorPage[]): FaqQuestion {
    const mappedPages = pages.filter((page) => dto.pageIds.includes(page.id));
    const mappedLocalizations = dto.localizations.map((localization) => mapLocalizationDtoToModel(localization));
    return {
        id: dto.id,
        questionText: dto.questionText,
        answerText: dto.answerText,
        status: dto.status,
        pages: mappedPages,
        localizations: mappedLocalizations,
    };
}
