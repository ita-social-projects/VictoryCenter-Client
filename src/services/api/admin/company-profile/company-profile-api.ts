import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import {
    CompanyProfile,
    CompanyProfileContactLocalization,
    CompanyProfileDto,
    CompanyProfileRequisiteLocalization,
    CompanyProfileSocialLink,
    LocalizationLanguage,
    UpdateCompanyProfileDto,
} from '@/types/admin/company-profile';
import { CompanyProfilePatch } from '@/utils/functions/mappers/admin/company-profile/company-profile-mappers';

const toContactLocalizations = (dto: CompanyProfileDto): CompanyProfileContactLocalization[] =>
    (dto.contacts?.localizations ?? []).map((loc) => ({
        entityId: loc.entityId,
        localizationInfoDto: loc.localizationInfoDto,
        translationStatus: loc.translationStatus,
        address: loc.address ?? undefined,
        motto: loc.motto ?? undefined,
    }));

const toRequisiteLocalizations = (dto: CompanyProfileDto): CompanyProfileRequisiteLocalization[] =>
    (dto.requisites?.localizations ?? []).map((loc) => ({
        entityId: loc.entityId,
        localizationInfoDto: loc.localizationInfoDto,
        translationStatus: loc.translationStatus,
        recipient: loc.recipient ?? undefined,
        address: loc.address ?? undefined,
    }));

const toSocialLinks = (dto: CompanyProfileDto): CompanyProfileSocialLink[] =>
    (dto.socialLinks ?? []).map((link) => ({
        id: link.id,
        profileId: link.profileId,
        socialPlatform: link.socialPlatform,
        url: link.url ?? '',
        createdAt: link.createdAt,
    }));

const toFrontendCompanyProfile = (dto: CompanyProfileDto): CompanyProfile => ({
    id: undefined, // backend CompanyProfileDto currently has no root id
    contact: {
        id: undefined,
        profileId: undefined,
        phone: dto.contacts?.phone ?? '',
        address: dto.contacts?.address ?? '',
        email: dto.contacts?.email ?? '',
        correspondenceEmail: dto.contacts?.correspondenceEmail ?? '',
        motto: dto.contacts?.motto ?? undefined,
        localizations: toContactLocalizations(dto),
        createdAt: undefined,
    },
    requisite: {
        id: undefined,
        profileId: undefined,
        recipient: dto.requisites?.recipient ?? '',
        edrpou: dto.requisites?.edrpou ?? '',
        address: dto.requisites?.address ?? '',
        localizations: toRequisiteLocalizations(dto),
        createdAt: undefined,
    },
    socialLinks: toSocialLinks(dto),
    createdAt: undefined,
});

const toUpdateDto = (patch: CompanyProfilePatch): UpdateCompanyProfileDto => ({
    contacts: {
        phone: patch.contacts.phone,
        address: patch.contacts.address,
        email: patch.contacts.email,
        correspondenceEmail: patch.contacts.correspondenceEmail,
        motto: patch.contacts.motto,
        localizations: patch.contacts.localizations.map((loc) => ({
            languageId: loc.languageId,
            address: loc.address,
            motto: loc.motto,
        })),
    },
    requisites: {
        recipient: patch.requisites.recipient,
        edrpou: patch.requisites.edrpou,
        address: patch.requisites.address,
        localizations: patch.requisites.localizations.map((loc) => ({
            languageId: loc.languageId,
            recipient: loc.recipient,
            address: loc.address,
        })),
    },
    socialLinks: patch.socialLinks.map((link) => ({
        socialPlatform: link.socialPlatform,
        url: link.url,
    })),
});

export const CompanyProfileApi = {
    get: async (client: AxiosInstance): Promise<{ profile: CompanyProfile; languages?: LocalizationLanguage[] }> => {
        const [profileRes, languagesRes] = await Promise.all([
            client.get<CompanyProfileDto>(API_ROUTES.COMPANY_PROFILE.BASE),
            client.get<LocalizationLanguage[]>(API_ROUTES.LOCALIZATION_LANGUAGE.BASE),
        ]);

        return {
            profile: toFrontendCompanyProfile(profileRes.data),
            languages: languagesRes.data,
        };
    },

    publish: async (
        client: AxiosInstance,
        patch: CompanyProfilePatch,
        fallbackLanguages?: LocalizationLanguage[],
    ): Promise<{ profile: CompanyProfile; languages?: LocalizationLanguage[] }> => {
        const response = await client.put<CompanyProfileDto>(API_ROUTES.COMPANY_PROFILE.BASE, toUpdateDto(patch));

        const languages = await client
            .get<LocalizationLanguage[]>(API_ROUTES.LOCALIZATION_LANGUAGE.BASE)
            .then((res) => res.data)
            .catch(() => fallbackLanguages);

        return {
            profile: toFrontendCompanyProfile(response.data),
            languages,
        };
    },
};
