import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '@/types/common/language';
import { Image, ImageValues } from '../common/image';

export enum MetricPrefix {
    None = 0,
    Plus = 1,
    Percent = 2,
}

export enum MetricType {
    Partners = 0,
    Programs = 1,
    Raised = 2,
    TherapyHours = 3,
}

// Domain/UI Localizations

export interface MainPageLocalization extends EntityLocalization {
    entityId?: number;
    languageId?: number;
    title?: string;
    description?: string;
}

export interface MainAboutUsLocalization extends EntityLocalization {
    entityId?: number;
    languageId?: number;
    title?: string;
    description?: string;
}

export interface MainPartnersLocalization extends EntityLocalization {
    entityId?: number;
    languageId?: number;
    title?: string;
    description?: string;
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
    value?: string | null;
}

// Domain/UI Models

export interface Metric extends EntityWithLocalizations<MetricLocalization> {
    id?: number;
    value: number;
    name: string;
    type: MetricType;
    prefix?: MetricPrefix | null;
    isAutoSynced?: boolean;
    isHidden: boolean;
    priority: number;
}

export interface ImpactStatistic extends EntityWithLocalizations<ImpactStatisticLocalization> {
    id?: number;
    title: string;
    image?: Image | ImageValues | null;
    metrics: Metric[];
}

export interface MainAboutUs extends EntityWithLocalizations<MainAboutUsLocalization> {
    id?: number;
    title: string;
    description: string;
}

export interface MainPartners extends EntityWithLocalizations<MainPartnersLocalization> {
    id?: number;
    title: string;
    description: string;
}

export interface MainPage extends EntityWithLocalizations<MainPageLocalization> {
    id?: number;
    title: string;
    description: string;
    image: Image | ImageValues | null;
    mainAboutUs: MainAboutUs | null;
    mainPartners: MainPartners | null;
    impactStatistics: ImpactStatistic | null;
}

// GET DTOs

export interface MainPageLocalizationDto extends EntityLocalizationDto {
    entityId?: number;
    title?: string | null;
    description?: string | null;
}

export interface MainAboutUsLocalizationDto extends EntityLocalizationDto {
    entityId?: number;
    title?: string | null;
    description?: string | null;
}

export interface MainPartnersLocalizationDto extends EntityLocalizationDto {
    entityId?: number;
    title?: string | null;
    description?: string | null;
}

export interface ImpactStatisticLocalizationDto extends EntityLocalizationDto {
    entityId?: number;
    title?: string | null;
}

export interface MetricLocalizationDto extends EntityLocalizationDto {
    entityId?: number;
    name?: string | null;
    value?: string | null;
}

export interface MetricDto extends EntityWithDtoLocalizations<MetricLocalizationDto> {
    id?: number;
    value?: number;
    name?: string | null;
    type?: MetricType;
    prefix?: MetricPrefix | null;
    isAutoSynced?: boolean;
    isHidden?: boolean;
    priority?: number;
}

export interface ImpactStatisticDto extends EntityWithDtoLocalizations<ImpactStatisticLocalizationDto> {
    id?: number;
    title?: string | null;
    image?: Image | ImageValues | null;
    metrics?: MetricDto[] | null;
}

export interface MainAboutUsDto extends EntityWithDtoLocalizations<MainAboutUsLocalizationDto> {
    id?: number;
    title?: string | null;
    description?: string | null;
}

export interface MainPartnersDto extends EntityWithDtoLocalizations<MainPartnersLocalizationDto> {
    id?: number;
    title?: string | null;
    description?: string | null;
}

export interface MainPageDto extends EntityWithDtoLocalizations<MainPageLocalizationDto> {
    id?: number;
    title?: string | null;
    description?: string | null;
    image?: Image | ImageValues | null;
    mainAboutUs?: MainAboutUsDto | null;
    mainPartners?: MainPartnersDto | null;
    impactStatistics?: ImpactStatisticDto | null;
}

// POST DTOs

export interface CreateMetricLocalizationDto {
    languageId?: number;
    name?: string;
    value?: string | null;
}

export interface CreateMetricDto {
    value: number;
    name: string;
    type: MetricType;
    prefix?: MetricPrefix | null;
    localization?: CreateMetricLocalizationDto | null;
}

export interface CreateImpactStatisticLocalizationDto {
    languageId?: number;
    title?: string;
}

export interface CreateImpactStatisticDto {
    title: string;
    imageId?: number | null;
    metrics: CreateMetricDto[];
    localization?: CreateImpactStatisticLocalizationDto | null;
}

export interface CreateMainAboutUsDto {
    title: string;
    description: string;
}

export interface CreateMainPartnersDto {
    title: string;
    description: string;
}

export interface CreateMainPageDto {
    title: string;
    description: string;
    imageId?: number | null;
    mainAboutUs?: CreateMainAboutUsDto | null;
    mainPartners?: CreateMainPartnersDto | null;
    impactStatistics?: CreateImpactStatisticDto | null;
}

// PUT DTOs

export interface UpdateMetricLocalizationDto {
    languageId?: number;
    name?: string;
    value?: string | null;
}

export interface UpdateImpactStatisticLocalizationDto {
    languageId?: number;
    title?: string;
}

export interface UpdateMainAboutUsLocalizationDto {
    languageId?: number;
    title?: string;
    description?: string;
}

export interface UpdateMainPartnersLocalizationDto {
    languageId?: number;
    title?: string;
    description?: string;
}

export interface UpdateMainPageLocalizationDto {
    languageId?: number;
    title?: string;
    description?: string;
}

export interface UpdateMetricDto {
    id?: number;
    value: number;
    name: string;
    type: MetricType;
    prefix?: MetricPrefix | null;
    isAutoSynced?: boolean;
    localization?: UpdateMetricLocalizationDto | null;
}

export interface UpdateImpactStatisticDto {
    id?: number;
    title: string;
    imageId?: number | null;
    metrics: UpdateMetricDto[];
    localizations?: UpdateImpactStatisticLocalizationDto[];
}

export interface UpdateMainAboutUsDto {
    title: string;
    description: string;
    localizations?: UpdateMainAboutUsLocalizationDto[];
}

export interface UpdateMainPartnersDto {
    title: string;
    description: string;
    localizations?: UpdateMainPartnersLocalizationDto[];
}

export interface UpdateMainPageDto {
    title: string;
    description: string;
    imageId?: number | null;
    localizations?: UpdateMainPageLocalizationDto[];
    mainAboutUs?: UpdateMainAboutUsDto | null;
    mainPartners?: UpdateMainPartnersDto | null;
    impactStatistics?: UpdateImpactStatisticDto | null;
}

// METRIC SPECIFIC OPERATIONS DTOs

export interface ReorderMetricsDto {
    statisticId: number;
    orderedIds: number[];
}

export interface UpdateMetricVisibilityDto {
    isHidden: boolean;
}

// Form Values & Defaults

export interface MainPageFormValues {
    // Title Block
    titleUa: string;
    titleEn: string;
    descriptionUa: string;
    descriptionEn: string;
    image: Image | ImageValues | null;

    // About Us Block
    aboutUsTitleUa: string;
    aboutUsTitleEn: string;
    aboutUsDescriptionUa: string;
    aboutUsDescriptionEn: string;

    // Partners Block
    partnersTitleUa: string;
    partnersTitleEn: string;
    partnersDescriptionUa: string;
    partnersDescriptionEn: string;

    // Impact Statistics Block
    statisticsTitleUa: string;
    statisticsTitleEn: string;
    statisticsImage: Image | ImageValues | null;
    metrics?: Metric[];
}

export const MAIN_PAGE_FORM_DEFAULTS: MainPageFormValues = {
    titleUa: '',
    titleEn: '',
    descriptionUa: '',
    descriptionEn: '',
    image: null,

    aboutUsTitleUa: '',
    aboutUsTitleEn: '',
    aboutUsDescriptionUa: '',
    aboutUsDescriptionEn: '',

    partnersTitleUa: '',
    partnersTitleEn: '',
    partnersDescriptionUa: '',
    partnersDescriptionEn: '',

    statisticsTitleUa: '',
    statisticsTitleEn: '',
    statisticsImage: null,
    metrics: [],
};
