import * as Yup from 'yup';
import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { AboutUsBlockFormValues, TitleBlockFormValues, PartnersBlockFormValues } from '@/types/admin/main-page';
import { Image, ImageValues } from '@/types/common/image';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';

const buildStringValidation = (config: {
    min: number;
    max: number;
    getMinError: () => string;
    getMaxError: () => string;
}) => {
    return Yup.string()
        .transform((value) => (value ? getNormalizedInputText(value) : value))
        .required(MAIN_PAGE_VALIDATION.common.REQUIRED)
        .min(config.min, config.getMinError())
        .max(config.max, config.getMaxError());
};

export const TitleBlockValidationSchema: Yup.ObjectSchema<TitleBlockFormValues> = Yup.object({
    title: buildStringValidation(MAIN_PAGE_VALIDATION.titleBlock.title),
    description: buildStringValidation(MAIN_PAGE_VALIDATION.titleBlock.description),
    image: Yup.mixed<Image | ImageValues>()
        .transform((value) => {
            if (value === null || typeof value === 'string') return undefined;
            return value;
        })
        .nullable()
        .notRequired()
        .default(null),
});

export const AboutUsBlockValidationSchema: Yup.ObjectSchema<AboutUsBlockFormValues> = Yup.object({
    title: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.title),
    description: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.description),
});

export const PartnersBlockValidationSchema: Yup.ObjectSchema<PartnersBlockFormValues> = Yup.object({
    title: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.title),
    description: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.description),
});

export const MAIN_PAGE_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined => {
        try {
            TitleBlockValidationSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string): string | undefined => {
        try {
            TitleBlockValidationSchema.validateSyncAt('description', { description: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateImage: (value: Image | ImageValues | null): string | undefined => {
        try {
            TitleBlockValidationSchema.validateSyncAt('image', { image: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validatePartnersTitle: (value: string): string | undefined => {
        try {
            PartnersBlockValidationSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validatePartnersDescription: (value: string): string | undefined => {
        try {
            PartnersBlockValidationSchema.validateSyncAt('description', { description: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
