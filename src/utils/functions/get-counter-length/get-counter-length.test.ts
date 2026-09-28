import { getCounterLength } from './get-counter-length';

describe('getCounterLength', () => {
    describe('empty / nullish input', () => {
        it.each([
            [undefined, 0],
            [null, 0],
            ['', 0],
        ])('returns 0 for %p', (value, expected) => {
            expect(getCounterLength(value)).toBe(expected);
        });
    });

    describe('trailing spaces', () => {
        it.each([
            ['Hello ', 5],
            ['Hello  ', 5],
            ['Hello     ', 5],
            ['Hello world ', 11],
        ])('does not count trailing spaces in %j', (value, expected) => {
            expect(getCounterLength(value)).toBe(expected);
        });

        it('returns 0 for a value made entirely of spaces', () => {
            expect(getCounterLength(' ')).toBe(0);
            expect(getCounterLength('   ')).toBe(0);
        });
    });

    describe('leading and internal spaces', () => {
        it.each([
            ['  Hello', 7],
            [' Hello', 6],
            ['Hello world', 11],
            ['a  b', 4],
        ])('still counts leading/internal spaces in %j', (value, expected) => {
            expect(getCounterLength(value)).toBe(expected);
        });

        it('counts leading spaces but not trailing ones when both are present', () => {
            expect(getCounterLength('  test  ')).toBe(6);
        });
    });

    describe('other whitespace textarea cases', () => {
        it.each([
            ['Hello\n', 6],
            ['Hello\t', 6],
            ['Hello\r\n', 7],
            ['Hello\u00A0', 6],
        ])('still counts %j', (value, expected) => {
            expect(getCounterLength(value)).toBe(expected);
        });

        it('does not strip spaces that come before a trailing newline', () => {
            expect(getCounterLength('Hello \n')).toBe(7);
        });

        it('strips only spaces after a trailing newline', () => {
            expect(getCounterLength('Hello\n  ')).toBe(6);
        });

        it('counts a value consisting only of newlines', () => {
            expect(getCounterLength('\n\n')).toBe(2);
        });
    });

    describe('non-ASCII input', () => {
        it('handles Cyrillic text', () => {
            expect(getCounterLength('Привіт ')).toBe(6);
        });

        it('uses UTF-16 length, consistent with maxLength / value.length', () => {
            expect(getCounterLength('😀 ')).toBe(2);
        });
    });

    it('does not mutate or depend on the original string', () => {
        const value = 'Hello  ';
        getCounterLength(value);
        expect(value).toBe('Hello  ');
    });
});