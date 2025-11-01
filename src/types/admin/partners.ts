import { Image, ImageValues } from '../common/image';

// =====================================
// БАЗОВІ ТИПИ
// =====================================

export type Partner = {
    id: number;
    description: string;
    image: Image | ImageValues | null;
    imageId: number | null;
};

export type PartnerBanner = {
    id: number;
    title: string;
    description: string;
    image: Image | ImageValues | null;
    imageId: number | null;
};

export type PartnerSection = {
    id: number;
    title: string;
    description: string;
    partners: Partner[];
    orderIndex?: number;
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

// =====================================
// DTO ТИПИ (ВІДПОВІДІ ВІД СЕРВЕРА)
// =====================================

export interface PartnerBannerDto {
    id: number;
    title: string;
    description: string;
    image: Image | null;
}

export interface PartnerDto {
    id: number;
    description: string;
    image: Image;
}

export interface PartnersSectionDto {
    id: number;
    title: string;
    description: string;
    partners: PartnerDto[];
    orderIndex: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

// =====================================
// REQUEST ТИПИ ДЛЯ API
// =====================================

export interface PartnerBannerUpdateRequest {
    title: string;
    description: string;
    imageId: number | null;
    image: Image | ImageValues | null;
}

// Для створення нової секції
export interface PartnersSectionCreateRequest {
    title: string;
    description: string;
    partners: Array<{
        description: string;
        imageId?: number;
        image?: Image | ImageValues | null;
    }>;
}

// Для оновлення існуючої секції
export interface PartnersSectionUpdateRequest {
    title: string;
    description: string;
    partnersToUpdate: Array<{
        id: number | null;
        description: string;
        imageId?: number;
        image?: Image | ImageValues | null;
    }>;
    partnerIdsToDelete: number[];
}

// =====================================
// ТИПИ ДЛЯ ФОРМ
// =====================================

export interface PartnerFormValues {
    image: ImageValues | Image | null;
    description: string;
}

export interface PartnerSectionFormValues {
    title: string;
    description: string;
    partners: PartnerFormValues[];
}

export interface PartnerBannerFormValues {
    title: string;
    description: string;
    image: ImageValues | Image | null;
    imageId: number | null;
}

// =====================================
// ТИПИ ДЛЯ REF
// =====================================

export interface PartnerBannerFormRef {
    submit: (isPublishing: boolean) => void;
    isValid: (isPublishing?: boolean) => boolean;
    isDirty: () => boolean;
}

// =====================================
// ENUM ТА КОНСТАНТИ
// =====================================

export enum PartnerStatus {
    Draft = 'draft',
    Published = 'published',
    Archived = 'archived',
}

export enum PartnerActionType {
    Create = 'create',
    Update = 'update',
    Delete = 'delete',
    Publish = 'publish',
    Unpublish = 'unpublish',
    Reorder = 'reorder',
}

// =====================================
// ТИПИ ДЛЯ ВАЛІДАЦІЇ
// =====================================

export interface PartnerValidationErrors {
    title?: string;
    description?: string;
    image?: string;
    partners?: Array<{
        image?: string;
        description?: string;
    }>;
}

export interface PartnerBannerFormErrorState {
    title?: string;
    description?: string;
    image?: string;
    [key: string]: string | undefined;
}

export interface PartnerSectionFormErrorState {
    title?: string;
    description?: string;
    partners?: Array<{
        image?: string;
        description?: string;
    }>;
    general?: string;
}

// =====================================
// ТИПИ ДЛЯ API RESPONSES
// =====================================

export interface PartnersListResponse {
    sections: PartnersSectionDto[];
    total: number;
    page: number;
    pageSize: number;
}

export interface PartnersBulkResponse {
    banner: PartnerBannerDto | null;
    sections: PartnersSectionDto[];
}

export interface PartnerOperationResult {
    success: boolean;
    message?: string;
    data?: any;
    errors?: string[];
}

// =====================================
// ТИПИ ДЛЯ ФІЛЬТРІВ ТА ПАГІНАЦІЇ
// =====================================

export interface PartnerFilters {
    search?: string;
    isPublished?: boolean;
    orderBy?: 'createdAt' | 'updatedAt' | 'orderIndex' | 'title';
    orderDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}

export interface PartnerSortOptions {
    field: 'title' | 'createdAt' | 'updatedAt' | 'orderIndex';
    direction: 'asc' | 'desc';
}

// =====================================
// ТИПИ ДЛЯ PROPS КОМПОНЕНТІВ
// =====================================

export interface PartnerBannerFormProps {
    onSubmit: (data: PartnerBannerFormValues, isPublishing: boolean) => void;
    initialData?: PartnerBannerFormValues | null;
    formDisabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
}

export interface PartnerSectionFormProps {
    value: PartnerSectionFormValues;
    onChange: (value: PartnerSectionFormValues) => void;
    onDelete: () => void;
    onPublish: () => void;
    disabled?: boolean;
    errors?: PartnerSectionFormErrorState;
}

export interface PartnerFormProps {
    value: PartnerFormValues;
    onChange: (value: PartnerFormValues) => void;
    onDelete: () => void;
    disabled?: boolean;
    error?: {
        image?: string;
        description?: string;
    };
}

// =====================================
// УТИЛІТНІ ТИПИ
// =====================================

export type PartnerImageData = Image | ImageValues | null;

export type PartnerSectionWithPartners = PartnerSection & {
    partners: Partner[];
};

export type PartnerBannerWithImage = PartnerBanner & {
    image: Image;
};

export type PartialPartnerSection = Partial<PartnerSection>;
export type PartialPartnerBanner = Partial<PartnerBanner>;

// Type guards
export function isPartnerImage(value: any): value is Image {
    return value !== null && typeof value === 'object' && 'id' in value && 'url' in value;
}

export function isPartnerImageValues(value: any): value is ImageValues {
    return value !== null && typeof value === 'object' && 'base64' in value && 'mimeType' in value;
}

export function isPartnerSection(value: any): value is PartnerSection {
    return value !== null && typeof value === 'object' && 'id' in value && 'title' in value && 'partners' in value;
}
