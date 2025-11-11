import * as Yup from 'yup';
import {
    PARTNER_BANNER_VALIDATION,
    PARTNER_SECTION_VALIDATION,
    PARTNER_VALIDATION,
} from '../../../const/admin/partners';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

export const partnerBannerSchema = Yup.object({
    title: Yup.string()
        .required(PARTNER_BANNER_VALIDATION.title.getRequiredError())
        .min(
            PARTNER_BANNER_VALIDATION.title.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PARTNER_BANNER_VALIDATION.title.min),
        )
        .max(
            PARTNER_BANNER_VALIDATION.title.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PARTNER_BANNER_VALIDATION.title.max),
        ),

    description: Yup.string()
        .required(PARTNER_BANNER_VALIDATION.description.getRequiredError())
        .max(
            PARTNER_BANNER_VALIDATION.description.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PARTNER_BANNER_VALIDATION.description.min),
        )
        .min(
            PARTNER_BANNER_VALIDATION.description.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PARTNER_BANNER_VALIDATION.description.max),
        ),
});

export const partnerSchema = Yup.object({
    description: Yup.string()
        .required(PARTNER_VALIDATION.description.getRequiredError())
        .min(
            PARTNER_VALIDATION.description.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PARTNER_VALIDATION.description.min),
        )
        .max(
            PARTNER_VALIDATION.description.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PARTNER_VALIDATION.description.max),
        ),

    imageId: Yup.number().nullable(),
});

export const partnerSectionSchema = Yup.object({
    title: Yup.string()
        .required(PARTNER_SECTION_VALIDATION.title.getRequiredError())
        .min(
            PARTNER_SECTION_VALIDATION.title.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PARTNER_SECTION_VALIDATION.title.min),
        )
        .max(
            PARTNER_SECTION_VALIDATION.title.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PARTNER_SECTION_VALIDATION.title.max),
        ),

    description: Yup.string()
        .required(PARTNER_SECTION_VALIDATION.description.getRequiredError())
        .min(
            PARTNER_SECTION_VALIDATION.description.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PARTNER_SECTION_VALIDATION.description.min),
        )
        .max(
            PARTNER_SECTION_VALIDATION.description.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PARTNER_SECTION_VALIDATION.description.max),
        ),

    partners: Yup.array()
        .of(partnerSchema)
        .min(1, PARTNER_SECTION_VALIDATION.partners.getAtLeastOnePartnerRequiredError())
        .max(PARTNER_SECTION_VALIDATION.partners.max, PARTNER_SECTION_VALIDATION.partners.getMaxError()),
});

export const PARTNER_BANNER_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined => {
        try {
            partnerBannerSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string): string | undefined => {
        try {
            partnerBannerSchema.validateSyncAt('description', { description: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

export const PARTNER_VALIDATION_FUNCTIONS = {
    validateDescription: (value: string): string | undefined => {
        try {
            partnerSchema.validateSyncAt('description', { description: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

export const PARTNER_SECTION_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined => {
        try {
            partnerSectionSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string): string | undefined => {
        try {
            partnerSectionSchema.validateSyncAt('description', { description: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validatePartners: (partners: { description: string }[]): string | undefined => {
        try {
            partnerSectionSchema.validateSyncAt('partners', partners);
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
