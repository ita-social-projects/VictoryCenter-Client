import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { CompanyProfile, LocalizationLanguage } from '@/types/admin/company-profile';
import { CompanyProfilePatch } from '@/utils/functions/mappers/admin/company-profile/company-profile-mappers';

type BackendCompanyProfileDto = {
    id?: number;
    contacts?: any;
    requisites?: any;
    socialLinks?: any[];
};

const toFrontendCompanyProfile = (dto: BackendCompanyProfileDto): CompanyProfile => ({
    id: dto.id ?? 1,
    contact: {
        ...(dto.contacts ?? {}),
        localizations: dto.contacts?.localizations ?? [],
    } as any,
    requisite: {
        ...(dto.requisites ?? {}),
        localizations: dto.requisites?.localizations ?? [],
    } as any,
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
        fallbackLanguages?: LocalizationLanguage[],
    ): Promise<{ profile: CompanyProfile; languages?: LocalizationLanguage[] }> => {
        const profileRes = await client.put<BackendCompanyProfileDto>(API_ROUTES.COMPANY_PROFILE.BASE, patch);

        let languages: LocalizationLanguage[] | undefined = fallbackLanguages;
        try {
            const languagesRes = await client.get<LocalizationLanguage[]>(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);
            languages = languagesRes.data;
        } catch (error) {
            // keep publish successful; languages refresh is best-effort
        }

        return { profile: toFrontendCompanyProfile(profileRes.data), languages };
    },
};
