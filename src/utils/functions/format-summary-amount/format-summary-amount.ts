export const formatSummaryAmount = (value?: number): string => {
    if (value === undefined) {
        return '';
    }

    return Math.trunc(value).toLocaleString('uk-UA');
};
