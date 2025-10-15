import { useEffect, useState } from 'react';
import { bankDetailsConfig } from '../bank-details-currencies-config/BankDetailsCurrenciesConfig';
import { BankCurrency } from '../../../../../../../src/types/admin/donate';

export enum Currencies {
    UAH = 'UAH',
    USD = 'USD',
    EUR = 'EUR',
}

export const mapCurrencyToBankCurrency = (currency: Currencies): BankCurrency => {
    switch (currency) {
        case Currencies.UAH:
            return BankCurrency.Uah;
        case Currencies.USD:
            return BankCurrency.Usd;
        case Currencies.EUR:
            return BankCurrency.Eur;
    }
};

export function useBankDetails<T extends keyof typeof bankDetailsConfig>(currency: T) {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const config = bankDetailsConfig[currency];

    useEffect(() => {
        let alive = true;
        setIsLoading(true);
        config
            .fetch()
            .then((data: any[]) => {
                if (alive) setItems(data);
            })
            .catch(() => {
                if (alive) setItems([]);
            })
            .finally(() => {
                if (alive) setIsLoading(false);
            });
        return () => {
            alive = false;
        };
    }, [currency, config]);

    return { items, setItems, config, isLoading };
}
