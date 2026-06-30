import { LocalizationInfo, TranslationStatus } from '@/types/common/language';
import { Image, ImageValues } from '../common/image';

// Enums

export enum MetricPrefix {
    None = 'None',
    Plus = 'Plus',
    Percent = 'Percent',
}

export enum MetricType {
    Partners = 'Partners',
    Programs = 'Programs',
    Raised = 'Raised',
    TherapyHours = 'TherapyHours',
}

// Public DTOs

export interface PublicMainPageLocalizationDto {
    entityId: number;
    localizationInfoDto: LocalizationInfo;
    translationStatus: TranslationStatus;
    title?: string;
    description?: string;
    name?: string;
}

export interface PublicMetricDto {
    id: number;
    value: number;
    name?: string;
    type: MetricType;
    prefix?: MetricPrefix | null;
    priority: number;
    localizations?: PublicMainPageLocalizationDto[];
}

export interface PublicImpactStatisticDto {
    id: number;
    title?: string;
    image?: Image | ImageValues | null;
    metrics?: PublicMetricDto[];
    localizations?: PublicMainPageLocalizationDto[];
}

export interface PublicMainAboutUsDto {
    id: number;
    title?: string;
    description?: string;
    localizations?: PublicMainPageLocalizationDto[];
}

export interface PublicMainPartnersDto {
    id: number;
    title?: string;
    description?: string;
    localizations?: PublicMainPageLocalizationDto[];
}

export interface PublicMainPageDto {
    id: number;
    title?: string;
    description?: string;
    image?: Image | ImageValues | null;
    mainAboutUs?: PublicMainAboutUsDto | null;
    mainPartners?: PublicMainPartnersDto | null;
    impactStatistics?: PublicImpactStatisticDto | null;
    localizations?: PublicMainPageLocalizationDto[];
}

// Domain/UI Models

export interface PublicMetric {
    id: number;
    value: number;
    name: string;
    type: MetricType;
    prefix: MetricPrefix | null;
}

export interface PublicImpactStatisticsBlock {
    title: string;
    image: Image | ImageValues | null;
    metrics: PublicMetric[];
}

export interface PublicAboutUsBlock {
    title: string;
    description: string;
}

export interface PublicPartnersBlock {
    title: string;
    description: string;
}

export interface PublicMainPageContent {
    title: string;
    description: string;
    image: Image | ImageValues | null;
    aboutUs: PublicAboutUsBlock | null;
    partners: PublicPartnersBlock | null;
    statistics: PublicImpactStatisticsBlock | null;
}

export interface MainIntroData {
    title: string;
    description: string;
    buttonText: string;
    image: string;
}
