import { API_ROUTES } from '../../../../../const/common/api-routes/main-api';
import { LocalizationLanguage } from '../../../../../types/common/language';
import { axiosInstance } from '../../../axios';

export const localizationLanguagesDataFetch = async (): Promise<LocalizationLanguage[]> => {
    const response = await axiosInstance.get<LocalizationLanguage[]>(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);

    return response.data;
};
