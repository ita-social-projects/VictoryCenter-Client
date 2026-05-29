export const formatNumberDecimalComma = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).replace('.', ',');
};

export const formatWithSpaces = (value: number | string): string => {
    const num = Number(value);

    if (Number.isNaN(num)) return '';

    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 }).format(num).replace(/,/g, ' ');
};

export const formatNumberInput = (inputValue: string): string => {
    const digits = inputValue.replace(/\D/g, '');
    return digits ? formatWithSpaces(digits) : '';
};
