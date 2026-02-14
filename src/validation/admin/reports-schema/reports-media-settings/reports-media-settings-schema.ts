import * as Yup from 'yup';
import { REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION, REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export const reportsMediaSettingsCollectedFundsSchema = Yup.object({
    title: Yup.string()
        .required(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.getRequiredError())
        .min(
            REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.min,
             COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.min),
        )
        .max(
            REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.max),
        ),
    
    collectedFunds: Yup.number()
        .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
        .max(
            REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.collectedFunds.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.collectedFunds.max),
        ),
});

export const reportsMediaSettingsChangedLivesSchema = Yup.object({
    title: Yup.string()
        .required(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.getRequiredError())
        .min(
            REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.min),
        )
        .max(
            REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.max),
        ),

    changedLives: Yup.number()
        .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
        .max(
            REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.changedLives.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.changedLives.max),
        ),
});

export const REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined => {
        try {
            reportsMediaSettingsChangedLivesSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
    validateChangedLives: (value: number): string | undefined => {
        try {
            reportsMediaSettingsChangedLivesSchema.validateSyncAt('changedLives', { changedLives: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

export const REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined => {
        try {
            reportsMediaSettingsCollectedFundsSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
    validateCollectedFunds: (value: number): string | undefined => {
        try {
            reportsMediaSettingsCollectedFundsSchema.validateSyncAt('collectedFunds', { collectedFunds: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};