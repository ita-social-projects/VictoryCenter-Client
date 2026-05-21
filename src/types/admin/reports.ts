import {
    EntityLocalization,
    EntityLocalizationDto,
    EntityWithDtoLocalizations,
    EntityWithLocalizations,
} from '../common/language';
import { Image, ImageValues } from '../common/image';

export interface ReportsMediaSettingsCollectedFundsDto {
    title: string;
    collectedAmount?: number;
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

export type ReportFundsExpendituresTypeDto = FundsExpendituresTransactionType | 1 | 2;

export interface ReportFundsExpendituresSettingsDto {
    id: number;
    disclaimerTitle: string;
    exchangeRate: number;
}

export interface UpdateReportFundsExpendituresSettingsDto {
    disclaimerTitle: string;
    exchangeRate: number;
}

export interface ReportFundsExpendituresCategoryDto
    extends EntityWithDtoLocalizations<ReportFundsExpendituresCategoryLocalizationDto> {
    id: number;
    name: string;
    type: ReportFundsExpendituresTypeDto;
}

export interface CreateReportFundsExpendituresCategoryDto {
    name: string;
    type: ReportFundsExpendituresTypeDto;
}

export interface UpdateReportFundsExpendituresCategoryDto {
    name: string;
    type: ReportFundsExpendituresTypeDto;
}

export interface ReportFundsExpendituresRecordDto {
    id: number;
    categoryId: number;
    type: ReportFundsExpendituresTypeDto;
    reportingYear: number;
    amountUah: number;
    amountUsd: number;
}

export interface CreateReportFundsExpendituresRecordDto {
    categoryId: number;
    type: ReportFundsExpendituresTypeDto;
    reportingYear: number;
    amountUah: number;
    amountUsd: number;
}

export interface UpdateReportFundsExpendituresRecordDto {
    categoryId: number;
    type: ReportFundsExpendituresTypeDto;
    reportingYear: number;
    amountUah: number;
    amountUsd: number;
}

export interface ReportFundsExpendituresSummaryDto {
    incomeUahTotal: number;
    incomeUsdTotal: number;
    expenditureUahTotal: number;
    expenditureUsdTotal: number;
    incomeCategoriesCount: number;
    expenditureCategoriesCount: number;
}

export interface ReportFundsExpendituresSettings {
    id: number;
    disclaimerTitle: string | null;
    exchangeRate: string | null;
}

export interface ReportFundsExpendituresCategoryLocalizableFields {
    name: string;
}

export interface ReportFundsExpendituresCategoryLocalizationDto
    extends EntityLocalizationDto,
        ReportFundsExpendituresCategoryLocalizableFields {
    entityId: number;
}

export interface ReportFundsExpendituresCategoryLocalization
    extends EntityLocalization,
        ReportFundsExpendituresCategoryLocalizableFields {}

export interface CreateReportFundsExpendituresCategoryLocalizationDto {
    entityId: number;
    languageId: number;
    name: string;
}

export interface UpdateReportFundsExpendituresCategoryLocalizationDto {
    name: string;
}

export interface ReportFundsExpendituresSettingsLocalizableFields {
    disclaimerTitle: string;
}

export interface ReportFundsExpendituresSettingsLocalizationDto
    extends EntityLocalizationDto,
        ReportFundsExpendituresSettingsLocalizableFields {
    entityId: number;
}

export interface ReportFundsExpendituresSettingsLocalization
    extends EntityLocalization,
        ReportFundsExpendituresSettingsLocalizableFields {}

export interface CreateReportFundsExpendituresSettingsLocalizationDto {
    entityId: number;
    languageId: number;
    disclaimerTitle: string;
}

export interface UpdateReportFundsExpendituresSettingsLocalizationDto {
    disclaimerTitle: string;
}

export interface ReportFundsExpendituresCategory
    extends EntityWithLocalizations<ReportFundsExpendituresCategoryLocalization> {
    id: number;
    name: string;
    type: FundsExpendituresTransactionType;
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

export interface ProgramExpensesProgram {
    id: number;
    name: string;
}

export interface ProgramExpensesRecord {
    id: number;
    programId: number;
    programName: string;
    type: FundsExpendituresTransactionType;
    reportingYear: string;
    amountUah: string;
    amountUsd: string;
}

export interface ProgramExpensesSummary {
    totalAmountUah: number;
    totalAmountUsd: number;
}

export interface ProgramExpensesReadOnlyData {
    exchangeRate: string | null;
    programs: ProgramExpensesProgram[];
    summary: ProgramExpensesSummary;
    records: ProgramExpensesRecord[];
}

export interface ReportProgramExpendituresRecordDto {
    id: number;
    reportingYear: number;
    hippotherapyProgramCategoryId: number;
    amountUah: number;
    amountUsd: number;
}

export interface CreateReportProgramExpendituresRecordDto {
    reportingYear: number;
    hippotherapyProgramCategoryId: number;
    amountUah: number;
    amountUsd: number;
}

export interface UpdateReportProgramExpendituresRecordDto {
    hippotherapyProgramCategoryId: number;
    amountUah: number;
    amountUsd: number;
}
