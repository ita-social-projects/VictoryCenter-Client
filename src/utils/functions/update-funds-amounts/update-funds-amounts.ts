import { getConvertedAmount } from '@/utils/functions/get-converted-amount/get-converted-amount';
import {
    normalizeFundsExpendituresAmountInput,
    validateFundsExpendituresAmount,
} from '@/validation/admin/reports-schema/funds-expenditures-record-schema/funds-expenditures-record-schema';

export interface FundsAmountsState {
    amountUah: string;
    amountUsd: string;
    errors: {
        amountUah?: string;
        amountUsd?: string;
    };
}

export const updateFundsAmounts = (
    field: 'amountUah' | 'amountUsd',
    value: string,
    exchangeRate: string | null,
    trigger: 'change' | 'blur',
): ((prev: FundsAmountsState) => FundsAmountsState) => {
    return (prev: FundsAmountsState) => {
        const shouldNormalize = trigger === 'blur';
        const normalized = normalizeFundsExpendituresAmountInput(value, shouldNormalize);
        const currentFieldError = validateFundsExpendituresAmount(normalized, trigger);

        let nextAmountUah = field === 'amountUah' ? normalized : prev.amountUah;
        let nextAmountUsd = field === 'amountUsd' ? normalized : prev.amountUsd;
        let nextAmountUahError = field === 'amountUah' ? currentFieldError : prev.errors.amountUah;
        let nextAmountUsdError = field === 'amountUsd' ? currentFieldError : prev.errors.amountUsd;

        if (!currentFieldError) {
            const convertedAmount = getConvertedAmount(normalized, field, exchangeRate);

            if (convertedAmount !== null) {
                if (field === 'amountUah') {
                    nextAmountUsd = convertedAmount;
                    nextAmountUsdError = validateFundsExpendituresAmount(convertedAmount, trigger);
                } else {
                    nextAmountUah = convertedAmount;
                    nextAmountUahError = validateFundsExpendituresAmount(convertedAmount, trigger);
                }
            }
        }

        return {
            ...prev,
            amountUah: nextAmountUah,
            amountUsd: nextAmountUsd,
            errors: {
                ...prev.errors,
                amountUah: nextAmountUahError,
                amountUsd: nextAmountUsdError,
            },
        };
    };
};
