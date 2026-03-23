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
