import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from './WhoWeAreSchema';
import { WHO_WE_ARE_TEXT } from '../../../const/admin/who-we-are';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

describe('text validation', () => {
    it('reject null value', () => {
        expect(WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(null)).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        );
    });

    it('rejects too short text', () => {
        expect(WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText('abc')).toBe(
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(WHO_WE_ARE_TEXT.MIN_LENGTH),
        );
    });

    it('Accept validation', () => {
        expect(WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText('Correct text')).toBeUndefined();
    });
});
