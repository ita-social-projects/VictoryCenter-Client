import * as Yup from 'yup';
import { PARTNER_VALIDATION } from '../../../const/admin/partners';
import { Image, ImageValues } from '../../../types/common/image';

export interface PartnerValidationContext {
    isPublishing: boolean;
}

export const partnerValidationSchema = Yup.object({
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

export const PARTNER_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string, isPublishing: boolean): string | undefined => {
        const context: PartnerValidationContext = { isPublishing };
        try {
            partnerValidationSchema.validateSyncAt('title', { title: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string, isPublishing: boolean): string | undefined => {
        const context: PartnerValidationContext = { isPublishing };
        try {
            partnerValidationSchema.validateSyncAt('description', { description: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateImage: (value: ImageValues | Image | null, isPublishing: boolean): string | undefined => {
        const context: PartnerValidationContext = { isPublishing };
        try {
            partnerValidationSchema.validateSyncAt('image', { image: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

