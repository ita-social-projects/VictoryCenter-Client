import { useEffect, useState } from 'react';
import { bankDetailsConfig } from './BankDetailsCurrenciesConfig';

export enum Currencies {
    UAH = 'UAH',
    USD = 'USD',
    EUR = 'EUR',
}

export function useBankDetails<T extends keyof typeof bankDetailsConfig>(currency: T) {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const config = bankDetailsConfig[currency];

    useEffect(() => {
        let alive = true;
        setIsLoading(true);
        config
            .fetch()
            .then((data: any[]) => alive && setItems(data))
            .finally(() => alive && setIsLoading(false));
        return () => {
            alive = false;
        };
    }, [currency, config]);

    return { items, setItems, config, isLoading };
}
