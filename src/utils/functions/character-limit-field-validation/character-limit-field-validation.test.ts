import { validateCharacterLimitOnBlur, validateCharacterLimitRealTime } from './character-limit-field-validation';

describe('validateCharacterLimitRealTime', () => {
    it('returns undefined when within the limit', () => {
        expect(validateCharacterLimitRealTime('hello', 10, 'too long')).toBeUndefined();
    });

    it('returns the max error when the normalised value exceeds max', () => {
        expect(validateCharacterLimitRealTime('a'.repeat(11), 10, 'too long')).toBe('too long');
    });

    it('collapses whitespace and strips leading spaces before measuring length', () => {
        expect(validateCharacterLimitRealTime('   a    b   c   ', 6, 'too long')).toBeUndefined();
    });
});

describe('validateCharacterLimitOnBlur', () => {
    it('returns the required error for an empty value', () => {
        expect(validateCharacterLimitOnBlur('', 2, 10, 'required', 'too short', 'too long')).toBe('required');
    });

    it('returns the required error for a spaces-only value', () => {
        expect(validateCharacterLimitOnBlur('   ', 2, 10, 'required', 'too short', 'too long')).toBe('required');
    });

    it('returns the min error when below the minimum', () => {
        expect(validateCharacterLimitOnBlur('a', 2, 10, 'required', 'too short', 'too long')).toBe('too short');
    });

    it('returns the max error when above the maximum', () => {
        expect(validateCharacterLimitOnBlur('a'.repeat(11), 2, 10, 'required', 'too short', 'too long')).toBe(
            'too long',
        );
    });

    it('returns undefined for a valid value', () => {
        expect(validateCharacterLimitOnBlur('valid', 2, 10, 'required', 'too short', 'too long')).toBeUndefined();
    });
});
