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

export interface PublishedUahBankDetailsDto {
    id: number;
    name: string;
    receiver: string;
    edrpou: string;
    ukrainianIban: string;
    paymentPurpose: string;
}

export interface PublishedSupportOptionsDto {
    id: number;
    name: string;
    value: string;
    currency: Currency;
}

export interface PublishedCorrespondentBankDetailsDto {
    id: number;
    name: string;
    swift: string;
    account: string;
    foreignIban?: string;
    foreignBankDetailsId: number;
}

export interface PublishedForeignBankDetailsDto {
    id: number;
    name: string;
    receiver: string;
    ukrainianIban: string;
    swift: string;
    address: string;
    currency: Currency;
    correspondentBanks: PublishedCorrespondentBankDetailsDto[];
}

export interface DonatePageData {
    uahBankDetails: PublishedUahBankDetailsDto[];
    foreignBankDetails: PublishedForeignBankDetailsDto[];
    supportOptions: PublishedSupportOptionsDto[];
}
