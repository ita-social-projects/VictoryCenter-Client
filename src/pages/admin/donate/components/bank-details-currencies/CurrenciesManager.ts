import { useEffect, useState } from 'react';
import { bankDetailsConfig } from './BankDetailsCurrenciesConfig';

export enum Currencies {
    UAH = 'UAH',
    USD = 'USD',
    EUR = 'EUR',
}

export function useBankDetails<T extends keyof typeof bankDetailsConfig>(currency: T) {
    const [items, setItems] = useState<any[]>([]);
    const config = bankDetailsConfig[currency];

    useEffect(() => {
        config.fetch().then(setItems);
    }, [currency, config]);

    return { items, setItems, config };
}
