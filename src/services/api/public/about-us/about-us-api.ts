import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { AboutUsSection, AboutUsSectionDto } from '@/types/public/about-us-page';
import { axiosInstance } from '@/services/api/axios';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';

const mapAboutUsSection = (dto: AboutUsSectionDto): AboutUsSection => ({
    ...dto,
    contents: dto.contents.map((contentDto) => ({
        ...contentDto,
        localizations: contentDto.localizations?.map((loc) => mapLocalizationDtoToModel(loc)),
    })),
});

export const AboutUsApi = {
    get: async (): Promise<AboutUsSection[]> => {
        const response = await axiosInstance.get<AboutUsSectionDto[]>(`${API_ROUTES.WHO_WE_ARE.PUBLIC}`);
        return response.data.map(mapAboutUsSection);
    },
};
