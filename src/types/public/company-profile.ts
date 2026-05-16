import { LocalizationInfo, TranslationStatus } from '@/types/common/language';

export enum SocialPlatform {
    Instagram = 0,
    Facebook = 1,
    Telegram = 2,
    Youtube = 3,
}

export interface PublicCompanyProfileLocalizationDto {
    entityId: number;
    localizationInfoDto: LocalizationInfo;
    translationStatus: TranslationStatus;
    address?: string;
    motto?: string;
    recipient?: string;
}

export interface PublicCompanyProfileContactsDto {
    localizations?: PublicCompanyProfileLocalizationDto[];
    phone?: string;
    address?: string;
    email?: string;
    correspondenceEmail?: string;
    motto?: string;
}

export interface PublicCompanyProfileRequisitesDto {
    localizations?: PublicCompanyProfileLocalizationDto[];
    recipient?: string;
    edrpou?: string;
    address?: string;
}

export interface PublicCompanyProfileSocialLinkDto {
    socialPlatform: SocialPlatform;
    url: string;
}

export interface PublicCompanyProfileDto {
    contacts: PublicCompanyProfileContactsDto;
    requisites: PublicCompanyProfileRequisitesDto;
    socialLinks: PublicCompanyProfileSocialLinkDto[];
}

export interface ContactUsSocialLink {
    label: string;
    url: string;
}

export interface ContactUsDetails {
    email: string;
    phone: string;
    address: string;
    motto: string;
}

export interface ContactUsPageContent {
    title: string;
    description: string;
    contacts: ContactUsDetails;
    socialLinks: ContactUsSocialLink[];
}
