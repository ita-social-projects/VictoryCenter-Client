import { Image, ImageValues } from '../common/image';

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

export type ReportsMediaSettingsDto = {
    collectedFunds: ReportsMediaSettingsCollectedFundsDto;
    changedLives: ReportsMediaSettingsChangedLivesDto;
};

export interface ReportsMediaSettingsCollectedFundsDto {
    title: string;
    collectedFunds: number;
    image: Image | ImageValues | null;
    imageId: number | null;
}

export interface ReportsMediaSettingsChangedLivesDto {
    title: string;
    changedLives: number;
    image: Image | ImageValues | null;
    imageId: number | null;
}

export interface UpdateReportsMediaSettingsCollectedFundsDto {
    title: string;
    collectedFunds: number;
    imageId: number | null;
}

export interface UpdateReportsMediaSettingsChangedLivesDto {
    title: string;
    changedLives: number;
    imageId: number | null;
}

export interface UpdateReportsMediaSettingsDto {
    collectedFunds: UpdateReportsMediaSettingsCollectedFundsDto;
    changedLives: UpdateReportsMediaSettingsChangedLivesDto;
}

export interface ReportsMediaSettingsUpdateRequest {
    collectedFunds: ReportsMediaSettingsCollectedFundsUpdateRequest;
    changedLives: ReportsMediaSettingsChangedLivesUpdateRequest;
}

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
