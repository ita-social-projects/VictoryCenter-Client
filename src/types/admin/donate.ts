export interface UahBankDetailsType {
    id: number;
    name: string;
    receiver: string;
    edrpou: string;
    ukrainianIban: string;
    paymentPurpose: string;
}

export interface SupportOptionsType {
    id: number;
    name: string;
    value: string;
    currency: BankCurrency;
}

export enum BankCurrency {
    Uah = 0,
    Usd = 1,
    Eur = 2,
}

export interface CreateSupportOptionsRequest {
    name: string;
    value: string;
    currency: BankCurrency;
}

export interface UpdateSupportOptionsRequest {
    name: string;
    value: string;
}

export interface CorrespondentBankDetailsType {
    id: number;
    name: string;
    swift: string;
    account: string;
    foreignIban?: string;
    foreignBankDetailsId: number;
}

export interface ForeignBankDetailsType {
    id: number;
    name: string;
    receiver: string;
    ukrainianIban: string;
    swift: string;
    address: string;
    currency: BankCurrency;
    correspondentBanks: CorrespondentBankDetailsType[];
}
