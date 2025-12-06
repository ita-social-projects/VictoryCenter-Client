export enum BankCurrency {
    Uah = 0,
    Usd = 1,
    Eur = 2,
}

// UAH Bank Details
export interface UahBankDetailsDto {
    id: number;
    name: string;
    receiver: string;
    edrpou: string;
    ukrainianIban: string;
    paymentPurpose: string;
}

export interface CreateUahBankDetails extends Omit<UahBankDetailsDto, 'id'> {}

export interface UpdateUahBankDetails extends Omit<UahBankDetailsDto, 'id'> {}

// Support Options
export interface SupportOptionsDto {
    id: number;
    name: string;
    value: string;
    currency: BankCurrency;
}

export interface CreateSupportOptionsDto extends Omit<SupportOptionsDto, 'id'> {}

export interface UpdateSupportOptionsDto extends Omit<SupportOptionsDto, 'id'> {}

// Correspondent Bank Details
export interface CorrespondentBankDetailsDto {
    id: number;
    name: string;
    swift: string;
    account: string;
    foreignIban?: string;
    foreignBankDetailsId: number;
}

export interface CreateCorrespondentBankDetails extends Omit<CorrespondentBankDetailsDto, 'id'> {}

export interface UpdateCorrespondentBankDetails extends Omit<CorrespondentBankDetailsDto, 'id'> {}

// Foreign Bank Details
export interface ForeignBankDetailsDto {
    id: number;
    name: string;
    receiver: string;
    ukrainianIban: string;
    swift: string;
    address: string;
    currency: BankCurrency;
    correspondentBanks: CorrespondentBankDetailsDto[];
}

export interface CreateForeignBankDetails extends Omit<ForeignBankDetailsDto, 'id' | 'correspondentBanks'> {}

export interface UpdateForeignBankDetails extends Omit<ForeignBankDetailsDto, 'id' | 'correspondentBanks'> {}
