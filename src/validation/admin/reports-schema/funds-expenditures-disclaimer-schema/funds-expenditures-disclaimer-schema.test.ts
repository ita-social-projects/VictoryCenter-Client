import { FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS } from './funds-expenditures-disclaimer-schema';
import { FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

describe('funds-expenditures-disclaimer-schema', () => {
    describe('FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS', () => {
        describe('validateDisclaimer', () => {
            it('should return undefined for a valid disclaimer', () => {
                const result =
                    FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer('Valid disclaimer text');
                expect(result).toBeUndefined();
            });

            it('should return required error for an empty string', () => {
                const result = FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer('');
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
            });

            it('should return required error for a whitespace-only string', () => {
                const result = FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer('   ');
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
            });

            it('should return min error when disclaimer is too short (1 character)', () => {
                const result = FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer('a');
                expect(result).toBe(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.disclaimer.min),
                );
            });

            it('should return undefined for disclaimer at min length', () => {
                const minValue = 'a'.repeat(FUNDS_EXPENDITURES_VALIDATION.disclaimer.min);
                const result = FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer(minValue);
                expect(result).toBeUndefined();
            });

            it('should return max error when disclaimer exceeds max length', () => {
                const longValue = 'a'.repeat(FUNDS_EXPENDITURES_VALIDATION.disclaimer.max + 1);
                const result = FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer(longValue);
                expect(result).toBe(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(FUNDS_EXPENDITURES_VALIDATION.disclaimer.max),
                );
            });

            it('should return undefined for disclaimer at max length', () => {
                const maxValue = 'a'.repeat(FUNDS_EXPENDITURES_VALIDATION.disclaimer.max);
                const result = FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer(maxValue);
                expect(result).toBeUndefined();
            });

            it('should trim leading and trailing spaces before validating', () => {
                const result = FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer('  valid text  ');
                expect(result).toBeUndefined();
            });

            it('should normalize consecutive spaces before checking min length', () => {
                const result = FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer('a  b');
                expect(result).toBeUndefined();
            });

            it('should treat string of only spaces as empty (required error)', () => {
                const result = FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS.validateDisclaimer('     ');
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED);
            });
        });
    });
});
