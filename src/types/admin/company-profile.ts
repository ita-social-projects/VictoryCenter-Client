import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '@/types/common/language';

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

// Domain/UI localizations
export interface CompanyProfileContactLocalization extends EntityLocalization {
    entityId?: number;
    languageId?: number;
    address?: string;
    motto?: string;
    createdAt?: string;
}

export interface CompanyProfileRequisiteLocalization extends EntityLocalization {
    entityId?: number;
    languageId?: number;
    recipient?: string;
    address?: string;
    createdAt?: string;
}

// DTO localizations
export interface CompanyProfileContactLocalizationDto extends EntityLocalizationDto {
    entityId?: number;
    address?: string | null;
    motto?: string | null;
}

export interface CompanyProfileRequisiteLocalizationDto extends EntityLocalizationDto {
    entityId?: number;
    recipient?: string | null;
    address?: string | null;
}

// Domain/UI model
export interface CompanyProfileSocialLink {
    id?: number;
    profileId?: number;
    socialPlatform: SocialPlatform | number;
    url: string;
    createdAt?: string;
}

export interface CompanyProfileContact extends EntityWithLocalizations<CompanyProfileContactLocalization> {
    id?: number;
    profileId?: number;
    phone: string;
    address: string;
    email: string;
    correspondenceEmail: string;
    motto?: string;
    createdAt?: string;
}

export interface CompanyProfileRequisite extends EntityWithLocalizations<CompanyProfileRequisiteLocalization> {
    id?: number;
    profileId?: number;
    recipient: string;
    edrpou: string;
    address: string;
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
export interface CompanyProfileContactsDto extends EntityWithDtoLocalizations<CompanyProfileContactLocalizationDto> {
    phone?: string | null;
    address?: string | null;
    email?: string | null;
    correspondenceEmail?: string | null;
    motto?: string | null;
}

export interface CompanyProfileRequisiteDto extends EntityWithDtoLocalizations<CompanyProfileRequisiteLocalizationDto> {
    recipient?: string | null;
    edrpou?: string | null;
    address?: string | null;
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
