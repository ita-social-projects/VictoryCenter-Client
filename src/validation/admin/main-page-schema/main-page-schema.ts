import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MainPageFormValues } from '@/types/admin/main-page';
import { Image, ImageValues } from '@/types/common/image';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import * as Yup from 'yup';

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

const imageSchema = Yup.mixed<Image | ImageValues>()
    .transform((value) => {
        if (value === null || typeof value === 'string') return undefined;
        return value;
    })
    .nullable()
    .notRequired()
    .default(null);

export const MainPageValidationSchema: Yup.ObjectSchema<MainPageFormValues> = Yup.object({
    // Title Block
    titleUa: buildStringValidation(MAIN_PAGE_VALIDATION.titleBlock.title),
    titleEn: buildStringValidation(MAIN_PAGE_VALIDATION.titleBlock.title),
    descriptionUa: buildStringValidation(MAIN_PAGE_VALIDATION.titleBlock.description),
    descriptionEn: buildStringValidation(MAIN_PAGE_VALIDATION.titleBlock.description),
    image: imageSchema,

    // About Us Block
    aboutUsTitleUa: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.title),
    aboutUsTitleEn: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.title),
    aboutUsDescriptionUa: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.description),
    aboutUsDescriptionEn: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.description),

    // Partners Block
    partnersTitleUa: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.title),
    partnersTitleEn: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.title),
    partnersDescriptionUa: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.description),
    partnersDescriptionEn: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.description),

    // Impact Statistics Block
    statisticsTitleUa: buildStringValidation(MAIN_PAGE_VALIDATION.statisticsBlock.title),
    statisticsTitleEn: buildStringValidation(MAIN_PAGE_VALIDATION.statisticsBlock.title),
    statisticsImage: imageSchema,
});

export const MAIN_PAGE_VALIDATION_FUNCTIONS = {
    validateField: (field: keyof MainPageFormValues, value: any): string | undefined => {
        try {
            MainPageValidationSchema.validateSyncAt(field, { [field]: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateTitle: (value: string) => MAIN_PAGE_VALIDATION_FUNCTIONS.validateField('titleUa', value),
    validateDescription: (value: string) => MAIN_PAGE_VALIDATION_FUNCTIONS.validateField('descriptionUa', value),
    validateImage: (value: Image | ImageValues | null) => MAIN_PAGE_VALIDATION_FUNCTIONS.validateField('image', value),

    validatePartnersTitle: (value: string) => MAIN_PAGE_VALIDATION_FUNCTIONS.validateField('partnersTitleUa', value),
    validatePartnersDescription: (value: string) =>
        MAIN_PAGE_VALIDATION_FUNCTIONS.validateField('partnersDescriptionUa', value),

    validateStatisticsTitleUa: (value: string) =>
        MAIN_PAGE_VALIDATION_FUNCTIONS.validateField('statisticsTitleUa', value),
    validateStatisticsTitleEn: (value: string) =>
        MAIN_PAGE_VALIDATION_FUNCTIONS.validateField('statisticsTitleEn', value),
};
