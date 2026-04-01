import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CompanyProfile, LocalizationLanguage } from '@/types/admin/company-profile';
import { CompanyProfilePatch } from '@/utils/functions/mappers/admin/company-profile/company-profile-mappers';

type BackendCompanyProfileDto = {
    contacts: any;
    requisites: any;
    socialLinks: any[];
};

const toFrontendCompanyProfile = (dto: BackendCompanyProfileDto): CompanyProfile => ({
    id: 1,
    contact: dto.contacts,
    requisite: dto.requisites,
    socialLinks: dto.socialLinks ?? [],
});

export const CompanyProfileApi = {
    get: async (client: AxiosInstance): Promise<{ profile: CompanyProfile; languages?: LocalizationLanguage[] }> => {
        const [profileRes, languagesRes] = await Promise.all([
            client.get<BackendCompanyProfileDto>(API_ROUTES.COMPANY_PROFILE.BASE),
            client.get<LocalizationLanguage[]>(API_ROUTES.LOCALIZATION_LANGUAGE.BASE),
        ]);

        return { profile: toFrontendCompanyProfile(profileRes.data), languages: languagesRes.data };
    },

    publish: async (
        client: AxiosInstance,
        patch: CompanyProfilePatch,
    ): Promise<{ profile: CompanyProfile; languages?: LocalizationLanguage[] }> => {
        const profileRes = await client.put<BackendCompanyProfileDto>(API_ROUTES.COMPANY_PROFILE.BASE, patch);
        const languagesRes = await client.get<LocalizationLanguage[]>(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);

        return { profile: toFrontendCompanyProfile(profileRes.data), languages: languagesRes.data };
    },
};
