import { Currency } from '@/types/public/donate-page';

export type LocaleCurrency = Currency.UAH | Currency.USD;

export interface CurrencyDisplay {
    symbol: string;
    position: 'prefix' | 'suffix';
}

export const CURRENCY_DISPLAY: Record<LocaleCurrency, CurrencyDisplay> = {
    [Currency.UAH]: { symbol: 'грн', position: 'suffix' },
    [Currency.USD]: { symbol: '$', position: 'prefix' },
};
