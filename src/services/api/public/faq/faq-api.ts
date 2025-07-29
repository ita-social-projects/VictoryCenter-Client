import { AxiosInstance } from 'axios';
import { API_ROUTES } from '../../../../const/urls/main-api';
import { FaqQuestion, PublicFaqQuestionDto } from '../../../../types/public/faq';

export const FaqApi = {
    getBySlug: async (client: AxiosInstance, slug: string): Promise<PublicFaqQuestionDto[]> => {
        const response = await client.get<PublicFaqQuestionDto[]>(API_ROUTES.FAQ.PUBLISHED_SLUG + `/${slug}`);
        return response.data.map(mapFaqQuestionDtoToFaqQuestion);
    },
};

export const mapFaqQuestionDtoToFaqQuestion = (dto: PublicFaqQuestionDto): FaqQuestion => ({
    id: dto.id,
    question: dto.question,
    answer: dto.answer,
});
