export const formatSummaryAmount = (value?: number): string => {
    if (value === undefined) {
        return '';
    }

    return Math.round(value).toLocaleString('uk-UA');
};
