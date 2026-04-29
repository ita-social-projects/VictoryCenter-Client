import {
    REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS,
    REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS,
} from './reports-media-settings-schema';
import {
    REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION,
    REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION,
    REPORTS_TEXT,
} from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

describe('reports-media-settings-schema', () => {
    describe('REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS', () => {
        describe('validateTitle', () => {
            it('should return undefined for a valid title', () => {
                const result = REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitle('Valid title text');
                expect(result).toBeUndefined();
            });

            it('should return required error for an empty string', () => {
                const result = REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitle('');
                expect(result).toBe(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.getRequiredError());
            });

            it('should return min error when title is too short', () => {
                const shortTitle = 'a'.repeat(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.min - 1);
                const result = REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitle(shortTitle);
                expect(result).toBe(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(
                        REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.min,
                    ),
                );
            });

            it('should return undefined for title at min length', () => {
                const minTitle = 'a'.repeat(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.min);
                const result = REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitle(minTitle);
                expect(result).toBeUndefined();
            });

            it('should return max error when title is too long', () => {
                const longTitle = 'a'.repeat(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.max + 1);
                const result = REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitle(longTitle);
                expect(result).toBe(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                        REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.max,
                    ),
                );
            });

            it('should return undefined for title at max length', () => {
                const maxTitle = 'a'.repeat(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.max);
                const result = REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitle(maxTitle);
                expect(result).toBeUndefined();
            });

            it('should return required error for a whitespace-only title', () => {
                const result = REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitle('     ');
                expect(result).toBe(REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.title.getRequiredError());
            });

            it('should normalize consecutive spaces and validate successfully', () => {
                const result = REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitle('Valid   title   text');
                expect(result).toBeUndefined();
            });
        });
    });

    describe('REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS', () => {
        describe('validateTitle', () => {
            it('should return undefined for a valid title', () => {
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle('Valid title text');
                expect(result).toBeUndefined();
            });

            it('should return required error for an empty string', () => {
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle('');
                expect(result).toBe(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.getRequiredError());
            });

            it('should return min error when title is too short', () => {
                const shortTitle = 'a'.repeat(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.min - 1);
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle(shortTitle);
                expect(result).toBe(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(
                        REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.min,
                    ),
                );
            });

            it('should return undefined for title at min length', () => {
                const minTitle = 'a'.repeat(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.min);
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle(minTitle);
                expect(result).toBeUndefined();
            });

            it('should return max error when title is too long', () => {
                const longTitle = 'a'.repeat(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.max + 1);
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle(longTitle);
                expect(result).toBe(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                        REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.max,
                    ),
                );
            });

            it('should return undefined for title at max length', () => {
                const maxTitle = 'a'.repeat(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.max);
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle(maxTitle);
                expect(result).toBeUndefined();
            });

            it('should return required error for a whitespace-only title', () => {
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle('     ');
                expect(result).toBe(REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.title.getRequiredError());
            });

            it('should normalize consecutive spaces and validate successfully', () => {
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle('Valid   title   text');
                expect(result).toBeUndefined();
            });
        });

        describe('validateChangedLives', () => {
            it('should return undefined for a valid number', () => {
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateChangedLives(5);
                expect(result).toBeUndefined();
            });

            it('should return error for less than 2', () => {
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateChangedLives(0);
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(2));
            });

            it('should return error for negative number', () => {
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateChangedLives(-1);
                expect(result).toBe(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(2));
            });

            it('should return error for non-integer number', () => {
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateChangedLives(3.5);
                expect(result).toBe(REPORTS_TEXT.MESSAGE.INVALID_VALUE);
            });

            it('should return max error when value exceeds max', () => {
                const overMax = REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.changedLives.max + 1;
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateChangedLives(overMax);
                expect(result).toBe(
                    COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(
                        REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.changedLives.max,
                    ),
                );
            });

            it('should return undefined for value at max', () => {
                const result = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateChangedLives(
                    REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.changedLives.max,
                );
                expect(result).toBeUndefined();
            });
        });
    });
});
