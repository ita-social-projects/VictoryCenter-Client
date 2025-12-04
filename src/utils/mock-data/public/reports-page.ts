interface ReportsSummary {
    collected: {
        uah: number;
        usd: number;
    };
    livesChanged: number;
    exchangeRate?: number;
}

export const SUMMARY_DATA: ReportsSummary = {
    collected: {
        uah: 1249854.09,
        usd: 32890.9,
    },
    livesChanged: 205,
};

export const REPORTS_DATA = [
    { year: 2025, fileUrl: '/files/report-2025.pdf' },
    { year: 2024, fileUrl: '/files/report-2024.pdf' },
];
