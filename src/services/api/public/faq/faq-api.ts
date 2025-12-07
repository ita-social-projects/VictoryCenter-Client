import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@const/common/api-routes/main-api';
import { PublishedFaqQuestion } from '@app-types/public/faq-section';

export const FaqApi = {
    getBySlug: async (client: AxiosInstance, slug: string): Promise<PublishedFaqQuestion[]> => {
        const response = await client.get<PublishedFaqQuestion[]>(`${API_ROUTES.FAQ.PUBLISHED_BY_SLUG}/${slug}`);
        return response.data;
    },
};
