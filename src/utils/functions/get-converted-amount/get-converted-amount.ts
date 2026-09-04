import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';
import { formatNumberDecimalComma } from '@/utils/functions/formatters/format-number';

const roundToTwoDecimals = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export type AmountConversionDirection = 'uahToUsd' | 'usdToUah';

export const getConvertedAmount = (
    value: string,
    exchangeRate: string | null | undefined,
    direction: AmountConversionDirection = 'uahToUsd',
): string | null => {
    const parsedExchangeRate = parseAmount(exchangeRate ?? '');
    if (parsedExchangeRate <= 0) {
        return null;
    }

    const normalizedValue = value.replaceAll(' ', '').replace(',', '.').trim();
    if (!normalizedValue || Number.isNaN(Number.parseFloat(normalizedValue))) {
        return null;
    }

    const parsedCurrentAmount = parseAmount(value);
    const convertedAmount =
        direction === 'uahToUsd' ? parsedCurrentAmount / parsedExchangeRate : parsedCurrentAmount * parsedExchangeRate;

    const roundedConvertedAmount = roundToTwoDecimals(convertedAmount);

    return Number.isFinite(roundedConvertedAmount) ? formatNumberDecimalComma(roundedConvertedAmount) : null;
};
