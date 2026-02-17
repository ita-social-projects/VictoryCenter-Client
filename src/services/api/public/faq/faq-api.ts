import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { PublishedFaqQuestion, PublishedFaqQuestionDto } from '@/types/public/faq-section';

export const FaqApi = {
    getBySlug: async (client: AxiosInstance, slug: string): Promise<PublishedFaqQuestion[]> => {
        const response = await client.get<PublishedFaqQuestionDto[]>(`${API_ROUTES.FAQ.PUBLISHED_BY_SLUG}/${slug}`);
        return response.data.map(mapPublishedFaqQuestionDtoToPublishedFaqQuestion);
    },
};

export const mapPublishedFaqQuestionDtoToPublishedFaqQuestion = (
    dto: PublishedFaqQuestionDto,
): PublishedFaqQuestion => ({
    id: dto.id,
    questionText: dto.questionText,
    answerText: dto.answerText || '',
    localizations: dto.localizations?.map((loc) => ({
        language: loc.localizationInfoDto,
        translationStatus: loc.translationStatus,
        questionText: loc.questionText,
        answerText: loc.answerText,
    })),
});
