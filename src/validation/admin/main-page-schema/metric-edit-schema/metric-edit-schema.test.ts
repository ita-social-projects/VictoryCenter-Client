import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import { MetricPrefix } from '@/types/admin/main-page';

import { metricEditSchema } from './metric-edit-schema';

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
            MAIN_PAGE_VALIDATION.common.REQUIRED,
        );
    });

    it('requires prefix', async () => {
        await expect(metricEditSchema.validate({ ...validPayload, prefix: undefined })).rejects.toThrow();
    });
});
