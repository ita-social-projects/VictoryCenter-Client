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

export const formatCurrencyInput = (raw: string): string => {
    if (/[^0-9.,\s]/.test(raw)) return raw;

    let cleaned = raw.replace(',', '.');
    cleaned = cleaned.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    const [intPart, fracPart] = cleaned.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return fracPart !== undefined ? `${formattedInt}.${fracPart.slice(0, 2)}` : formattedInt;
};
