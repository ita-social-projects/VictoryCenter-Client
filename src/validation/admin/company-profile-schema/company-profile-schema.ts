import * as Yup from 'yup';
import { COMPANY_PROFILE_VALIDATION } from '@/const/admin/company-profile';
import {
    CompanyProfileFormValues,
    CompanyProfileSocialContactFormValue,
    SocialPlatform,
} from '@/types/admin/company-profile';

const requiredTrimmed = (max?: number) => {
    let s = Yup.string().trim().required(COMPANY_PROFILE_VALIDATION.common.REQUIRED);
    if (typeof max === 'number') s = s.max(max);
    return s;
};

const optionalTrimmed = (max?: number) => {
    let s = Yup.string().trim().defined();
    if (typeof max === 'number') s = s.max(max);
    return s;
};

const SocialContactSchema = Yup.object({
    platform: Yup.mixed<SocialPlatform>().required(),
    url: optionalTrimmed(COMPANY_PROFILE_VALIDATION.socialUrl.max)
        .default('')
        .max(COMPANY_PROFILE_VALIDATION.socialUrl.max, COMPANY_PROFILE_VALIDATION.socialUrl.getMaxError()),
}).defined();

export const CompanyProfileValidationSchema: Yup.ObjectSchema<CompanyProfileFormValues> = Yup.object({
    phone: requiredTrimmed(COMPANY_PROFILE_VALIDATION.phone.max),

    addressUa: requiredTrimmed(COMPANY_PROFILE_VALIDATION.address.max),
    addressEng: requiredTrimmed(COMPANY_PROFILE_VALIDATION.address.max),

    email: requiredTrimmed(COMPANY_PROFILE_VALIDATION.email.max).email(
        COMPANY_PROFILE_VALIDATION.common.getEmailError(),
    ),
    correspondenceEmail: requiredTrimmed(COMPANY_PROFILE_VALIDATION.email.max).email(
        COMPANY_PROFILE_VALIDATION.common.getEmailError(),
    ),

    mottoUa: optionalTrimmed(COMPANY_PROFILE_VALIDATION.motto.max)
        .default('')
        .max(COMPANY_PROFILE_VALIDATION.motto.max, COMPANY_PROFILE_VALIDATION.motto.getMaxError()),
    mottoEng: optionalTrimmed(COMPANY_PROFILE_VALIDATION.motto.max)
        .default('')
        .max(COMPANY_PROFILE_VALIDATION.motto.max, COMPANY_PROFILE_VALIDATION.motto.getMaxError()),

    requisitesUa: requiredTrimmed(COMPANY_PROFILE_VALIDATION.recipient.max),
    requisitesEn: requiredTrimmed(COMPANY_PROFILE_VALIDATION.recipient.max),

    companyRegistrationNumber: Yup.string()
        .trim()
        .required(COMPANY_PROFILE_VALIDATION.common.REQUIRED)
        .matches(/^\d*$/, COMPANY_PROFILE_VALIDATION.common.getDigitsOnlyError())
        .min(COMPANY_PROFILE_VALIDATION.edrpou.length, COMPANY_PROFILE_VALIDATION.edrpou.getMinError())
        .max(COMPANY_PROFILE_VALIDATION.edrpou.length, COMPANY_PROFILE_VALIDATION.edrpou.getMaxError()),

    addressUa_requisites: requiredTrimmed(COMPANY_PROFILE_VALIDATION.address.max),
    addressEn_requisites: requiredTrimmed(COMPANY_PROFILE_VALIDATION.address.max),

    socialContacts: Yup.array().defined().default([]).of(SocialContactSchema),
});

export const COMPANY_PROFILE_VALIDATION_FUNCTIONS = {
    validatePhone: (value: string): string | undefined => {
        try {
            CompanyProfileValidationSchema.validateSyncAt('phone', { phone: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateEmail: (value: string): string | undefined => {
        try {
            CompanyProfileValidationSchema.validateSyncAt('email', { email: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateCorrespondenceEmail: (value: string): string | undefined => {
        try {
            CompanyProfileValidationSchema.validateSyncAt('correspondenceEmail', { correspondenceEmail: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateCompanyRegistrationNumber: (value: string): string | undefined => {
        try {
            CompanyProfileValidationSchema.validateSyncAt('companyRegistrationNumber', {
                companyRegistrationNumber: value,
            });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateMottoUa: (value: string): string | undefined => {
        try {
            CompanyProfileValidationSchema.validateSyncAt('mottoUa', { mottoUa: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateMottoEng: (value: string): string | undefined => {
        try {
            CompanyProfileValidationSchema.validateSyncAt('mottoEng', { mottoEng: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateSocialUrl: (value: string): string | undefined => {
        try {
            CompanyProfileValidationSchema.validateSyncAt('socialContacts', {
                socialContacts: [{ platform: 'Instagram', url: value }] as CompanyProfileSocialContactFormValue[],
            });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
