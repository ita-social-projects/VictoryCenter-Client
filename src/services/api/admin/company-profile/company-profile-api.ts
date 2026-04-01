import { AxiosInstance } from 'axios';
import { CompanyProfile, LocalizationLanguage } from '@/types/admin/company-profile';
import { mockCompanyProfile, mockCompanyProfileLanguages } from '@/utils/mock-data/admin/company-profile';
import { CompanyProfilePatch } from '@/utils/functions/mappers/admin/company-profile/company-profile-mappers';

const deepClone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let storedProfile: CompanyProfile = deepClone(mockCompanyProfile);
let storedLanguages: LocalizationLanguage[] | undefined = deepClone(mockCompanyProfileLanguages);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const CompanyProfileApi = {
    get: async (_client: AxiosInstance): Promise<{ profile: CompanyProfile; languages?: LocalizationLanguage[] }> => {
        await delay(200);
        return {
            profile: storedProfile,
            languages: storedLanguages,
        };
    },

    publish: async (
        _client: AxiosInstance,
        patch: CompanyProfilePatch,
    ): Promise<{ profile: CompanyProfile; languages?: LocalizationLanguage[] }> => {
        await delay(200);

        storedProfile = {
            ...storedProfile,
            contact: {
                ...storedProfile.contact,
                phone: patch.contact.phone,
                address: patch.contact.address,
                email: patch.contact.email,
                correspondenceEmail: patch.contact.correspondenceEmail,
                motto: patch.contact.motto ?? '',
                localizations: storedProfile.contact.localizations.map((loc: any) => {
                    const langCode = loc.language?.code;
                    const locPatch = patch.contact.localizations.find((l) => l.languageCode === langCode);
                    if (!locPatch) return loc;

                    return {
                        ...loc,
                        address: locPatch.address,
                        motto: locPatch.motto ?? '',
                    };
                }),
            },
            requisite: {
                ...storedProfile.requisite,
                recipient: patch.requisite.recipient,
                edrpou: patch.requisite.edrpou,
                address: patch.requisite.address,
                localizations: storedProfile.requisite.localizations.map((loc: any) => {
                    const langCode = loc.language?.code;
                    const locPatch = patch.requisite.localizations.find((l) => l.languageCode === langCode);
                    if (!locPatch) return loc;

                    return {
                        ...loc,
                        recipient: locPatch.recipient,
                        address: locPatch.address,
                    };
                }),
            },
            socialLinks: patch.socialLinks.map((l, idx) => ({
                id: storedProfile.socialLinks[idx]?.id ?? idx + 1,
                profileId: storedProfile.id,
                socialPlatform: l.socialPlatform,
                url: l.url,
            })),
        };

        return { profile: storedProfile, languages: storedLanguages };
    },

    __resetMocks: () => {
        storedProfile = deepClone(mockCompanyProfile);
        storedLanguages = deepClone(mockCompanyProfileLanguages);
    },
};
