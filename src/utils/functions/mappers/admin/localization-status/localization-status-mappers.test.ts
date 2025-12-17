import { LOCALIZATION_TEXT } from '../../../../../const/admin/localization';
import { TranslationStatusFilter } from '../../../../../types/common/language';
import { mapLabelToTranslationStatusFilter } from './localization-status-mappers';

describe('mapLabelToLocalizationStatus', () => {
    it('returns status for OUTDATED label', () => {
        expect(mapLabelToTranslationStatusFilter(LOCALIZATION_TEXT.FILTER.STATUS.OUTDATED)).toBe(
            TranslationStatusFilter.Outdated,
        );
    });

    it('returns status for MISSING label', () => {
        expect(mapLabelToTranslationStatusFilter(LOCALIZATION_TEXT.FILTER.STATUS.MISSING)).toBe(
            TranslationStatusFilter.Missing,
        );
    });

    it('returns undefined for unknown label', () => {
        expect(mapLabelToTranslationStatusFilter('Unknown')).toBeUndefined();
    });
});
