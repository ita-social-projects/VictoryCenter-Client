import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CreateEventsIntroSectionLocalizationDto,
    EventsIntroSectionLocalizationDto,
    UpdateEventsIntroSectionLocalizationDto,
} from '@/types/admin/events';

export const EventsIntroSectionLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        data: CreateEventsIntroSectionLocalizationDto,
    ): Promise<EventsIntroSectionLocalizationDto> => {
        const response = await client.post<EventsIntroSectionLocalizationDto>(
            API_ROUTES.EVENTS_INTRO_SECTION_LOCALIZATIONS.BASE,
            data,
        );

        return response.data;
    },

    update: async (
        client: AxiosInstance,
        entityId: number,
        languageId: number,
        data: UpdateEventsIntroSectionLocalizationDto,
    ): Promise<EventsIntroSectionLocalizationDto> => {
        const response = await client.put<EventsIntroSectionLocalizationDto>(
            `${API_ROUTES.EVENTS_INTRO_SECTION_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            data,
        );

        return response.data;
    },
};
