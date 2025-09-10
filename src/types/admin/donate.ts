export interface UahBankDetailsType {
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

export interface CorrespondentBankDetailsType {
    id: number;
    name: string;
    swift: string;
    account: string;
    iban: string;
}

export interface UsdBankDetailsType {
    id: number;
    name: string;
    receiver: string;
    iban: string;
    swift: string;
    address: string;
    correspondentBanks: CorrespondentBankDetailsType[];
}
