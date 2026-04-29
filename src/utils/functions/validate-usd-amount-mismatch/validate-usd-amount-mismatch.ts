import { getConvertedAmount } from '@/utils/functions/get-converted-amount/get-converted-amount';
import { parseAmount } from '@/utils/functions/parse-amount/parse-amount';

export const isUsdAmountMismatch = (
    amountUah: string,
    amountUsd: string,
    exchangeRate: string | null | undefined,
): boolean => {
    if (parseAmount(amountUah) <= 0 || parseAmount(amountUsd) <= 0 || parseAmount(exchangeRate ?? '') <= 0) {
        return false;
    }

    const expectedUsd = getConvertedAmount(amountUah, exchangeRate);
    if (expectedUsd === null) {
        return false;
    }

    const normalizedUsd = Number.parseFloat(parseAmount(amountUsd).toFixed(2));

    return Math.abs(normalizedUsd - parseAmount(expectedUsd)) > 0.000001;
};
