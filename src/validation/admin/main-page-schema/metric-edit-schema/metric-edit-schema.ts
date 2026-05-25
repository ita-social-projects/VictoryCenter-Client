import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MetricPrefix } from '@/types/admin/main-page';
import * as Yup from 'yup';

const parseThousands = (value: string): number => {
    return parseInt((value || '').replace(/\s/g, ''), 10) || 0;
};

const raisedFundsValidator = Yup.string()
    .required(MAIN_PAGE_VALIDATION.raisedFunds.REQUIRED)
    .test('not-empty', MAIN_PAGE_VALIDATION.raisedFunds.REQUIRED, (val) => {
        if (!val) return false;
        return val.trim().length > 0;
    })
    .test('only-numbers', MAIN_PAGE_VALIDATION.raisedFunds.ONLY_NUMBERS, (val) => {
        if (!val) return false;
        const stripped = val.replace(/\s/g, '').replace(',', '.');
        return !isNaN(Number(stripped)) && /^[0-9.,]+$/.test(stripped);
    })
    .test('not-negative', MAIN_PAGE_VALIDATION.raisedFunds.NEGATIVE, (val) => {
        if (!val) return false;
        const stripped = val.replace(/\s/g, '').replace(',', '.');
        return Number(stripped) >= 0;
    })
    .test('not-zero', MAIN_PAGE_VALIDATION.raisedFunds.ZERO, (val) => {
        if (!val) return false;
        const stripped = val.replace(/\s/g, '').replace(',', '.');
        return Number(stripped) !== 0;
    })
    .test('max-digits', MAIN_PAGE_VALIDATION.raisedFunds.MAX_DIGITS, (val) => {
        if (!val) return false;
        const stripped = val.replace(/\s/g, '');
        const beforeDecimal = stripped.split(/[.,]/)[0];
        return beforeDecimal.length <= 9;
    });

export const metricEditSchema = Yup.object({
    nameUa: Yup.string()
        .required(MAIN_PAGE_VALIDATION.common.REQUIRED)
        .min(MAIN_PAGE_VALIDATION.editPanel.name.min, MAIN_PAGE_VALIDATION.editPanel.name.getMinError())
        .max(MAIN_PAGE_VALIDATION.editPanel.name.max, MAIN_PAGE_VALIDATION.editPanel.name.getMaxError()),
    nameEn: Yup.string()
        .required(MAIN_PAGE_VALIDATION.common.REQUIRED)
        .min(MAIN_PAGE_VALIDATION.editPanel.name.min, MAIN_PAGE_VALIDATION.editPanel.name.getMinError())
        .max(MAIN_PAGE_VALIDATION.editPanel.name.max, MAIN_PAGE_VALIDATION.editPanel.name.getMaxError()),
    value: Yup.string()
        .required(MAIN_PAGE_VALIDATION.common.REQUIRED)
        .test('is-positive', MAIN_PAGE_VALIDATION.common.REQUIRED, (val) => parseThousands(val || '') > 0),
    prefix: Yup.mixed<MetricPrefix>().required(MAIN_PAGE_VALIDATION.common.REQUIRED),
});

export const raisedMetricEditSchema = Yup.object({
    nameUa: Yup.string()
        .required(MAIN_PAGE_VALIDATION.common.REQUIRED)
        .min(MAIN_PAGE_VALIDATION.editPanel.name.min, MAIN_PAGE_VALIDATION.editPanel.name.getMinError())
        .max(MAIN_PAGE_VALIDATION.editPanel.name.max, MAIN_PAGE_VALIDATION.editPanel.name.getMaxError()),
    nameEn: Yup.string()
        .required(MAIN_PAGE_VALIDATION.common.REQUIRED)
        .min(MAIN_PAGE_VALIDATION.editPanel.name.min, MAIN_PAGE_VALIDATION.editPanel.name.getMinError())
        .max(MAIN_PAGE_VALIDATION.editPanel.name.max, MAIN_PAGE_VALIDATION.editPanel.name.getMaxError()),
    isAutoSynced: Yup.boolean().required(MAIN_PAGE_VALIDATION.common.REQUIRED),
    valueUah: raisedFundsValidator,
    valueUsd: raisedFundsValidator,
});

export type MetricFormValues = Yup.InferType<typeof metricEditSchema>;
export type RaisedMetricFormValues = Yup.InferType<typeof raisedMetricEditSchema>;
