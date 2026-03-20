export type LocaleCode = 'uk' | 'en';

export type SocialPlatform =
    | 'Facebook'
    | 'Instagram'
    | 'Telegram'
    | 'YouTube'
    | 'Twitter/X'
    | 'WhatsApp'
    | 'LinkedIn'
    | 'Viber';

export const SOCIAL_PLATFORMS_ORDER: SocialPlatform[] = [
    'Instagram',
    'Facebook',
    'Telegram',
    'YouTube',
    'Twitter/X',
    'WhatsApp',
    'LinkedIn',
    'Viber',
] as const;

export interface LocalizationLanguage {
    id: number;
    code: LocaleCode | string;
    name?: string;
}

export interface EntityLocalizationBase {
    entityId: number;
    languageId: number;
    language?: LocalizationLanguage;
    translationStatus?: number;
    createdAt?: string;
}

export interface CompanyProfileContactLocalization extends EntityLocalizationBase {
    address: string;
    motto?: string;
}

export interface CompanyProfileRequisiteLocalization extends EntityLocalizationBase {
    recipient: string;
    address: string;
}

export interface CompanyProfileSocialLink {
    id: number;
    profileId: number;
    socialPlatform: SocialPlatform;
    url: string;
    createdAt?: string;
}

export interface CompanyProfileContact {
    id: number;
    profileId: number;
    phone: string;
    address: string;
    email: string;
    correspondenceEmail: string;
    motto?: string;
    localizations: CompanyProfileContactLocalization[];
    createdAt?: string;
}

export interface CompanyProfileRequisite {
    id: number;
    profileId: number;
    recipient: string;
    edrpou: string;
    address: string;
    localizations: CompanyProfileRequisiteLocalization[];
    createdAt?: string;
}

export interface CompanyProfile {
    id: number;
    contact: CompanyProfileContact;
    requisite: CompanyProfileRequisite;
    socialLinks: CompanyProfileSocialLink[];
    createdAt?: string;
}

export type CompanyProfileSocialContactFormValue = {
    platform: SocialPlatform;
    url: string;
};

export interface CompanyProfileFormValues {
    phone: string;
    addressUa: string;
    addressEng: string;
    email: string;
    correspondenceEmail: string;
    mottoUa: string;
    mottoEng: string;
    requisitesUa: string;
    requisitesEn: string;
    companyRegistrationNumber: string;
    addressUa_requisites: string;
    addressEn_requisites: string;
    socialContacts: CompanyProfileSocialContactFormValue[];
}

export const COMPANY_PROFILE_FORM_DEFAULTS: CompanyProfileFormValues = {
    phone: '',
    addressUa: '',
    addressEng: '',
    email: '',
    correspondenceEmail: '',
    mottoUa: '',
    mottoEng: '',
    requisitesUa: '',
    requisitesEn: '',
    companyRegistrationNumber: '',
    addressUa_requisites: '',
    addressEn_requisites: '',
    socialContacts: [],
};
