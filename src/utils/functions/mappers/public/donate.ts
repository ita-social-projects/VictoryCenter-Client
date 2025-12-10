import { Currency } from '@/types/public/donate-page';

export const currencyToString = (currency: Currency) => {
    switch (currency) {
        case Currency.UAH:
            return 'UAH';
        case Currency.USD:
            return 'USD';
        case Currency.EUR:
            return 'EUR';
    }
};

export const stringToCurrency = (currency: string) => {
    return Currency[currency as keyof typeof Currency];
};
