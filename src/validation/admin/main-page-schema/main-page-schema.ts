import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MainPageFormValues } from '@/types/admin/main-page';
import { Image, ImageValues } from '@/types/common/image';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import * as Yup from 'yup';

const buildStringValidation = (
    config: {
        min: number;
        max: number;
        getMinError: () => string;
        getMaxError: () => string;
    },
    isRequired: boolean = true,
) => {
    let schema = Yup.string().default('') as unknown as Yup.StringSchema<string>;

    if (isRequired) {
        schema = schema
            .required(MAIN_PAGE_VALIDATION.common.REQUIRED)
            .test('required-plain-text', MAIN_PAGE_VALIDATION.common.REQUIRED, (value) => {
                const normalizedValue = getNormalizedInputText(getPlainTextFromHtml(value ?? ''));
                return normalizedValue.length > 0;
            });
    }

    return schema
        .test('min-plain-text', config.getMinError(), (value) => {
            const normalizedValue = getNormalizedInputText(getPlainTextFromHtml(value ?? ''));
            return normalizedValue.length === 0 || normalizedValue.length >= config.min;
        })
        .test('max-plain-text', config.getMaxError(), (value) => {
            const normalizedValue = getNormalizedInputText(getPlainTextFromHtml(value ?? ''));
            return normalizedValue.length === 0 || normalizedValue.length <= config.max;
        });
};

const statisticsTitleValidation = buildStringValidation(MAIN_PAGE_VALIDATION.statisticsBlock.title, false);

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
    titleEn: buildStringValidation(MAIN_PAGE_VALIDATION.titleBlock.title, false),
    descriptionUa: buildStringValidation(MAIN_PAGE_VALIDATION.titleBlock.description),
    descriptionEn: buildStringValidation(MAIN_PAGE_VALIDATION.titleBlock.description, false),
    image: imageSchema,

    // About Us Block
    aboutUsTitleUa: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.title),
    aboutUsTitleEn: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.title, false),
    aboutUsDescriptionUa: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.description),
    aboutUsDescriptionEn: buildStringValidation(MAIN_PAGE_VALIDATION.aboutUsBlock.description, false),

    // Donations Block
    donationsTitleUa: buildStringValidation(MAIN_PAGE_VALIDATION.donationsBlock.title),
    donationsTitleEn: buildStringValidation(MAIN_PAGE_VALIDATION.donationsBlock.title, false),
    donationsDescriptionUa: buildStringValidation(MAIN_PAGE_VALIDATION.donationsBlock.description),
    donationsDescriptionEn: buildStringValidation(MAIN_PAGE_VALIDATION.donationsBlock.description, false),
    donationsImage: imageSchema,

    // Partners Block
    partnersTitleUa: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.title),
    partnersTitleEn: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.title, false),
    partnersDescriptionUa: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.description),
    partnersDescriptionEn: buildStringValidation(MAIN_PAGE_VALIDATION.partnersBlock.description, false),

    // Impact Statistics Block
    statisticsTitleUa: buildStringValidation(MAIN_PAGE_VALIDATION.statisticsBlock.title),
    statisticsTitleEn: buildStringValidation(MAIN_PAGE_VALIDATION.statisticsBlock.title, false),
    statisticsImage: imageSchema,
    metrics: Yup.array().optional(),
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
    validateStatisticsTitleEn: (value: string) => {
        try {
            statisticsTitleValidation.validateSync(value);
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
