import { getUkrainianPlural } from './get-ukrainian-plural';

const forms = ['категорія', 'категорії', 'категорій'];

describe('getUkrainianPlural', () => {
    describe('nominative singular (one) — ends in 1, except 11', () => {
        it.each([1, 21, 31, 101])('returns "one" form for %i', (count) => {
            expect(getUkrainianPlural(count, forms)).toBe('категорія');
        });
    });

    describe('genitive singular (few) — ends in 2–4, except 12–14', () => {
        it.each([2, 3, 4, 22, 23, 24, 32, 102])('returns "few" form for %i', (count) => {
            expect(getUkrainianPlural(count, forms)).toBe('категорії');
        });
    });

    describe('genitive plural (many) — 0, ends in 0 or 5–9, and 11–19', () => {
        it.each([0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 19, 20, 25, 100, 111])(
            'returns "many" form for %i',
            (count) => {
                expect(getUkrainianPlural(count, forms)).toBe('категорій');
            },
        );
    });

    describe('negative numbers', () => {
        it('returns "one" form for -1', () => {
            expect(getUkrainianPlural(-1, forms)).toBe('категорія');
        });

        it('returns "few" form for -3', () => {
            expect(getUkrainianPlural(-3, forms)).toBe('категорії');
        });

        it('returns "many" form for -5', () => {
            expect(getUkrainianPlural(-5, forms)).toBe('категорій');
        });
    });
});
