import { currencyToString, stringToCurrency } from './donate';
import { Currency } from '@app-types/public/donate-page';

describe('currencyToString', () => {
    it('returns "UAH" for Currency.UAH', () => {
        expect(currencyToString(Currency.UAH)).toBe('UAH');
    });

    it('returns "USD" for Currency.USD', () => {
        expect(currencyToString(Currency.USD)).toBe('USD');
    });

    it('returns "EUR" for Currency.EUR', () => {
        expect(currencyToString(Currency.EUR)).toBe('EUR');
    });
});

describe('stringToCurrency', () => {
    it('returns Currency.UAH for "UAH"', () => {
        expect(stringToCurrency('UAH')).toBe(Currency.UAH);
    });

    it('returns Currency.USD for "USD"', () => {
        expect(stringToCurrency('USD')).toBe(Currency.USD);
    });

    it('returns Currency.EUR for "EUR"', () => {
        expect(stringToCurrency('EUR')).toBe(Currency.EUR);
    });

    it('returns undefined for unknown currency string', () => {
        expect(stringToCurrency('GBP')).toBeUndefined();
    });
});
