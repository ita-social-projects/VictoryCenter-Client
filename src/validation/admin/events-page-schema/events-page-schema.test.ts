import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENTS_PAGE_VALIDATION } from '@/const/admin/events';
import { getEventsPageTextValidationError } from './events-page-schema';

describe('Events page text validation', () => {
    const rule = EVENTS_PAGE_VALIDATION.PAGE_DESCRIPTION;

    it.each([
        ['', COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED],
        ['    ', COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED],
        ['<p><br /></p>', COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED],
        ['a'.repeat(9), COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10)],
        ['a'.repeat(10), undefined],
        ['a'.repeat(1000), undefined],
        ['a'.repeat(1001), COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(1000)],
    ])('validates visible text %p', (value, expectedError) => {
        expect(getEventsPageTextValidationError(value, rule)).toBe(expectedError);
    });

    it('does not count HTML tags toward visible text length', () => {
        const value = `<p>${'a'.repeat(1000)}</p><strong></strong>`;

        expect(getEventsPageTextValidationError(value, rule)).toBeUndefined();
    });

    it('uses the common Ukrainian title validation messages', () => {
        const titleRule = EVENTS_PAGE_VALIDATION.EVENTS_BLOCK_TITLE;

        expect(getEventsPageTextValidationError('', titleRule)).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        );
        expect(getEventsPageTextValidationError('a'.repeat(9), titleRule)).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10),
        );
        expect(getEventsPageTextValidationError('a'.repeat(101), titleRule)).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(100),
        );
    });
});
