import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MetricPrefix } from '@/types/admin/main-page';

import { metricEditSchema, raisedMetricEditSchema } from './metric-edit-schema';

describe('metricEditSchema', () => {
    const validPayload = {
        nameUa: 'Назва UA',
        nameEn: 'Name EN',
        value: '1 000',
        prefix: MetricPrefix.Plus,
    };

    it('accepts valid payload', async () => {
        await expect(metricEditSchema.validate(validPayload)).resolves.toEqual(validPayload);
    });

    it('requires nameUa', async () => {
        await expect(metricEditSchema.validate({ ...validPayload, nameUa: '' })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.common.REQUIRED,
        );
    });

    it('requires nameEn', async () => {
        await expect(metricEditSchema.validate({ ...validPayload, nameEn: '' })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.common.REQUIRED,
        );
    });

    it('enforces min/max name length', async () => {
        const tooShort = 'a'.repeat(MAIN_PAGE_VALIDATION.editPanel.name.min - 1);
        const tooLong = 'a'.repeat(MAIN_PAGE_VALIDATION.editPanel.name.max + 1);

        await expect(metricEditSchema.validate({ ...validPayload, nameUa: tooShort })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.editPanel.name.getMinError(),
        );

        await expect(metricEditSchema.validate({ ...validPayload, nameEn: tooLong })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.editPanel.name.getMaxError(),
        );
    });

    it('requires positive value', async () => {
        await expect(metricEditSchema.validate({ ...validPayload, value: '0' })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.editPanel.value.ONLY_POSITIVE,
        );
    });

    it('rejects non-numeric value', async () => {
        await expect(metricEditSchema.validate({ ...validPayload, value: 'abc' })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.editPanel.value.ONLY_NUMBERS,
        );
    });

    it('requires prefix', async () => {
        await expect(metricEditSchema.validate({ ...validPayload, prefix: undefined })).rejects.toThrow();
    });
});

describe('raisedMetricEditSchema', () => {
    const validRaisedPayload = {
        nameUa: 'Зібрано',
        nameEn: 'Raised',
        isAutoSynced: false,
        valueUah: '1 000 000',
        valueUsd: '25 000',
    };

    it('accepts valid payload', async () => {
        await expect(raisedMetricEditSchema.validate(validRaisedPayload)).resolves.toEqual(validRaisedPayload);
    });

    it('accepts decimal payload values with dot or comma separators', async () => {
        const payload = { ...validRaisedPayload, valueUah: '1 000,50', valueUsd: '25 000.75' };

        await expect(raisedMetricEditSchema.validate(payload)).resolves.toEqual(payload);
    });

    it('requires nameUa and nameEn', async () => {
        await expect(raisedMetricEditSchema.validate({ ...validRaisedPayload, nameUa: '' })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.common.REQUIRED,
        );
        await expect(raisedMetricEditSchema.validate({ ...validRaisedPayload, nameEn: '' })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.common.REQUIRED,
        );
    });

    it('requires boolean for auto sync', async () => {
        await expect(
            raisedMetricEditSchema.validate({ ...validRaisedPayload, isAutoSynced: undefined }),
        ).rejects.toThrow(MAIN_PAGE_VALIDATION.common.REQUIRED);
    });

    it('rejects zero UAH value with zero-specific message', async () => {
        await expect(raisedMetricEditSchema.validate({ ...validRaisedPayload, valueUah: '0' })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.raisedFunds.ZERO,
        );
    });

    it('rejects negative USD value with negative-specific message', async () => {
        await expect(raisedMetricEditSchema.validate({ ...validRaisedPayload, valueUsd: '-100' })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.raisedFunds.NEGATIVE,
        );
    });

    it('rejects non-numeric value', async () => {
        await expect(raisedMetricEditSchema.validate({ ...validRaisedPayload, valueUsd: 'abc' })).rejects.toThrow(
            MAIN_PAGE_VALIDATION.raisedFunds.ONLY_NUMBERS,
        );
    });

    it('rejects values with more than 9 digits before decimal separator', async () => {
        await expect(
            raisedMetricEditSchema.validate({ ...validRaisedPayload, valueUah: '1 000 000 000,50' }),
        ).rejects.toThrow(MAIN_PAGE_VALIDATION.raisedFunds.MAX_DIGITS);
    });
});
