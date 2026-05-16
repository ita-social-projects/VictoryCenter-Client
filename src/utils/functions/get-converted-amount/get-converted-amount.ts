import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import { formatNumberDecimalComma } from '@/utils/functions/formatters/format-number';

const roundUpToTwoDecimals = (value: number): number => Math.ceil(value * 100) / 100;

export const getConvertedAmount = (value: string, exchangeRate: string | null | undefined): string | null => {
    const parsedExchangeRate = parseAmount(exchangeRate ?? '');
    if (parsedExchangeRate <= 0) {
        return null;
    }

    const normalizedValue = value.replaceAll(' ', '').replace(',', '.').trim();
    if (!normalizedValue || Number.isNaN(Number.parseFloat(normalizedValue))) {
        return null;
    }

    const parsedCurrentAmount = parseAmount(value);
    const convertedAmount = parsedCurrentAmount / parsedExchangeRate;

    const roundedConvertedAmount = roundUpToTwoDecimals(convertedAmount);

    return Number.isFinite(roundedConvertedAmount) ? formatNumberDecimalComma(roundedConvertedAmount) : null;
};
