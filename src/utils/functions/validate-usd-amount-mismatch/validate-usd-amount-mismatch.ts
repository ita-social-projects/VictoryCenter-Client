import { getConvertedAmount } from '@/utils/functions/get-converted-amount/get-converted-amount';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';

const hasPositiveAmount = (value: string | null | undefined): boolean => {
    return parseAmount(value ?? '') > 0;
};

export const isUsdAmountMismatch = (
    amountUah: string,
    amountUsd: string,
    exchangeRate: string | null | undefined,
): boolean => {
    if (!hasPositiveAmount(amountUah) || !hasPositiveAmount(amountUsd) || !hasPositiveAmount(exchangeRate)) {
        return false;
    }

    const expectedUsd = getConvertedAmount(amountUah, 'amountUah', exchangeRate);
    if (expectedUsd === null) {
        return false;
    }

    const normalizedUsd = Number.parseFloat(parseAmount(amountUsd).toFixed(2));

    return Math.abs(normalizedUsd - Number.parseFloat(expectedUsd)) > 0.000001;
};
