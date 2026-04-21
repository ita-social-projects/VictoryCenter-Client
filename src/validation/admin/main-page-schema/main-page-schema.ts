import * as Yup from 'yup';
import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { AboutUsBlockFormValues, TitleBlockFormValues } from '@/types/admin/main-page';
import { Image, ImageValues } from '@/types/common/image';

const requiredTrimmedTitle = () => {
    return Yup.string()
        .trim()
        .required(MAIN_PAGE_VALIDATION.common.REQUIRED)
        .max(MAIN_PAGE_VALIDATION.title.max, MAIN_PAGE_VALIDATION.title.getMaxError());
};

const requiredTrimmedDescription = () => {
    return Yup.string()
        .trim()
        .required(MAIN_PAGE_VALIDATION.common.REQUIRED)
        .max(MAIN_PAGE_VALIDATION.description.max, MAIN_PAGE_VALIDATION.description.getMaxError());
};

export const TitleBlockValidationSchema: Yup.ObjectSchema<TitleBlockFormValues> = Yup.object({
    title: requiredTrimmedTitle(),
    description: requiredTrimmedDescription(),
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
    title: requiredTrimmedTitle(),
    description: requiredTrimmedDescription(),
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
};
