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
        const currentFieldError = validateFundsExpendituresAmount(value, trigger);

        let nextAmountUah = field === 'amountUah' ? normalized : prev.amountUah;
        let nextAmountUsd = field === 'amountUsd' ? normalized : prev.amountUsd;
        let nextAmountUahError = field === 'amountUah' ? currentFieldError : prev.errors.amountUah;
        let nextAmountUsdError = field === 'amountUsd' ? currentFieldError : prev.errors.amountUsd;

        if (field === 'amountUah') {
            if (normalized === '') {
                nextAmountUsd = '';
                nextAmountUsdError = undefined;
            }

            if (normalized !== '' && !currentFieldError) {
                const convertedAmount = getConvertedAmount(normalized, exchangeRate);

                if (convertedAmount !== null) {
                    nextAmountUsd = convertedAmount;
                    nextAmountUsdError = validateFundsExpendituresAmount(convertedAmount, trigger);
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
