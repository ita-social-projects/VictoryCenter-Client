import { Currency } from '@/types/common/currency';
import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
    it('puts the UAH symbol after the amount', () => {
        expect(formatCurrency('30 000', Currency.UAH)).toBe('30 000 грн');
    });

    it('puts the USD symbol before the amount', () => {
        expect(formatCurrency('30,000', Currency.USD)).toBe('$30,000');
    });
});
