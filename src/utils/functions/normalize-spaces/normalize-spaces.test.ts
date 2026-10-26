import { endsWithSpace, normalizeSpaces, startsWithSpace } from './normalize-spaces';

const NBSP = '\u00A0';

describe('normalizeSpaces', () => {
    it('collapses runs of spaces and nbsp into a single space', () => {
        expect(normalizeSpaces(`A ${NBSP} ${NBSP}B`, false)).toBe('A B');
    });

    it('keeps a single leading space when not stripping', () => {
        expect(normalizeSpaces(` ${NBSP}A`, false)).toBe(' A');
    });

    it('strips leading spaces when requested', () => {
        expect(normalizeSpaces(` ${NBSP}A`, true)).toBe('A');
    });
});

describe('endsWithSpace / startsWithSpace', () => {
    it('treats nbsp as a space', () => {
        expect(endsWithSpace(`A${NBSP}`)).toBe(true);
        expect(startsWithSpace(`${NBSP}A`)).toBe(true);
    });

    it('returns false for text without boundary spaces', () => {
        expect(endsWithSpace('A')).toBe(false);
        expect(startsWithSpace('A')).toBe(false);
    });
});
