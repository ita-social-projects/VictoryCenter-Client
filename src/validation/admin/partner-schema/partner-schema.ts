import * as Yup from 'yup';
import { PARTNER_VALIDATION } from '../../../const/admin/partners';
import { Image, ImageValues } from '../../../types/common/image';

export interface PartnerValidationContext {
    isPublishing: boolean;
}

// Схема для банера партнерів
export const partnerBannerSchema = Yup.object({
    title: Yup.string()
        .required(PARTNER_VALIDATION.title.getRequiredError())
        .min(PARTNER_VALIDATION.title.min, PARTNER_VALIDATION.title.getMinError())
        .max(PARTNER_VALIDATION.title.max, PARTNER_VALIDATION.title.getMaxError()),

    description: Yup.string()
        .required(PARTNER_VALIDATION.description.getRequiredError())
        .max(PARTNER_VALIDATION.description.max, PARTNER_VALIDATION.description.getMaxError())
        .min(PARTNER_VALIDATION.description.min, PARTNER_VALIDATION.description.getMinError()),

    image: Yup.mixed<ImageValues | Image>()
        .transform((value) => {
            if (value === null || typeof value === 'string') return undefined;
            return value;
        })
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.test(
                      'image-required-if-publishing',
                      PARTNER_VALIDATION.image.getRequiredWhenPublishingError(),
                      (value) => {
                          return value !== undefined && value !== null;
                      },
                  )
                : schema,
        )
        .test('fileSize', PARTNER_VALIDATION.image.getSizeError(), (value) => {
            if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
                return true;
            }
            if (value == null) return true;
            if ('url' in value) return true;
            if ('base64' in value) {
                return value.size <= PARTNER_VALIDATION.image.maxSizeBytes;
            }
            return true;
        })
        .test('fileType', PARTNER_VALIDATION.image.getFormatError(), (value) => {
            if (value == null) return true;
            if ('url' in value) return true;
            if ('base64' in value) {
                return PARTNER_VALIDATION.image.allowedFormats.includes((value as any).mimeType);
            }
            return true;
        })
        .nullable()
        .notRequired(),
});

// Схема для окремого партнера
export const partnerItemSchema = Yup.object({
    description: Yup.string()
        .required('Опис партнера обов\'язковий')
        .min(10, 'Мінімум 10 символів')
        .max(200, 'Максимум 200 символів'),
    
    image: Yup.mixed<ImageValues | Image>()
        .required('Зображення партнера обов\'язкове')
        .test('fileSize', PARTNER_VALIDATION.image.getSizeError(), (value) => {
            if (!value) return false;
            if (typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
                return true;
            }
            if ('url' in value) return true;
            if ('base64' in value) {
                return value.size <= PARTNER_VALIDATION.image.maxSizeBytes;
            }
            return false;
        })
        .test('fileType', PARTNER_VALIDATION.image.getFormatError(), (value) => {
            if (!value) return false;
            if ('url' in value) return true;
            if ('base64' in value) {
                return PARTNER_VALIDATION.image.allowedFormats.includes((value as any).mimeType);
            }
            return true;
        }),
    
    imageId: Yup.number().nullable(),
});

// Схема для секції партнерів
export const partnerSectionSchema = Yup.object({
    title: Yup.string()
        .required('Заголовок секції обов\'язковий')
        .min(5, 'Мінімум 5 символів')
        .max(50, 'Максимум 50 символів'),
    
    description: Yup.string()
        .required('Опис секції обов\'язковий')
        .min(10, 'Мінімум 10 символів')
        .max(70, 'Максимум 70 символів'),
    
    partners: Yup.array()
        .of(partnerItemSchema)
        .min(1, 'Потрібен хоча б один партнер')
        .max(10, 'Максимум 10 партнерів'),
});

// Схема для створення секції (для API)
export const partnerSectionCreateSchema = Yup.object({
    title: Yup.string()
        .required('Заголовок секції обов\'язковий')
        .min(5, 'Мінімум 5 символів')
        .max(50, 'Максимум 50 символів'),
    
    description: Yup.string()
        .required('Опис секції обов\'язковий')
        .min(10, 'Мінімум 10 символів')
        .max(70, 'Максимум 70 символів'),
    
    partners: Yup.array()
        .of(
            Yup.object({
                description: Yup.string()
                    .required('Опис партнера обов\'язковий')
                    .min(10, 'Мінімум 10 символів')
                    .max(200, 'Максимум 200 символів'),
                imageId: Yup.number()
                    .required('ID зображення обов\'язкове')
                    .positive('ID має бути позитивним числом'),
            })
        )
        .min(1, 'Потрібен хоча б один партнер')
        .required('Список партнерів обов\'язковий'),
});

// Схема для оновлення секції
export const partnerSectionUpdateSchema = Yup.object({
    title: Yup.string()
        .required('Заголовок секції обов\'язковий')
        .min(5, 'Мінімум 5 символів')
        .max(50, 'Максимум 50 символів'),
    
    description: Yup.string()
        .required('Опис секції обов\'язковий')
        .min(10, 'Мінімум 10 символів')
        .max(70, 'Максимум 70 символів'),
    
    partnersToUpdate: Yup.array()
        .of(
            Yup.object({
                id: Yup.number().nullable(),
                description: Yup.string()
                    .required('Опис партнера обов\'язковий')
                    .min(10, 'Мінімум 10 символів')
                    .max(200, 'Максимум 200 символів'),
                imageId: Yup.number()
                    .required('ID зображення обов\'язкове')
                    .positive('ID має бути позитивним числом'),
            })
        )
        .min(1, 'Потрібен хоча б один партнер'),
    
    partnerIdsToDelete: Yup.array()
        .of(Yup.number().positive())
        .default([]),
});

// Функції валідації для банера
export const PARTNER_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string, isPublishing: boolean): string | undefined => {
        const context: PartnerValidationContext = { isPublishing };
        try {
            partnerBannerSchema.validateSyncAt('title', { title: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string, isPublishing: boolean): string | undefined => {
        const context: PartnerValidationContext = { isPublishing };
        try {
            partnerBannerSchema.validateSyncAt('description', { description: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateImage: (value: ImageValues | Image | null, isPublishing: boolean): string | undefined => {
        const context: PartnerValidationContext = { isPublishing };
        try {
            partnerBannerSchema.validateSyncAt('image', { image: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

// Функції валідації для секцій
export const PARTNER_SECTION_VALIDATION = {
    // Валідація заголовка секції
    validateSectionTitle: (value: string): string | undefined => {
        try {
            partnerSectionSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    // Валідація опису секції
    validateSectionDescription: (value: string): string | undefined => {
        try {
            partnerSectionSchema.validateSyncAt('description', { description: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    // Валідація партнера
    validatePartner: (partner: { description: string; image: ImageValues | Image | null }): string | undefined => {
        try {
            partnerItemSchema.validateSync(partner);
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    // Валідація опису партнера
    validatePartnerDescription: (value: string): string | undefined => {
        try {
            partnerItemSchema.validateSyncAt('description', { description: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    // Валідація зображення партнера
    validatePartnerImage: (value: ImageValues | Image | null): string | undefined => {
        try {
            partnerItemSchema.validateSyncAt('image', { image: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    // Валідація всієї секції
    validateSection: async (section: any): Promise<{ isValid: boolean; errors?: any }> => {
        try {
            await partnerSectionSchema.validate(section, { abortEarly: false });
            return { isValid: true };
        } catch (error: any) {
            return { 
                isValid: false, 
                errors: error.errors || error.message 
            };
        }
    },

    // Валідація для створення секції
    validateSectionCreate: async (data: any): Promise<{ isValid: boolean; errors?: any }> => {
        try {
            await partnerSectionCreateSchema.validate(data, { abortEarly: false });
            return { isValid: true };
        } catch (error: any) {
            return { 
                isValid: false, 
                errors: error.errors || error.message 
            };
        }
    },

    // Валідація для оновлення секції
    validateSectionUpdate: async (data: any): Promise<{ isValid: boolean; errors?: any }> => {
        try {
            await partnerSectionUpdateSchema.validate(data, { abortEarly: false });
            return { isValid: true };
        } catch (error: any) {
            return { 
                isValid: false, 
                errors: error.errors || error.message 
            };
        }
    },
};

// Експортуємо все для зручності використання
export const partnerValidation = {
    schemas: {
        banner: partnerBannerSchema,
        section: partnerSectionSchema,
        sectionCreate: partnerSectionCreateSchema,
        sectionUpdate: partnerSectionUpdateSchema,
        partner: partnerItemSchema,
    },
    functions: {
        ...PARTNER_VALIDATION_FUNCTIONS,
        ...PARTNER_SECTION_VALIDATION,
    },
};