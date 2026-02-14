import { ReportsMediaSettings, ReportsMediaSettingsCollectedFundsDto, ReportsMediaSettingsCollectedFunds, ReportsMediaSettingsChangedLives, ReportsMediaSettingsChangedLivesDto, ReportsMediaSettingsDto } from '@/types/admin/reports';

export const mapReportsMediaSettingsDtoToMediaSettings = (dto: ReportsMediaSettingsDto): ReportsMediaSettings => ({
    collectedFunds: mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds(dto.collectedFunds),
    changedLives: mapReportsMediaSettingsChangedLivesDtoToChangedLives(dto.changedLives),
});

export const mapReportsMediaSettingsCollectedFundsDtoToCollectedFunds = (dto: ReportsMediaSettingsCollectedFundsDto): ReportsMediaSettingsCollectedFunds => ({
    title: dto.title,
    collectedFunds: dto.collectedFunds,
    image: dto.image,
    imageId: dto.imageId,
});

export const mapReportsMediaSettingsChangedLivesDtoToChangedLives = (dto: ReportsMediaSettingsChangedLivesDto): ReportsMediaSettingsChangedLives => ({
    title: dto.title,
    changedLives: dto.changedLives,
    image: dto.image,
    imageId: dto.imageId,
});