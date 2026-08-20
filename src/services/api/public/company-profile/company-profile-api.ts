import axios from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

export type PublicCompanyProfileDto = {
    contacts: {
        email?: string;
        phone?: string;
        address?: string;
        motto?: string;
        localizations?: Array<{
            localizationInfoDto?: { code?: string };
            address?: string;
            motto?: string;
        }>;
    };
    socialLinks?: Array<{
        socialPlatform: number;
        url: string;
    }>;
};

export const getPublicCompanyProfile = async () => {
    const { data } = await axios.get<PublicCompanyProfileDto>(`${API_ROUTES.BASE}/${API_ROUTES.COMPANY_PROFILE.BASE}`);
    return data;
};
