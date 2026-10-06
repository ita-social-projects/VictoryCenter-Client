import {
    CreateReportFundsExpendituresCategoryDto,
    CreateReportFundsExpendituresRecordDto,
    FundsExpendituresSummary,
    FundsExpendituresTransactionType,
    ReportFundsExpendituresCategory,
    ReportFundsExpendituresCategoryDto,
    ReportFundsExpendituresCategoryLocalization,
    ReportFundsExpendituresRecord,
    ReportFundsExpendituresRecordDto,
    ReportFundsExpendituresRecordFormValues,
    ReportFundsExpendituresSettings,
    ReportFundsExpendituresSettingsDto,
    ReportFundsExpendituresSummaryDto,
    ReportFundsExpendituresTypeDto,
    ReportsMediaSettings,
    ReportsMediaSettingsCollectedFundsDto,
    ReportsMediaSettingsCollectedFunds,
    ReportsMediaSettingsChangedLives,
    ReportsMediaSettingsChangedLivesDto,
    ReportsMediaSettingsDto,
    UpdateReportFundsExpendituresCategoryDto,
    UpdateReportFundsExpendituresRecordDto,
    UpdateReportFundsExpendituresSettingsDto,
} from '@/types/admin/reports';

import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import { formatNumberDecimalComma } from '@/utils/functions/formatters/format-number';

export const mapReportsMediaSettingsDtoToMediaSettings = (dto: ReportsMediaSettingsDto): ReportsMediaSettings => ({
    collectedFunds: mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto.collectedFundsBlock),
    changedLives: mapReportsMediaSettingsChangedLivesDtoToChangedLives(dto.changedLivesBlock),
});

export const mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds = (
    dto: ReportsMediaSettingsCollectedFundsDto,
): ReportsMediaSettingsCollectedFunds => ({
    title: dto.title,
    titleEn: dto.titleEn,
    image: dto.image,
    imageId: dto.image?.id ?? null,
});

export const mapReportsMediaSettingsChangedLivesDtoToChangedLives = (
    dto: ReportsMediaSettingsChangedLivesDto,
): ReportsMediaSettingsChangedLives => ({
    title: dto.title,
    titleEn: dto.titleEn,
    changedLives: dto.changedLives,
    image: dto.image,
    imageId: dto.image?.id ?? null,
});

export const mapFundsExpendituresTypeDtoToTransactionType = (
    type: ReportFundsExpendituresTypeDto,
): FundsExpendituresTransactionType => {
    if (type === 1 || type === 'income') {
        return 'income';
    }

    if (type === 2 || type === 'expense') {
        return 'expense';
    }

    return String(type).toLowerCase() === 'income' ? 'income' : 'expense';
};

export const mapFundsExpendituresTransactionTypeToTypeDto = (
    type: FundsExpendituresTransactionType,
): ReportFundsExpendituresTypeDto => (type === 'income' ? 1 : 2);

export const mapReportFundsExpendituresSettingsDtoToSettings = (
    dto: ReportFundsExpendituresSettingsDto,
): ReportFundsExpendituresSettings => ({
    id: dto.id,
    disclaimerTitle: dto.disclaimerTitle,
    exchangeRate: formatNumberDecimalComma(dto.exchangeRate),
    programExpendituresReportingYear: dto.programExpendituresReportingYear,
    hasUnpublishedChanges: dto.hasUnpublishedChanges,
});

export const mapReportFundsExpendituresSettingsToUpdateDto = (
    settings: Pick<
        ReportFundsExpendituresSettings,
        'disclaimerTitle' | 'exchangeRate' | 'programExpendituresReportingYear'
    >,
): UpdateReportFundsExpendituresSettingsDto => ({
    disclaimerTitle: settings.disclaimerTitle ?? '',
    exchangeRate: Number.parseFloat((settings.exchangeRate ?? '0').replace(',', '.')) || 0,
    programExpendituresReportingYear: settings.programExpendituresReportingYear ?? new Date().getFullYear(),
});

export const mapReportFundsExpendituresCategoryDtoToCategory = (
    dto: ReportFundsExpendituresCategoryDto,
): ReportFundsExpendituresCategory => ({
    id: dto.id,
    name: dto.name,
    type: mapFundsExpendituresTypeDtoToTransactionType(dto.type),
    localizations: dto.localizations.map((loc) =>
        mapLocalizationDtoToModel<typeof loc, ReportFundsExpendituresCategoryLocalization>(loc),
    ),
});

export const mapReportFundsExpendituresCategoryToCreateDto = (
    category: Pick<ReportFundsExpendituresCategory, 'name' | 'type'>,
): CreateReportFundsExpendituresCategoryDto => ({
    name: category.name,
    type: mapFundsExpendituresTransactionTypeToTypeDto(category.type),
});

export const mapReportFundsExpendituresCategoryToUpdateDto = (
    category: Pick<ReportFundsExpendituresCategory, 'name' | 'type'>,
): UpdateReportFundsExpendituresCategoryDto => ({
    name: category.name,
    type: mapFundsExpendituresTransactionTypeToTypeDto(category.type),
});

export const mapReportFundsExpendituresRecordDtoToRecord = (
    dto: ReportFundsExpendituresRecordDto,
): ReportFundsExpendituresRecord => ({
    id: dto.id,
    categoryId: dto.categoryId,
    type: mapFundsExpendituresTypeDtoToTransactionType(dto.type),
    reportingYear: String(dto.reportingYear),
    amountUah: formatNumberDecimalComma(dto.amountUah),
    amountUsd: formatNumberDecimalComma(dto.amountUsd),
});

const parseAmountValue = (value: string): number => Number.parseFloat(value.replaceAll(' ', '').replace(',', '.')) || 0;

const mapReportFundsExpendituresRecordToRequestDto = (record: ReportFundsExpendituresRecordFormValues) => {
    const isUsdSource = record.lastEditedField === 'amountUsd';

    return {
        categoryId: record.categoryId,
        type: mapFundsExpendituresTransactionTypeToTypeDto(record.type),
        reportingYear: Number.parseInt(record.reportingYear, 10) || new Date().getFullYear(),
        amount: parseAmountValue(isUsdSource ? record.amountUsd : record.amountUah),
        currency: isUsdSource ? (2 as const) : (1 as const),
    };
};

export const mapReportFundsExpendituresRecordToCreateDto = (
    record: ReportFundsExpendituresRecordFormValues,
): CreateReportFundsExpendituresRecordDto => mapReportFundsExpendituresRecordToRequestDto(record);

export const mapReportFundsExpendituresRecordToUpdateDto = (
    record: ReportFundsExpendituresRecordFormValues,
): UpdateReportFundsExpendituresRecordDto => mapReportFundsExpendituresRecordToRequestDto(record);

export const mapReportFundsExpendituresSummaryDtoToSummary = (
    dto: ReportFundsExpendituresSummaryDto,
): FundsExpendituresSummary => ({
    totalCollectedUah: dto.incomeUahTotal,
    totalCollectedUsd: dto.incomeUsdTotal,
    totalSpentUah: dto.expenditureUahTotal,
    totalSpentUsd: dto.expenditureUsdTotal,
    incomeCategories: dto.incomeCategoriesCount,
    expenseCategories: dto.expenditureCategoriesCount,
});
