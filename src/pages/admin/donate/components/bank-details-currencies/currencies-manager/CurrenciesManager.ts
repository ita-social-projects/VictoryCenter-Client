import { useCallback } from 'react';
import { bankDetailsConfig } from '../bank-details-currencies-config/BankDetailsCurrenciesConfig';
import { BankCurrency } from '@/types/admin/donate';
import { RequestOptions } from '@/types/common/api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';

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

const NO_ITEMS: any[] = [];

export function useBankDetails<T extends keyof typeof bankDetailsConfig>(currency: T) {
    const client = useAdminClient();
    const config = bankDetailsConfig[currency];

    const fetchBankDetails = useCallback(
        async (options: RequestOptions): Promise<any[]> => (await config.fetch(client, options)) ?? [],
        [config, client],
    );

    const {
        data,
        setData: setItems,
        isLoading,
        error,
        refetch,
    } = useDataFetch<any[]>({
        initialData: [],
        fetchHandler: fetchBankDetails,
    });

    // useDataFetch keeps old data while refetching/after errors — it may belong to another currency.
    const items = isLoading || error ? NO_ITEMS : data;

    return { items, setItems, config, isLoading, error, refetch };
}
