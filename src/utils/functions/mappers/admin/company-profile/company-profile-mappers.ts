import {
    COMPANY_PROFILE_FORM_DEFAULTS,
    CompanyProfile,
    CompanyProfileContactLocalization,
    CompanyProfileFormValues,
    CompanyProfileRequisiteLocalization,
    CompanyProfileSocialLink,
    LocaleCode,
    LocalizationLanguage,
    SocialPlatform,
} from '@/types/admin/company-profile';

type LocalizationWithLanguageCode = { language?: { code?: string } };

function resolveLocaleCode(
    loc: (CompanyProfileContactLocalization | CompanyProfileRequisiteLocalization) & LocalizationWithLanguageCode,
    languages?: LocalizationLanguage[],
): LocaleCode | null {
    const codeFromLoc = loc.language?.code;
    if (codeFromLoc === 'uk' || codeFromLoc === 'en') return codeFromLoc;

    if (!languages?.length) return null;

    const lang = languages.find((l) => l.id === loc.languageId);
    const code = lang?.code;

    return code === 'uk' || code === 'en' ? code : null;
}

function getLanguageIdByCode(languages: LocalizationLanguage[] | undefined, code: LocaleCode): number | null {
    if (!languages?.length) return null;

    const lang = languages.find((l) => l.code === code);
    return lang?.id ?? null;
}

function sortSocialLinks(
    platformsOrder: SocialPlatform[],
    links: CompanyProfileSocialLink[],
): CompanyProfileSocialLink[] {
    const order = new Map(platformsOrder.map((p, idx) => [p, idx]));
    return [...links].sort((a, b) => (order.get(a.socialPlatform) ?? 999) - (order.get(b.socialPlatform) ?? 999));
}

export function mapCompanyProfileToFormValues(
    profile: CompanyProfile,
    languages?: LocalizationLanguage[],
    platformsOrder: SocialPlatform[] = [
        'Instagram',
        'Facebook',
        'Telegram',
        'YouTube',
        'X',
        'WhatsApp',
        'LinkedIn',
        'Viber',
    ],
): CompanyProfileFormValues {
    const contact = profile.contact;
    const requisite = profile.requisite;

    const contactEnLoc = contact.localizations.find((loc) => resolveLocaleCode(loc as any, languages) === 'en');
    const requisiteEnLoc = requisite.localizations.find((loc) => resolveLocaleCode(loc as any, languages) === 'en');

    const sortedLinks = sortSocialLinks(platformsOrder, profile.socialLinks);

    return {
        ...COMPANY_PROFILE_FORM_DEFAULTS,

        phone: contact.phone ?? '',

        addressUa: contact.address ?? '',
        addressEng: contactEnLoc?.address ?? contact.address ?? '',
        email: contact.email ?? '',
        correspondenceEmail: contact.correspondenceEmail ?? '',
        mottoUa: contact.motto ?? '',
        mottoEng: contactEnLoc?.motto ?? contact.motto ?? '',

        requisitesUa: requisite.recipient ?? '',
        requisitesEn: requisiteEnLoc?.recipient ?? requisite.recipient ?? '',
        companyRegistrationNumber: requisite.edrpou ?? '',
        addressUa_requisites: requisite.address ?? '',
        addressEn_requisites: requisiteEnLoc?.address ?? requisite.address ?? '',

        socialContacts: sortedLinks.map((l) => ({
            platform: l.socialPlatform,
            url: l.url ?? '',
        })),
    };
}

export type CompanyProfilePatch = {
    contact: {
        phone: string;
        address: string;
        email: string;
        correspondenceEmail: string;
        motto?: string;
        localizations: Array<{
            languageCode: LocaleCode;
            address: string;
            motto?: string;
        }>;
    };
    requisite: {
        recipient: string;
        edrpou: string;
        address: string;
        localizations: Array<{
            languageCode: LocaleCode;
            recipient: string;
            address: string;
        }>;
    };
    socialLinks: Array<{
        socialPlatform: SocialPlatform;
        url: string;
    }>;
};

export function mapFormValuesToCompanyProfilePatch(
    formValues: CompanyProfileFormValues,
    languages?: LocalizationLanguage[],
): CompanyProfilePatch {
    const ukLanguageId = getLanguageIdByCode(languages, 'uk');
    const enLanguageId = getLanguageIdByCode(languages, 'en');

    // Basic trim (do not remove inner spaces).
    const phone = (formValues.phone ?? '').trim();
    const email = (formValues.email ?? '').trim();
    const correspondenceEmail = (formValues.correspondenceEmail ?? '').trim();

    const addressUk = (formValues.addressUa ?? '').trim();
    const addressEn = (formValues.addressEng ?? '').trim();

    const mottoUk = (formValues.mottoUa ?? '').trim();
    const mottoEn = (formValues.mottoEng ?? '').trim();

    const recipientUk = (formValues.requisitesUa ?? '').trim();
    const recipientEn = (formValues.requisitesEn ?? '').trim();

    const edrpou = (formValues.companyRegistrationNumber ?? '').trim();

    // Prefer using requisites-specific fields if present (to avoid collision).
    const requisitesAddressUk = ((formValues.addressUa_requisites ?? '') || '').trim();
    const requisitesAddressEn = ((formValues.addressEn_requisites ?? '') || '').trim();

    return {
        contact: {
            phone,
            address: addressUk,
            email,
            correspondenceEmail,
            motto: mottoUk || undefined,
            localizations: [
                {
                    languageCode: 'uk',
                    address: addressUk,
                    motto: mottoUk || undefined,
                    ...(ukLanguageId ? { languageId: ukLanguageId } : {}),
                } as any,
                {
                    languageCode: 'en',
                    address: addressEn || addressUk,
                    motto: mottoEn || mottoUk || undefined,
                    ...(enLanguageId ? { languageId: enLanguageId } : {}),
                } as any,
            ],
        },
        requisite: {
            recipient: recipientUk,
            edrpou,
            address: requisitesAddressUk,
            localizations: [
                {
                    languageCode: 'uk',
                    recipient: recipientUk,
                    address: requisitesAddressUk,
                    ...(ukLanguageId ? { languageId: ukLanguageId } : {}),
                } as any,
                {
                    languageCode: 'en',
                    recipient: recipientEn || recipientUk,
                    address: requisitesAddressEn || requisitesAddressUk,
                    ...(enLanguageId ? { languageId: enLanguageId } : {}),
                } as any,
            ],
        },
        socialLinks: (formValues.socialContacts ?? []).map((c) => ({
            socialPlatform: c.platform,
            url: (c.url ?? '').trim(),
        })),
    };
}
