export const formatNumberDecimalComma = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).replace('.', ',');
};
