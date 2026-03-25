import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';

export const getConvertedAmount = (
    value: string,
    field: 'amountUah' | 'amountUsd',
    exchangeRate: string | null | undefined,
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
        field === 'amountUah' ? parsedCurrentAmount / parsedExchangeRate : parsedCurrentAmount * parsedExchangeRate;

    const roundedConvertedAmount = Number.parseFloat(convertedAmount.toFixed(2));

    return Number.isFinite(roundedConvertedAmount) ? String(roundedConvertedAmount) : null;
};
