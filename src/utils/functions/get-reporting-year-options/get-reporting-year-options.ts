export const getReportingYearOptions = (): string[] => {
    const currentYear = new Date().getFullYear();

    return [String(currentYear - 1), String(currentYear), String(currentYear + 1)];
};

export const getProgramReportingYearOptions = (selectedYear?: number | null): string[] => {
    const options = new Set(getReportingYearOptions());

    if (selectedYear !== undefined && selectedYear !== null) {
        options.add(String(selectedYear));
    }

    return Array.from(options).sort((a, b) => Number(a) - Number(b));
};
