import { formatDate } from '@/utils/functions/formatters/format-date';

describe('formatDate', () => {
    const assertFormat = (input: string, expected: string): void => {
        expect(formatDate(input)).toBe(expected);
    };

    describe('valid date formats', () => {
        const validCases = [
            {
                description: 'standard ISO date (YYYY-MM-DD)',
                input: '2026-10-08',
                expected: '08/10/2026',
            },
            {
                description: 'full ISO 8601 string with UTC time (Z)',
                input: '2026-05-14T15:30:00Z',
                expected: '14/05/2026',
            },
            {
                description: 'ISO 8601 string with milliseconds and offset',
                input: '2026-12-31T23:59:59.999+02:00',
                expected: '31/12/2026',
            },
            {
                description: 'leap year date',
                input: '2024-02-29',
                expected: '29/02/2024',
            },
            {
                description: 'year with single-digit months/days properly padded',
                input: '2026-01-05',
                expected: '05/01/2026',
            },
        ];

        test.each(validCases)('formats $description correctly', ({ input, expected }) => {
            assertFormat(input, expected);
        });
    });

    describe('invalid date formats and edge cases', () => {
        const invalidCases = [
            { description: 'empty string', input: '' },
            { description: 'arbitrary non-date string', input: 'not-a-date' },
            { description: 'wrong delimiter (slashes)', input: '2026/10/08' },
            { description: 'already formatted as DD/MM/YYYY', input: '08/10/2026' },
            { description: 'US format MM-DD-YYYY', input: '10-08-2026' },
            { description: 'unpadded single digit month/day', input: '2026-1-8' },
            { description: 'inverted year digits', input: '26-10-08' },
            { description: 'leading spaces', input: '  2026-10-08' },
            { description: 'undefined or null cast to string', input: 'null' },
        ];

        test.each(invalidCases)('returns empty string for $description', ({ input }) => {
            assertFormat(input, '');
        });
    });

    describe('regex boundary behavior', () => {
        it('only captures the date from the beginning of the string', () => {
            assertFormat('prefix-2026-10-08', '');
        });

        it('ignores arbitrary trailing text after the date', () => {
            assertFormat('2026-10-08 extra text', '08/10/2026');
        });
    });
});
