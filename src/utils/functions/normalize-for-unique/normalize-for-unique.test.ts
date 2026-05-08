import { normalizeForUnique } from './normalize-for-unique';

describe('normalizeForUnique', () => {
    it('lowercases the value', () => {
        expect(normalizeForUnique('HELLO')).toBe('hello');
    });

    it('trims leading and trailing whitespace', () => {
        expect(normalizeForUnique('  hello  ')).toBe('hello');
    });

    it('sorts words alphabetically', () => {
        expect(normalizeForUnique('Приватні донори')).toBe('донори приватні');
    });

    it('produces the same result regardless of word order', () => {
        expect(normalizeForUnique('Донори приватні')).toBe(normalizeForUnique('Приватні донори'));
    });

    it('applies lowercasing and word sorting together', () => {
        expect(normalizeForUnique('ДОНОРИ ПРИВАТНІ')).toBe(normalizeForUnique('приватні донори'));
    });

    it('handles a single word', () => {
        expect(normalizeForUnique('hello')).toBe('hello');
    });
});
