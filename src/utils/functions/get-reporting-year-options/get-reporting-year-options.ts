export const getReportingYearOptions = (): string[] => {
    const currentYear = new Date().getFullYear();

    return [String(currentYear - 1), String(currentYear), String(currentYear + 1)];
};
