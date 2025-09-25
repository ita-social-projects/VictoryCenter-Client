export enum Currency {
    UAH,
    USD,
    EUR,
}

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
