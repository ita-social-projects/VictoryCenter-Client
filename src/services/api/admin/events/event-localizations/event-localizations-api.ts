import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CreateEventLocalizationDto, EventLocalizationDto, UpdateEventLocalizationDto } from '@/types/admin/events';

export const EventLocalizationsApi = {
    create: async (client: AxiosInstance, data: CreateEventLocalizationDto): Promise<EventLocalizationDto> => {
        const response = await client.post<EventLocalizationDto>(API_ROUTES.EVENT_LOCALIZATIONS.BASE, data);

        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateEventLocalizationDto,
    ): Promise<EventLocalizationDto> => {
        const response = await client.put<EventLocalizationDto>(
            `${API_ROUTES.EVENT_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );

        return response.data;
    },
};
