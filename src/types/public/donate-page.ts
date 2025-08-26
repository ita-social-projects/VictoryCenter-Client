export enum Currency {
    UAH,
    USD,
    EUR,
}

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

export enum DonateTab {
    oneTime,
    subscription,
}

export interface TabProps {
    tabs: TabItem[];
    activeTab: number;
    setActiveTab: (tab: number) => void;
}

export interface TabItem {
    id: number;
    label: string;
    disabled?: boolean;
}

export enum PaymentSystem {
    WayForPay = 'WayForPay',
}
