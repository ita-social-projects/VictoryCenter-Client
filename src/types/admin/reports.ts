import { Image, ImageValues } from '../common/image';

export interface ReportsMediaSettingsCollectedFundsDto {
    title: string;
    collectedAmount: number;
    image: Image | null;
    imageId: number | null;
}

export interface ReportsMediaSettingsChangedLivesDto {
    title: string;
    changedLives: number;
    image: Image | null;
    imageId: number | null;
}

export interface ReportsMediaSettingsDto {
    collectedFundsBlock: ReportsMediaSettingsCollectedFundsDto;
    changedLivesBlock: ReportsMediaSettingsChangedLivesDto;
}

export type ReportsMediaSettingsCollectedFunds = {
    title: string;
    collectedFunds: number;
    image: Image | ImageValues | null;
    imageId: number | null;
};

export type ReportsMediaSettingsChangedLives = {
    title: string;
    changedLives: number;
    image: Image | ImageValues | null;
    imageId: number | null;
};

export type ReportsMediaSettings = {
    collectedFunds: ReportsMediaSettingsCollectedFunds;
    changedLives: ReportsMediaSettingsChangedLives;
};

// Update DTOs
export interface UpdateReportsMediaSettingsCollectedFundsDto {
    title: string;
    collectedAmount: number;
    imageId: number | null;
}

export interface UpdateReportsMediaSettingsChangedLivesDto {
    title: string;
    changedLives: number;
    imageId: number | null;
}

export interface UpdateReportsMediaSettingsDto {
    collectedFundsBlock: UpdateReportsMediaSettingsCollectedFundsDto;
    changedLivesBlock: UpdateReportsMediaSettingsChangedLivesDto;
}

// Update Request
export interface ReportsMediaSettingsCollectedFundsUpdateRequest {
    title: string;
    collectedFunds: number;
    imageId: number | null;
    image: Image | ImageValues | null;
}

export interface ReportsMediaSettingsChangedLivesUpdateRequest {
    title: string;
    changedLives: number;
    imageId: number | null;
    image: Image | ImageValues | null;
}

export interface ReportsMediaSettingsUpdateRequest {
    collectedFunds: ReportsMediaSettingsCollectedFundsUpdateRequest;
    changedLives: ReportsMediaSettingsChangedLivesUpdateRequest;
}

// Funds & Expenditures

export type FundsExpendituresTransactionType = 'income' | 'expense';

export interface ReportFundsExpendituresSettings {
    id: number;
    disclaimerTitle: string | null;
    exchangeRate: string | null;
}

export interface ReportFundsExpendituresCategory {
    id: number;
    name: string;
}

export interface ReportFundsExpendituresRecord {
    id: number;
    categoryId: number;
    type: FundsExpendituresTransactionType;
    reportingYear: string;
    amountUah: string;
    amountUsd: string;
}

export interface FundsExpendituresSummary {
    totalCollectedUah: number;
    totalCollectedUsd: number;
    totalSpentUah: number;
    totalSpentUsd: number;
    incomeCategories: number;
    expenseCategories: number;
}
