import { parseAmount } from './parse-amount';

describe('parseAmount', () => {
    it('parses numeric string with spaces', () => {
        expect(parseAmount('7 265')).toBe(7265);
    });

    it('parses decimal values', () => {
        expect(parseAmount('4 200.50')).toBe(4200.5);
    });

    it('returns 0 for invalid numeric input', () => {
        expect(parseAmount('invalid')).toBe(0);
    });

    it('returns 0 for empty input', () => {
        expect(parseAmount('')).toBe(0);
    });
});
