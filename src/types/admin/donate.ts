export interface CurrencyCategory {
    id: number;
    name: string;
}

export interface BankDetailsType {
    id: number;
    name: string;
    receiver: string;
    edrpou: string;
    iban: string;
    paymentPurpose: string;
}

export interface SupportOptionsType {
    id: number;
    name: string;
    value: string;
}
