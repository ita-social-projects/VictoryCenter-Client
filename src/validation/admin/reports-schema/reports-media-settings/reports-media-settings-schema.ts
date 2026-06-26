import * as Yup from 'yup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION,
    REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION,
    REPORTS_TEXT,
} from '@/const/admin/reports';

const normalizeTextInput = (value: string): string => value.trim().replace(/\s+/g, ' ');

const collectedFundsSchema = Yup.object({
    title: Yup.string()
        .transform((value) => (typeof value === 'string' ? normalizeTextInput(value) : value))
        .required(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.getRequiredError())
        .min(
            REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(
                REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.min,
            ),
        )
        .max(
            REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.max,
            ),
        ),
});

export const REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined => {
        try {
            collectedFundsSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
    validateTitleEn: (value: string): string | undefined => {
        try {
            collectedFundsSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

const changedLivesSchema = Yup.object({
    title: Yup.string()
        .transform((value) => (typeof value === 'string' ? normalizeTextInput(value) : value))
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
        .integer(REPORTS_TEXT.MESSAGE.INVALID_VALUE)
        .min(2, COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(2))
        .max(
            REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.changedLives.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.changedLives.max,
            ),
        ),
});

export const REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined => {
        try {
            changedLivesSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
    validateTitleEn: (value: string): string | undefined => {
        try {
            changedLivesSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
    validateChangedLives: (value: number): string | undefined => {
        try {
            changedLivesSchema.validateSyncAt('changedLives', { changedLives: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
