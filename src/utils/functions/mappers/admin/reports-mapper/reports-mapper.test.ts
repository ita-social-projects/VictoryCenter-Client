import {
    ReportFundsExpendituresCategoryDto,
    ReportFundsExpendituresRecordDto,
    ReportFundsExpendituresSettingsDto,
    ReportFundsExpendituresSummaryDto,
    ReportsMediaSettingsCollectedFundsDto,
    ReportsMediaSettingsChangedLivesDto,
    ReportsMediaSettingsDto,
} from '@/types/admin/reports';
import {
    mapFundsExpendituresTransactionTypeToTypeDto,
    mapFundsExpendituresTypeDtoToTransactionType,
    mapReportFundsExpendituresCategoryDtoToCategory,
    mapReportFundsExpendituresRecordToCreateDto,
    mapReportFundsExpendituresRecordToUpdateDto,
    mapReportFundsExpendituresRecordDtoToRecord,
    mapReportFundsExpendituresSettingsDtoToSettings,
    mapReportFundsExpendituresSummaryDtoToSummary,
    mapReportsMediaSettingsDtoToMediaSettings,
    mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds,
    mapReportsMediaSettingsChangedLivesDtoToChangedLives,
} from './reports-mapper';

describe('reports-mapper', () => {
    describe('mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds', () => {
        it('should map dto with image correctly (without collected amount from API)', () => {
            const dto: ReportsMediaSettingsCollectedFundsDto = {
                title: 'Зібрані кошти',
                image: { id: 10, url: 'https://img/cf.png', mimeType: 'image/png' },
                imageId: 10,
            };

            const result = mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto);

            expect(result).toEqual({
                title: 'Зібрані кошти',
                image: dto.image,
                imageId: 10,
            });
        });

        it('should ignore legacy collectedAmount when present', () => {
            const dto: ReportsMediaSettingsCollectedFundsDto = {
                title: 'Title',
                collectedAmount: 999,
                image: { id: 5, url: 'https://img/5.png', mimeType: 'image/jpeg' },
                imageId: 5,
            };

            const result = mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto);

            expect(result).toEqual({
                title: 'Title',
                image: dto.image,
                imageId: 5,
            });
        });

        it('should set imageId from image.id when image is present', () => {
            const dto: ReportsMediaSettingsCollectedFundsDto = {
                title: 'Title',
                image: { id: 42, url: 'https://img/42.png', mimeType: 'image/png' },
                imageId: 99,
            };

            const result = mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto);

            expect(result.imageId).toBe(42);
        });

        it('should set imageId to null when image is null', () => {
            const dto: ReportsMediaSettingsCollectedFundsDto = {
                title: 'Title',
                image: null,
                imageId: null,
            };

            const result = mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto);

            expect(result.imageId).toBeNull();
            expect(result.image).toBeNull();
        });
    });

    describe('mapReportsMediaSettingsChangedLivesDtoToChangedLives', () => {
        it('should map dto with image correctly', () => {
            const dto: ReportsMediaSettingsChangedLivesDto = {
                title: 'Змінені життя',
                changedLives: 56,
                image: { id: 20, url: 'https://img/cl.png', mimeType: 'image/png' },
                imageId: 20,
            };

            const result = mapReportsMediaSettingsChangedLivesDtoToChangedLives(dto);

            expect(result).toEqual({
                title: 'Змінені життя',
                changedLives: 56,
                image: dto.image,
                imageId: 20,
            });
        });

        it('should set imageId from image.id when image is present', () => {
            const dto: ReportsMediaSettingsChangedLivesDto = {
                title: 'Title',
                changedLives: 10,
                image: { id: 33, url: 'https://img/33.png', mimeType: 'image/jpeg' },
                imageId: 50,
            };

            const result = mapReportsMediaSettingsChangedLivesDtoToChangedLives(dto);

            expect(result.imageId).toBe(33);
        });

        it('should set imageId to null when image is null', () => {
            const dto: ReportsMediaSettingsChangedLivesDto = {
                title: 'Title',
                changedLives: 0,
                image: null,
                imageId: null,
            };

            const result = mapReportsMediaSettingsChangedLivesDtoToChangedLives(dto);

            expect(result.imageId).toBeNull();
            expect(result.image).toBeNull();
        });
    });

    describe('mapReportsMediaSettingsDtoToMediaSettings', () => {
        it('should map full dto with both blocks', () => {
            const dto: ReportsMediaSettingsDto = {
                collectedFundsBlock: {
                    title: 'CF Title',
                    image: { id: 1, url: 'https://img/1.png', mimeType: 'image/png' },
                    imageId: 1,
                },
                changedLivesBlock: {
                    title: 'CL Title',
                    changedLives: 100,
                    image: { id: 2, url: 'https://img/2.png', mimeType: 'image/jpeg' },
                    imageId: 2,
                },
            };

            const result = mapReportsMediaSettingsDtoToMediaSettings(dto);

            expect(result).toEqual({
                collectedFunds: {
                    title: 'CF Title',
                    image: dto.collectedFundsBlock.image,
                    imageId: 1,
                },
                changedLives: {
                    title: 'CL Title',
                    changedLives: 100,
                    image: dto.changedLivesBlock.image,
                    imageId: 2,
                },
            });
        });

        it('should handle null images in both blocks', () => {
            const dto: ReportsMediaSettingsDto = {
                collectedFundsBlock: {
                    title: 'Empty CF',
                    image: null,
                    imageId: null,
                },
                changedLivesBlock: {
                    title: 'Empty CL',
                    changedLives: 0,
                    image: null,
                    imageId: null,
                },
            };

            const result = mapReportsMediaSettingsDtoToMediaSettings(dto);

            expect(result.collectedFunds.imageId).toBeNull();
            expect(result.collectedFunds.image).toBeNull();
            expect(result.changedLives.imageId).toBeNull();
            expect(result.changedLives.image).toBeNull();
        });
    });

    describe('funds expenditures mappers', () => {
        it('should map type dto to transaction type', () => {
            expect(mapFundsExpendituresTypeDtoToTransactionType(1)).toBe('income');
            expect(mapFundsExpendituresTypeDtoToTransactionType(2)).toBe('expense');
            expect(mapFundsExpendituresTypeDtoToTransactionType('income')).toBe('income');
            expect(mapFundsExpendituresTypeDtoToTransactionType('expense')).toBe('expense');
        });

        it('should map transaction type to dto enum', () => {
            expect(mapFundsExpendituresTransactionTypeToTypeDto('income')).toBe(1);
            expect(mapFundsExpendituresTransactionTypeToTypeDto('expense')).toBe(2);
        });

        it('should map settings dto to settings', () => {
            const dto: ReportFundsExpendituresSettingsDto = {
                id: 1,
                disclaimerTitle: 'Disclaimer',
                exchangeRate: 42.18,
                programExpendituresReportingYear: 2025,
            };

            expect(mapReportFundsExpendituresSettingsDtoToSettings(dto)).toEqual({
                id: 1,
                disclaimerTitle: 'Disclaimer',
                exchangeRate: '42,18',
                programExpendituresReportingYear: 2025,
            });
        });

        it('should map category dto to category with empty localizations', () => {
            const dto: ReportFundsExpendituresCategoryDto = {
                id: 2,
                name: 'Category',
                type: 2,
                localizations: [],
            };

            expect(mapReportFundsExpendituresCategoryDtoToCategory(dto)).toEqual({
                id: 2,
                name: 'Category',
                type: 'expense',
                localizations: [],
            });
        });

        it('should map category dto to category with localizations', () => {
            const dto: ReportFundsExpendituresCategoryDto = {
                id: 2,
                name: 'Category',
                type: 2,
                localizations: [
                    {
                        entityId: 2,
                        localizationInfoDto: { id: 1, code: 'en' },
                        translationStatus: 1,
                        name: 'Category EN',
                    },
                ],
            };

            expect(mapReportFundsExpendituresCategoryDtoToCategory(dto)).toEqual({
                id: 2,
                name: 'Category',
                type: 'expense',
                localizations: [
                    {
                        entityId: 2,
                        language: { id: 1, code: 'en' },
                        translationStatus: 1,
                        name: 'Category EN',
                    },
                ],
            });
        });

        it('should map record dto to record', () => {
            const dto: ReportFundsExpendituresRecordDto = {
                id: 3,
                categoryId: 2,
                type: 1,
                reportingYear: 2026,
                amountUah: 125.5,
                amountUsd: 3.75,
            };

            expect(mapReportFundsExpendituresRecordDtoToRecord(dto)).toEqual({
                id: 3,
                categoryId: 2,
                type: 'income',
                reportingYear: '2026',
                amountUah: '125,5',
                amountUsd: '3,75',
            });
        });

        it('should map summary dto to summary', () => {
            const dto: ReportFundsExpendituresSummaryDto = {
                incomeUahTotal: 100,
                incomeUsdTotal: 10,
                expenditureUahTotal: 80,
                expenditureUsdTotal: 8,
                incomeCategoriesCount: 4,
                expenditureCategoriesCount: 3,
            };

            expect(mapReportFundsExpendituresSummaryDtoToSummary(dto)).toEqual({
                totalCollectedUah: 100,
                totalCollectedUsd: 10,
                totalSpentUah: 80,
                totalSpentUsd: 8,
                incomeCategories: 4,
                expenseCategories: 3,
            });
        });

        it('should preserve decimal amounts when mapping record to create dto', () => {
            const result = mapReportFundsExpendituresRecordToCreateDto({
                categoryId: 2,
                type: 'expense',
                reportingYear: '2026',
                amountUah: '1 249 854,99',
                amountUsd: '1234.56',
            });

            expect(result).toEqual({
                categoryId: 2,
                type: 2,
                reportingYear: 2026,
                amountUah: 1249854.99,
                amountUsd: 1234.56,
            });
        });

        it('should preserve decimal amounts when mapping record to update dto', () => {
            const result = mapReportFundsExpendituresRecordToUpdateDto({
                categoryId: 1,
                type: 'income',
                reportingYear: '2025',
                amountUah: '350.99',
                amountUsd: '9.5',
            });

            expect(result).toEqual({
                categoryId: 1,
                type: 1,
                reportingYear: 2025,
                amountUah: 350.99,
                amountUsd: 9.5,
            });
        });
    });
});
