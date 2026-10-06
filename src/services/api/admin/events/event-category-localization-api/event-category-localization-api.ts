import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CreateEventCategoryLocalizationDto, EventCategoryLocalizationDto } from '@/types/admin/event-category';

export const EventCategoryLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateEventCategoryLocalizationDto,
    ): Promise<EventCategoryLocalizationDto> => {
        const response = await client.post<EventCategoryLocalizationDto>(
            API_ROUTES.EVENT_CATEGORIES_LOCALIZATIONS.BASE,
            data,
        );
        return response.data;
    },
};
