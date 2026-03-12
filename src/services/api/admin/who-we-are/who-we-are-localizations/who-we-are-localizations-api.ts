import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { ContentLocalizationDto, CreateContentLocalizationDto } from '@/types/admin/who-we-are';
import { SectionType } from '@/types/common/about-us';
import { AxiosInstance } from 'axios';

export const WhoWeAreLocalizationsApi = {
    create: async (
        client: AxiosInstance,
        sectionType: SectionType,
        data: CreateContentLocalizationDto[],
    ): Promise<ContentLocalizationDto[]> => {
        const response = await client.post<ContentLocalizationDto[]>(
            `${API_ROUTES.WHO_WE_ARE_CONTENT_LOCALIZATIONS.BASE}/${sectionType}`,
            data,
        );
        return response.data;
    },
};
