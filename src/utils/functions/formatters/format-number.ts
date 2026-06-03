export const formatNumberDecimalComma = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).replace(/\./g, ',');
};

const formatIntegerWithSpaces = (value: string): string => {
    const sign = value.startsWith('-') ? '-' : '';
    const digits = sign ? value.slice(1) : value;

    if (digits.length <= 3) return `${sign}${digits}`;

    const firstGroupLength = digits.length % 3 || 3;
    const groups = [digits.slice(0, firstGroupLength)];

    for (let index = firstGroupLength; index < digits.length; index += 3) {
        groups.push(digits.slice(index, index + 3));
    }

    return `${sign}${groups.join(' ')}`;
};

export const normalizeFormattedNumber = (value: string): string => value.replace(/\s/g, '').replace(/,/g, '.');

export const parseFormattedNumber = (value: string): number | null => {
    const normalizedValue = normalizeFormattedNumber(value);
    if (!normalizedValue) return null;

    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
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
    const hasLeadingMinus = raw.trimStart().startsWith('-');
    const sanitized = raw
        .replace(/,/g, '.')
        .replace(/[^0-9.-]/g, '')
        .replace(/-/g, '');
    let cleaned = hasLeadingMinus ? `-${sanitized}` : sanitized;
    const sign = cleaned.startsWith('-') ? '-' : '';

    cleaned = sign ? cleaned.slice(1) : cleaned;

    const parts = cleaned.split('.');
    if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    const [intPart, fracPart] = cleaned.split('.');
    const formattedInt = `${sign}${formatIntegerWithSpaces(intPart)}`;

    return fracPart !== undefined ? `${formattedInt}.${fracPart.slice(0, 2)}` : formattedInt;
};
