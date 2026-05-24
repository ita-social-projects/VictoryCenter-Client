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
    image: dto.image,
    imageId: dto.image?.id ?? null,
});

export const mapReportsMediaSettingsChangedLivesDtoToChangedLives = (
    dto: ReportsMediaSettingsChangedLivesDto,
): ReportsMediaSettingsChangedLives => ({
    title: dto.title,
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
});

export const mapReportFundsExpendituresSettingsToUpdateDto = (
    settings: Pick<ReportFundsExpendituresSettings, 'disclaimerTitle' | 'exchangeRate'>,
): UpdateReportFundsExpendituresSettingsDto => ({
    disclaimerTitle: settings.disclaimerTitle ?? '',
    exchangeRate: Number.parseFloat((settings.exchangeRate ?? '0').replace(',', '.')) || 0,
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

type ReportFundsExpendituresRecordRequestPayload = Pick<
    ReportFundsExpendituresRecord,
    'categoryId' | 'type' | 'reportingYear' | 'amountUah' | 'amountUsd'
>;

const mapReportFundsExpendituresRecordToRequestDto = (record: ReportFundsExpendituresRecordRequestPayload) => ({
    categoryId: record.categoryId,
    type: mapFundsExpendituresTransactionTypeToTypeDto(record.type),
    reportingYear: Number.parseInt(record.reportingYear, 10) || new Date().getFullYear(),
    amountUah: Number.parseFloat(record.amountUah.replaceAll(' ', '').replace(',', '.')) || 0,
    amountUsd: Number.parseFloat(record.amountUsd.replaceAll(' ', '').replace(',', '.')) || 0,
});

export const mapReportFundsExpendituresRecordToCreateDto = (
    record: ReportFundsExpendituresRecordRequestPayload,
): CreateReportFundsExpendituresRecordDto => mapReportFundsExpendituresRecordToRequestDto(record);

export const mapReportFundsExpendituresRecordToUpdateDto = (
    record: ReportFundsExpendituresRecordRequestPayload,
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
