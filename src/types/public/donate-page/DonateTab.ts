export enum DonateTab {
    oneTime,
    subscription,
}

export enum CurrencyTab {
    uah,
    usd,
    eur,
}

export interface TabProps<T> {
    tabs: TabItem<T>[];
    activeTab: T;
    setActiveTab: (tab: T) => void;
}

export interface TabItem<T> {
    id: T;
    label: string;
    disabled?: boolean;
}
