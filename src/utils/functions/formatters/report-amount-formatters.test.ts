import { formatAllocationAmount, formatCollectedAmount } from './report-amount-formatters';

const normalizeSpaces = (value: string) => value.replace(/\u00a0/g, ' ');

describe('report-amount-formatters', () => {
    describe('formatAllocationAmount', () => {
        it('formats integer amounts with thousands separators', () => {
            expect(normalizeSpaces(formatAllocationAmount(1234))).toBe('1 234');
        });

        it('formats decimal amounts with comma for Ukrainian locale', () => {
            expect(normalizeSpaces(formatAllocationAmount(1234.56))).toBe('1 234,56');
        });

        it('formats decimal amounts with the English number format', () => {
            expect(formatAllocationAmount(1234.56, 'en-US')).toBe('1,234.56');
        });
    });

    describe('formatCollectedAmount', () => {
        it('truncates decimal amounts before formatting', () => {
            expect(normalizeSpaces(formatCollectedAmount(1249854.09))).toBe('1 249 854');
        });

        it('formats integer amounts with thousands separators', () => {
            expect(normalizeSpaces(formatCollectedAmount(1234))).toBe('1 234');
        });

        it('formats amounts with the English number format', () => {
            expect(formatCollectedAmount(1249854.09, 'en-US')).toBe('1,249,854');
        });
    });
});
