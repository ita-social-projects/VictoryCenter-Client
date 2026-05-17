import {
    COMPANY_PROFILE_FORM_DEFAULTS,
    CompanyProfile,
    CompanyProfileContactLocalization,
    CompanyProfileFormValues,
    CompanyProfileRequisiteLocalization,
    CompanyProfileSocialLink,
    SocialPlatform,
} from '@/types/admin/company-profile';
import type { LocaleCode, LocalizationLanguage } from '@/types/common/language';

type LocalizationWithLanguageCode = {
    language?: { code?: string };
    localizationInfoDto?: { code?: string };
    languageId?: number;
};

function resolveLocaleCode(
    loc: (CompanyProfileContactLocalization | CompanyProfileRequisiteLocalization) & LocalizationWithLanguageCode,
    languages?: LocalizationLanguage[],
): LocaleCode | null {
    const directCode = loc.language?.code ?? loc.localizationInfoDto?.code;
    if (directCode === 'uk' || directCode === 'en') return directCode;

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

const SOCIAL_PLATFORM_FROM_BACKEND: Record<number, SocialPlatform> = {
    0: 'Instagram',
    1: 'Facebook',
    2: 'Telegram',
    3: 'YouTube',
    4: 'X',
    5: 'WhatsApp',
    6: 'LinkedIn',
    7: 'Viber',
};

const SOCIAL_PLATFORM_TO_BACKEND: Record<SocialPlatform, number> = {
    Instagram: 0,
    Facebook: 1,
    Telegram: 2,
    YouTube: 3,
    X: 4,
    WhatsApp: 5,
    LinkedIn: 6,
    Viber: 7,
};

const isKnownSocialPlatformNumber = (value: number): value is keyof typeof SOCIAL_PLATFORM_FROM_BACKEND =>
    value in SOCIAL_PLATFORM_FROM_BACKEND;

function normalizeSocialPlatform(value: SocialPlatform | number): SocialPlatform | null {
    if (typeof value === 'number') {
        if (isKnownSocialPlatformNumber(value)) {
            return SOCIAL_PLATFORM_FROM_BACKEND[value];
        }
        return null;
    }

    return value;
}

function mapSocialLinkToFormContact(link: CompanyProfileSocialLink): { platform: SocialPlatform; url: string } | null {
    const rawPlatform = (link as unknown as { socialPlatform: SocialPlatform | number }).socialPlatform;
    const platform = normalizeSocialPlatform(rawPlatform);

    if (!platform) return null;

    return {
        platform,
        url: link.url ?? '',
    };
}

function sortSocialLinks(
    platformsOrder: SocialPlatform[],
    links: CompanyProfileSocialLink[],
): CompanyProfileSocialLink[] {
    const order = new Map(platformsOrder.map((p, idx) => [p, idx]));

    return [...links].sort((a, b) => {
        const aRaw = (a as unknown as { socialPlatform: SocialPlatform | number }).socialPlatform;
        const bRaw = (b as unknown as { socialPlatform: SocialPlatform | number }).socialPlatform;

        const aPlatform = normalizeSocialPlatform(aRaw);
        const bPlatform = normalizeSocialPlatform(bRaw);

        const aOrder = aPlatform ? (order.get(aPlatform) ?? 999) : 999;
        const bOrder = bPlatform ? (order.get(bPlatform) ?? 999) : 999;

        return aOrder - bOrder;
    });
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

    const contactLocalizations = contact.localizations ?? [];
    const requisiteLocalizations = requisite.localizations ?? [];

    const contactEnLoc = contactLocalizations.find((loc) => resolveLocaleCode(loc as any, languages) === 'en');
    const requisiteEnLoc = requisiteLocalizations.find((loc) => resolveLocaleCode(loc as any, languages) === 'en');

    const sortedLinks = sortSocialLinks(platformsOrder, profile.socialLinks ?? []);
    const socialContacts = sortedLinks
        .map(mapSocialLinkToFormContact)
        .filter((item): item is { platform: SocialPlatform; url: string } => item !== null);

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

        socialContacts,
    };
}

export type CompanyProfilePatch = {
    contacts: {
        phone: string;
        address: string;
        email: string;
        correspondenceEmail: string;
        motto?: string;
        localizations: Array<{
            languageId?: number;
            address: string;
            motto?: string;
        }>;
    };
    requisites: {
        recipient: string;
        edrpou: string;
        address: string;
        localizations: Array<{
            languageId?: number;
            recipient: string;
            address: string;
        }>;
    };
    socialLinks: Array<{
        socialPlatform: number;
        url: string;
    }>;
};

export function mapFormValuesToCompanyProfilePatch(
    formValues: CompanyProfileFormValues,
    languages?: LocalizationLanguage[],
): CompanyProfilePatch {
    const ukLanguageId = getLanguageIdByCode(languages, 'uk');
    const enLanguageId = getLanguageIdByCode(languages, 'en');

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

    const requisitesAddressUk = (formValues.addressUa_requisites ?? '').trim();
    const requisitesAddressEn = (formValues.addressEn_requisites ?? '').trim();

    return {
        contacts: {
            phone,
            address: addressUk,
            email,
            correspondenceEmail,
            motto: mottoUk || undefined,
            localizations: [
                {
                    ...(ukLanguageId ? { languageId: ukLanguageId } : {}),
                    address: addressUk,
                    motto: mottoUk || undefined,
                },
                {
                    ...(enLanguageId ? { languageId: enLanguageId } : {}),
                    address: addressEn || addressUk,
                    motto: mottoEn || mottoUk || undefined,
                },
            ],
        },
        requisites: {
            recipient: recipientUk,
            edrpou,
            address: requisitesAddressUk,
            localizations: [
                {
                    ...(ukLanguageId ? { languageId: ukLanguageId } : {}),
                    recipient: recipientUk,
                    address: requisitesAddressUk,
                },
                {
                    ...(enLanguageId ? { languageId: enLanguageId } : {}),
                    recipient: recipientEn || recipientUk,
                    address: requisitesAddressEn || requisitesAddressUk,
                },
            ],
        },
        socialLinks: (formValues.socialContacts ?? []).map((c) => ({
            socialPlatform: SOCIAL_PLATFORM_TO_BACKEND[c.platform],
            url: (c.url ?? '').trim(),
        })),
    };
}
