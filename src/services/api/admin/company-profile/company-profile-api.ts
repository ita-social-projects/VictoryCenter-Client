import { AxiosInstance } from 'axios';
import { CompanyProfile, LocalizationLanguage } from '@/types/admin/company-profile';
import { mockCompanyProfile, mockCompanyProfileLanguages } from '@/utils/mock-data/admin/company-profile';

export const CompanyProfileApi = {
    get: async (_client: AxiosInstance): Promise<{ profile: CompanyProfile; languages?: LocalizationLanguage[] }> => {
        await new Promise((r) => setTimeout(r, 200));
        return {
            profile: mockCompanyProfile,
            languages: mockCompanyProfileLanguages,
        };
    },
};
