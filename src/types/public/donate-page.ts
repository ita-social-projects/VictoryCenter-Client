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

export enum BankCurrency {
    Uah = 0,
    Usd = 1,
    Eur = 2,
}

export interface PublicUahBankDetailsDto {
    id: number;
    name: string; // TODO:
    receiver: string; // TODO:
    edrpou: string; // TODO:
    iban: string; // TODO:
    paymentPurpose: string; // TODO:
}

export interface PublicSupportOptionsDto {
    id: number;
    name: string; // TODO:
    value: string; // TODO:
    currency: BankCurrency; // TODO:
}

export interface PublicForeignBankDetailsDto {
    id: number;
    name: string; // TODO:
    receiver: string; // TODO:
    iban: string; // TODO:
    swift: string; // TODO:
    address: string; // TODO:
    currency: BankCurrency;
    correspondentBanks: PublicCorrespondentBankDetailsDto[]; // TODO: можливо цього не буде в public
}

// TODO:
export interface PublicCorrespondentBankDetailsDto {
    id: number;
    name: string;
    swift: string;
    account: string;
    iban?: string;
    foreignBankDetailsId: number;
}

export interface DonatePageData {
    uahBankDetails: PublicUahBankDetailsDto[];
    foreignBankDetails: PublicForeignBankDetailsDto[];
    supportOptions: PublicSupportOptionsDto[];
}
