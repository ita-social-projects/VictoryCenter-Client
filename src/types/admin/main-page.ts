import { Image, ImageValues } from '../common/image';
import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '@/types/common/language';

export type LocaleCode = 'uk' | 'en';

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

export interface ImpactStatisticLocalization extends EntityLocalization {
    entityId?: number;
    languageId?: number;
    title?: string;
}

export interface MetricLocalization extends EntityLocalization {
    entityId?: number;
    languageId?: number;
    name?: string;
}

export interface ImpactStatisticLocalizationDto extends EntityLocalizationDto {
    entityId?: number;
    title?: string | null;
}

export interface MetricLocalizationDto extends EntityLocalizationDto {
    entityId?: number;
    name?: string | null;
}

export interface Metric extends EntityWithLocalizations<MetricLocalization> {
    id?: number;
    value: number;
    name: string;
    type: MetricType;
    prefix?: MetricPrefix | null;
}

export interface ImpactStatistic extends EntityWithLocalizations<ImpactStatisticLocalization> {
    id?: number;
    title: string;
    image?: Image | ImageValues | null;
    metrics: Metric[];
}

export interface MainAboutUs {
    id: number;
    title: string;
    description: string;
}

export interface MainPartners {
    id: number;
    title: string;
    description: string;
}

export interface MainPage {
    id: number;
    title: string;
    description: string;
    image: Image | ImageValues | null;
    mainAboutUs: MainAboutUs | null;
    mainPartners: MainPartners | null;
    impactStatistics: ImpactStatistic | null;
}

export interface MetricDto extends EntityWithDtoLocalizations<MetricLocalizationDto> {
    id?: number;
    value?: number | null;
    name?: string | null;
    type?: MetricType | null;
    prefix?: MetricPrefix | null;
}

export interface ImpactStatisticDto extends EntityWithDtoLocalizations<ImpactStatisticLocalizationDto> {
    id?: number;
    title?: string | null;
    image?: Image | ImageValues | null;
    metrics?: MetricDto[] | null;
}

export interface MainPageDto {
    id?: number;
    title?: string | null;
    description?: string | null;
    image?: Image | ImageValues | null;
    mainAboutUs?: MainAboutUs | null;
    mainPartners?: MainPartners | null;
    impactStatistics?: ImpactStatisticDto | null;
}

export interface CreateMetricLocalizationDto {
    languageId?: number;
    name?: string;
}

export interface UpdateMetricLocalizationDto {
    languageId?: number;
    name?: string;
}

export interface CreateMetricDto {
    value: number;
    name: string;
    type: MetricType;
    prefix?: MetricPrefix | null;
    localization?: CreateMetricLocalizationDto | null;
}

export interface UpdateMetricDto {
    id?: number;
    value: number;
    name: string;
    type: MetricType;
    prefix?: MetricPrefix | null;
    localization?: UpdateMetricLocalizationDto | null;
}

export interface CreateImpactStatisticLocalizationDto {
    languageId?: number;
    title?: string;
}

export interface UpdateImpactStatisticLocalizationDto {
    languageId?: number;
    title?: string;
}

export interface CreateImpactStatisticDto {
    title: string;
    imageId?: number | null;
    metrics: CreateMetricDto[];
    localization?: CreateImpactStatisticLocalizationDto | null;
}

export interface UpdateImpactStatisticDto {
    id?: number;
    title: string;
    imageId?: number | null;
    metrics: UpdateMetricDto[];
    localization?: UpdateImpactStatisticLocalizationDto | null;
}

export interface TitleBlockFormValues {
    title: string;
    description: string;
    image: Image | ImageValues | null;
}

export const TITLE_BLOCK_FORM_DEFAULTS: TitleBlockFormValues = {
    title: '',
    description: '',
    image: null,
};

export interface AboutUsBlockFormValues {
    title: string;
    description: string;
}

export const ABOUT_US_BLOCK_FORM_DEFAULTS: AboutUsBlockFormValues = {
    title: '',
    description: '',
};

export interface StatisticsBlockFormValues {
    titleUa: string;
    titleEn: string;
    image: Image | ImageValues | null;
}

export const STATISTICS_BLOCK_FORM_DEFAULTS: StatisticsBlockFormValues = {
    titleUa: '',
    titleEn: '',
    image: null,
};
