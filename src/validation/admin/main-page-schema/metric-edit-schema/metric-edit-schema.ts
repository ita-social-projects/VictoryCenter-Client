import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MetricPrefix } from '@/types/admin/main-page';
import { normalizeFormattedNumber, parseFormattedNumber } from '@/utils/functions/formatters/format-number';
import * as Yup from 'yup';

const raisedFundsValidator = Yup.string()
    .required(MAIN_PAGE_VALIDATION.raisedFunds.REQUIRED)
    .test('not-empty', MAIN_PAGE_VALIDATION.raisedFunds.REQUIRED, (val) => {
        if (!val) return false;
        return val.trim().length > 0;
    })
    .test('only-numbers', MAIN_PAGE_VALIDATION.raisedFunds.ONLY_NUMBERS, (val) => {
        if (!val) return false;
        const stripped = normalizeFormattedNumber(val);
        return /^-?\d+(\.\d*)?$/.test(stripped) && parseFormattedNumber(val) !== null;
    })
    .test('not-negative', MAIN_PAGE_VALIDATION.raisedFunds.NEGATIVE, (val) => {
        if (!val) return false;
        const parsedValue = parseFormattedNumber(val);
        return parsedValue !== null && parsedValue >= 0;
    })
    .test('not-zero', MAIN_PAGE_VALIDATION.raisedFunds.ZERO, (val) => {
        if (!val) return false;
        const parsedValue = parseFormattedNumber(val);
        return parsedValue !== null && parsedValue !== 0;
    })
    .test('max-digits', MAIN_PAGE_VALIDATION.raisedFunds.MAX_DIGITS, (val) => {
        if (!val) return false;
        const stripped = normalizeFormattedNumber(val);
        const beforeDecimal = stripped.split('.')[0].replace('-', '');
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
        .test('only-numbers', MAIN_PAGE_VALIDATION.editPanel.value.ONLY_NUMBERS, (val) => {
            if (!val) return false;
            const stripped = val.replace(/\s/g, '');
            return /^-?\d+$/.test(stripped);
        })
        .test('is-positive', MAIN_PAGE_VALIDATION.editPanel.value.ONLY_POSITIVE, (val) => {
            if (!val) return false;
            const stripped = val.replace(/\s/g, '');
            const num = Number(stripped);
            return !Number.isNaN(num) && num > 0;
        }),
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
