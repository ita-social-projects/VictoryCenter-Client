import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { HippotherapyPageContentDto } from '@/types/admin/hippotherapy-page';
import { HippotherapyAbout } from '@/types/public/hippotherapy-page';
import { mapHippotherapyPageToAbout } from '@/utils/functions/mappers/public/hippotherapy/hippotherapy';

export const HippotherapyApi = {
    get: async (): Promise<HippotherapyAbout> => {
        const response = await axiosInstance.get<HippotherapyPageContentDto>(API_ROUTES.HIPPOTHERAPY_PAGE.PUBLIC);
        return mapHippotherapyPageToAbout(response.data);
    },
};
