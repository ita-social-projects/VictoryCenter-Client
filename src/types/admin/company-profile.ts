export type LocaleCode = 'uk' | 'en';

export type SocialPlatform =
    | 'Facebook'
    | 'Instagram'
    | 'Telegram'
    | 'YouTube'
    | 'X'
    | 'WhatsApp'
    | 'LinkedIn'
    | 'Viber';

export const SOCIAL_PLATFORMS_ORDER: readonly SocialPlatform[] = [
    'Instagram',
    'Facebook',
    'Telegram',
    'YouTube',
    'X',
    'WhatsApp',
    'LinkedIn',
    'Viber',
];

export interface LocalizationLanguage {
    id: number;
    code: string;
    name?: string;
}

export interface LocalizationInfoDto {
    id?: number;
    code?: string;
    name?: string;
}

export interface EntityLocalizationBase {
    entityId?: number;
    languageId?: number;
    language?: LocalizationLanguage;
    localizationInfoDto?: LocalizationInfoDto;
    translationStatus?: number;
    createdAt?: string;
}

export interface CompanyProfileContactLocalization extends EntityLocalizationBase {
    address?: string;
    motto?: string;
}

export interface CompanyProfileRequisiteLocalization extends EntityLocalizationBase {
    recipient?: string;
    address?: string;
}

// Domain/UI model (used by forms/components)
export interface CompanyProfileSocialLink {
    id?: number;
    profileId?: number;
    socialPlatform: SocialPlatform | number;
    url: string;
    createdAt?: string;
}

export interface CompanyProfileContact {
    id?: number;
    profileId?: number;
    phone: string;
    address: string;
    email: string;
    correspondenceEmail: string;
    motto?: string;
    localizations: CompanyProfileContactLocalization[];
    createdAt?: string;
}

export interface CompanyProfileRequisite {
    id?: number;
    profileId?: number;
    recipient: string;
    edrpou: string;
    address: string;
    localizations: CompanyProfileRequisiteLocalization[];
    createdAt?: string;
}

export interface CompanyProfile {
    id?: number;
    contact: CompanyProfileContact;
    requisite: CompanyProfileRequisite;
    socialLinks: CompanyProfileSocialLink[];
    createdAt?: string;
}

// Backend DTOs (contract)
export interface CompanyProfileContactLocalizationDto {
    entityId?: number;
    localizationInfoDto?: LocalizationInfoDto;
    translationStatus?: number;
    address?: string | null;
    motto?: string | null;
}

export interface CompanyProfileRequisiteLocalizationDto {
    entityId?: number;
    localizationInfoDto?: LocalizationInfoDto;
    translationStatus?: number;
    recipient?: string | null;
    address?: string | null;
}

export interface CompanyProfileContactsDto {
    phone?: string | null;
    address?: string | null;
    email?: string | null;
    correspondenceEmail?: string | null;
    motto?: string | null;
    localizations?: CompanyProfileContactLocalizationDto[] | null;
}

export interface CompanyProfileRequisiteDto {
    recipient?: string | null;
    edrpou?: string | null;
    address?: string | null;
    localizations?: CompanyProfileRequisiteLocalizationDto[] | null;
}

export interface CompanyProfileSocialLinkDto {
    id?: number;
    profileId?: number;
    socialPlatform: number | SocialPlatform;
    url?: string | null;
    createdAt?: string;
}

export interface CompanyProfileDto {
    contacts?: CompanyProfileContactsDto | null;
    requisites?: CompanyProfileRequisiteDto | null;
    socialLinks?: CompanyProfileSocialLinkDto[] | null;
}

// PUT payload DTOs
export interface UpdateCompanyProfileContactLocalizationDto {
    languageId?: number;
    address?: string;
    motto?: string;
}

export interface UpdateCompanyProfileRequisiteLocalizationDto {
    languageId?: number;
    recipient?: string;
    address?: string;
}

export interface UpdateCompanyProfileContactsDto {
    phone: string;
    address: string;
    email: string;
    correspondenceEmail: string;
    motto?: string;
    localizations: UpdateCompanyProfileContactLocalizationDto[];
}

export interface UpdateCompanyProfileRequisitesDto {
    recipient: string;
    edrpou: string;
    address: string;
    localizations: UpdateCompanyProfileRequisiteLocalizationDto[];
}

export interface UpdateCompanyProfileSocialLinkDto {
    socialPlatform: number;
    url: string;
}

export interface UpdateCompanyProfileDto {
    contacts: UpdateCompanyProfileContactsDto;
    requisites: UpdateCompanyProfileRequisitesDto;
    socialLinks: UpdateCompanyProfileSocialLinkDto[];
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
