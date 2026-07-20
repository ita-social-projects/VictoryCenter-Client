export interface PublishedReportSettingsDto {
    disclaimerTitle: string;
    exchangeRate: number;
    programExpendituresReportingYear: number;
    publishedAt: string;
}

export interface PublishedFundsExpendituresItemDto {
    label: string;
    amountUah: number;
    amountUsd: number;
}

export interface PublishedFundsExpendituresGroupDto {
    totalUah: number;
    totalUsd: number;
    items: PublishedFundsExpendituresItemDto[];
}

export interface PublishedProgramExpendituresItemDto {
    label: string;
    reportingYear: number;
    amountUah: number;
    amountUsd: number;
}

export interface PublishedProgramExpendituresGroupDto {
    totalUah: number;
    totalUsd: number;
    items: PublishedProgramExpendituresItemDto[];
}

export interface PublishedMediaBlockDto {
    title: string;
    imageUrl: string | null;
    value?: number;
}

export interface PublishedReportMediaSettingsDto {
    collectedFunds: PublishedMediaBlockDto;
    changedLives: PublishedMediaBlockDto;
}

export interface PublishedReportFundsExpendituresDto {
    settings: PublishedReportSettingsDto;
    funding: PublishedFundsExpendituresGroupDto;
    expenses: PublishedFundsExpendituresGroupDto;
    programs: PublishedProgramExpendituresGroupDto;
    mediaSettings: PublishedReportMediaSettingsDto;
}
