import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MetricPrefix } from '@/types/admin/main-page';
import * as Yup from 'yup';

const parseThousands = (value: string): number => {
    return parseInt((value || '').replace(/\s/g, ''), 10) || 0;
};

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

export type MetricFormValues = Yup.InferType<typeof metricEditSchema>;
