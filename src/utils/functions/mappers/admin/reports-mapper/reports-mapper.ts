import {
    ReportsMediaSettings,
    ReportsMediaSettingsCollectedFundsDto,
    ReportsMediaSettingsCollectedFunds,
    ReportsMediaSettingsChangedLives,
    ReportsMediaSettingsChangedLivesDto,
    ReportsMediaSettingsDto,
} from '@/types/admin/reports';

export const mapReportsMediaSettingsDtoToMediaSettings = (dto: ReportsMediaSettingsDto): ReportsMediaSettings => ({
    collectedFunds: mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto.collectedFundsBlock),
    changedLives: mapReportsMediaSettingsChangedLivesDtoToChangedLives(dto.changedLivesBlock),
});

export const mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds = (
    dto: ReportsMediaSettingsCollectedFundsDto,
): ReportsMediaSettingsCollectedFunds => ({
    title: dto.title,
    collectedFunds: dto.collectedAmount,
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
